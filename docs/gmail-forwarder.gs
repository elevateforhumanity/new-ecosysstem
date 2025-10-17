/**
 * Gmail Apps Script Email Forwarder
 *
 * This script forwards incoming emails to your AI employee webhook.
 *
 * Setup:
 * 1. Open https://script.google.com
 * 2. Create a new project
 * 3. Paste this code
 * 4. Set WEBHOOK_URL in the script properties
 * 5. Set up a time-driven trigger to run processInbox() every 1-5 minutes
 * 6. Authorize the script to access your Gmail
 *
 * Script Properties:
 * - WEBHOOK_URL: https://your-worker.workers.dev/webhooks/inbound
 * - WEBHOOK_SECRET: (optional) shared secret for authentication
 */

// Configuration
const WEBHOOK_URL =
  PropertiesService.getScriptProperties().getProperty('WEBHOOK_URL');
const WEBHOOK_SECRET =
  PropertiesService.getScriptProperties().getProperty('WEBHOOK_SECRET');
const LABEL_NAME = 'AI-Processed'; // Label to mark processed emails

/**
 * Process unread emails in inbox
 */
function processInbox() {
  if (!WEBHOOK_URL) {
    Logger.log('ERROR: WEBHOOK_URL not set in script properties');
    return;
  }

  // Get or create label
  let label = GmailApp.getUserLabelByName(LABEL_NAME);
  if (!label) {
    label = GmailApp.createLabel(LABEL_NAME);
  }

  // Get unread threads (limit to 10 per run to avoid timeout)
  const threads = GmailApp.getInboxThreads(0, 10);

  for (const thread of threads) {
    const messages = thread.getMessages();

    for (const message of messages) {
      // Skip if already processed
      if (
        message.isInTrash() ||
        message.getLabels().some((l) => l.getName() === LABEL_NAME)
      ) {
        continue;
      }

      try {
        // Extract email data
        const emailData = {
          From: message.getFrom(),
          FromName: extractName(message.getFrom()),
          FromEmail: extractEmail(message.getFrom()),
          To: message.getTo(),
          Subject: message.getSubject(),
          TextBody: message.getPlainBody(),
          HtmlBody: message.getBody(),
          Date: message.getDate().toISOString(),
          MessageId: message.getId(),
          Attachments: [],
        };

        // Handle attachments
        const attachments = message.getAttachments();
        for (const attachment of attachments) {
          emailData.Attachments.push({
            Name: attachment.getName(),
            ContentType: attachment.getContentType(),
            ContentLength: attachment.getSize(),
            Content: Utilities.base64Encode(attachment.getBytes()),
          });
        }

        // Send to webhook
        const options = {
          method: 'post',
          contentType: 'application/json',
          payload: JSON.stringify(emailData),
          headers: {},
        };

        // Add authentication if secret is set
        if (WEBHOOK_SECRET) {
          options.headers['X-Webhook-Secret'] = WEBHOOK_SECRET;
        }

        const response = UrlFetchApp.fetch(WEBHOOK_URL, options);

        if (response.getResponseCode() === 200) {
          // Mark as processed
          message.markRead();
          thread.addLabel(label);
          Logger.log(`Processed: ${message.getSubject()}`);
        } else {
          Logger.log(
            `ERROR: Webhook returned ${response.getResponseCode()} for ${message.getSubject()}`
          );
        }
      } catch (error) {
        Logger.log(`ERROR processing message: ${error.message}`);
      }
    }
  }
}

/**
 * Extract email address from "Name <email@example.com>" format
 */
function extractEmail(fromString) {
  const match = fromString.match(/<(.+?)>/);
  return match ? match[1] : fromString;
}

/**
 * Extract name from "Name <email@example.com>" format
 */
function extractName(fromString) {
  const match = fromString.match(/^(.+?)\s*</);
  return match ? match[1].trim() : '';
}

/**
 * Test function - process a single email
 */
function testProcessEmail() {
  const threads = GmailApp.getInboxThreads(0, 1);
  if (threads.length === 0) {
    Logger.log('No emails in inbox');
    return;
  }

  const message = threads[0].getMessages()[0];
  Logger.log('Testing with email: ' + message.getSubject());

  processInbox();
}

/**
 * Setup function - creates trigger
 */
function setupTrigger() {
  // Delete existing triggers
  const triggers = ScriptApp.getProjectTriggers();
  for (const trigger of triggers) {
    if (trigger.getHandlerFunction() === 'processInbox') {
      ScriptApp.deleteTrigger(trigger);
    }
  }

  // Create new trigger to run every 5 minutes
  ScriptApp.newTrigger('processInbox').timeBased().everyMinutes(5).create();

  Logger.log('Trigger created: processInbox will run every 5 minutes');
}
