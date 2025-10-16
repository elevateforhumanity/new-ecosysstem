/**
 * Email Service (Gmail Alternative)
 * Provides institutional email with custom domain
 */

class EmailService {
  constructor() {
    this.mailboxes = new Map();
    this.messages = new Map();
    this.labels = new Map();
    this.filters = new Map();
    
    // Email server configuration
    this.smtpHost = process.env.SMTP_HOST || 'smtp.elevate.edu';
    this.imapHost = process.env.IMAP_HOST || 'imap.elevate.edu';
    this.domain = process.env.EMAIL_DOMAIN || 'elevate.edu';
  }

  /**
   * Create email account for user
   */
  async createAccount({ userId, firstName, lastName, preferredUsername }) {
    const username = preferredUsername || 
                     `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;
    const email = `${username}@${this.domain}`;
    
    const account = {
      id: `account_${Date.now()}`,
      userId,
      email,
      username,
      displayName: `${firstName} ${lastName}`,
      quota: 15 * 1024 * 1024 * 1024, // 15GB
      used: 0,
      status: 'active',
      createdAt: new Date(),
      settings: {
        signature: '',
        autoReply: false,
        forwardingAddress: null,
        labels: ['Inbox', 'Sent', 'Drafts', 'Trash', 'Spam'],
        filters: []
      }
    };
    
    this.mailboxes.set(userId, account);
    
    return account;
  }

  /**
   * Send email
   */
  async sendEmail({ from, to, cc = [], bcc = [], subject, body, attachments = [] }) {
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const message = {
      id: messageId,
      from,
      to: Array.isArray(to) ? to : [to],
      cc,
      bcc,
      subject,
      body,
      attachments,
      labels: ['Sent'],
      read: true,
      starred: false,
      important: false,
      sentAt: new Date(),
      threadId: null
    };
    
    this.messages.set(messageId, message);
    
    // In production, use nodemailer or similar
    console.log(`Email sent from ${from} to ${to.join(', ')}`);
    
    // Deliver to recipients
    message.to.forEach(recipient => {
      this.deliverEmail(recipient, message);
    });
    
    return message;
  }

  /**
   * Deliver email to recipient's inbox
   */
  async deliverEmail(recipientEmail, message) {
    const recipientAccount = Array.from(this.mailboxes.values())
      .find(acc => acc.email === recipientEmail);
    
    if (!recipientAccount) {
      console.log(`Recipient ${recipientEmail} not found, email bounced`);
      return;
    }
    
    const inboxMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      labels: ['Inbox'],
      read: false,
      receivedAt: new Date()
    };
    
    this.messages.set(inboxMessage.id, inboxMessage);
    
    // Check filters
    this.applyFilters(recipientAccount.userId, inboxMessage);
  }

  /**
   * Get inbox messages
   */
  async getInbox(userId, { label = 'Inbox', limit = 50, offset = 0 }) {
    const messages = [];
    
    this.messages.forEach(msg => {
      const account = this.mailboxes.get(userId);
      if (account && (msg.to.includes(account.email) || msg.from === account.email)) {
        if (msg.labels.includes(label)) {
          messages.push(msg);
        }
      }
    });
    
    return messages
      .sort((a, b) => (b.receivedAt || b.sentAt) - (a.receivedAt || a.sentAt))
      .slice(offset, offset + limit);
  }

  /**
   * Get message by ID
   */
  async getMessage(messageId, userId) {
    const message = this.messages.get(messageId);
    if (!message) throw new Error('Message not found');
    
    const account = this.mailboxes.get(userId);
    if (!account) throw new Error('Account not found');
    
    // Check if user has access
    if (!message.to.includes(account.email) && message.from !== account.email) {
      throw new Error('Access denied');
    }
    
    // Mark as read
    if (!message.read && message.to.includes(account.email)) {
      message.read = true;
      message.readAt = new Date();
    }
    
    return message;
  }

  /**
   * Search emails
   */
  async searchEmails(userId, query) {
    const account = this.mailboxes.get(userId);
    if (!account) throw new Error('Account not found');
    
    const results = [];
    const lowerQuery = query.toLowerCase();
    
    this.messages.forEach(msg => {
      if (msg.to.includes(account.email) || msg.from === account.email) {
        if (msg.subject.toLowerCase().includes(lowerQuery) ||
            msg.body.toLowerCase().includes(lowerQuery) ||
            msg.from.toLowerCase().includes(lowerQuery)) {
          results.push(msg);
        }
      }
    });
    
    return results;
  }

  /**
   * Create label
   */
  async createLabel(userId, labelName, color = '#4285f4') {
    const account = this.mailboxes.get(userId);
    if (!account) throw new Error('Account not found');
    
    if (!account.settings.labels.includes(labelName)) {
      account.settings.labels.push(labelName);
    }
    
    return { name: labelName, color };
  }

  /**
   * Apply label to message
   */
  async applyLabel(messageId, userId, labelName) {
    const message = this.messages.get(messageId);
    if (!message) throw new Error('Message not found');
    
    if (!message.labels.includes(labelName)) {
      message.labels.push(labelName);
    }
    
    return message;
  }

  /**
   * Create filter
   */
  async createFilter(userId, filter) {
    const account = this.mailboxes.get(userId);
    if (!account) throw new Error('Account not found');
    
    const newFilter = {
      id: `filter_${Date.now()}`,
      ...filter,
      createdAt: new Date()
    };
    
    account.settings.filters.push(newFilter);
    
    return newFilter;
  }

  /**
   * Apply filters to message
   */
  applyFilters(userId, message) {
    const account = this.mailboxes.get(userId);
    if (!account) return;
    
    account.settings.filters.forEach(filter => {
      let matches = true;
      
      if (filter.from && !message.from.includes(filter.from)) {
        matches = false;
      }
      
      if (filter.subject && !message.subject.includes(filter.subject)) {
        matches = false;
      }
      
      if (matches) {
        if (filter.addLabel) {
          message.labels.push(filter.addLabel);
        }
        if (filter.markAsRead) {
          message.read = true;
        }
        if (filter.archive) {
          message.labels = message.labels.filter(l => l !== 'Inbox');
        }
      }
    });
  }

  /**
   * Move to trash
   */
  async moveToTrash(messageId, userId) {
    const message = this.messages.get(messageId);
    if (!message) throw new Error('Message not found');
    
    message.labels = ['Trash'];
    message.trashedAt = new Date();
    
    return message;
  }

  /**
   * Delete permanently
   */
  async deletePermanently(messageId, userId) {
    this.messages.delete(messageId);
    return { success: true };
  }

  /**
   * Star message
   */
  async starMessage(messageId, userId, starred = true) {
    const message = this.messages.get(messageId);
    if (!message) throw new Error('Message not found');
    
    message.starred = starred;
    
    return message;
  }

  /**
   * Get storage usage
   */
  async getStorageUsage(userId) {
    const account = this.mailboxes.get(userId);
    if (!account) throw new Error('Account not found');
    
    let used = 0;
    
    this.messages.forEach(msg => {
      if (msg.to.includes(account.email) || msg.from === account.email) {
        used += msg.body.length;
        msg.attachments?.forEach(att => {
          used += att.size || 0;
        });
      }
    });
    
    return {
      used,
      quota: account.quota,
      percentage: (used / account.quota) * 100
    };
  }

  /**
   * Set auto-reply
   */
  async setAutoReply(userId, { enabled, subject, message, startDate, endDate }) {
    const account = this.mailboxes.get(userId);
    if (!account) throw new Error('Account not found');
    
    account.settings.autoReply = {
      enabled,
      subject,
      message,
      startDate,
      endDate
    };
    
    return account.settings.autoReply;
  }

  /**
   * Set email signature
   */
  async setSignature(userId, signature) {
    const account = this.mailboxes.get(userId);
    if (!account) throw new Error('Account not found');
    
    account.settings.signature = signature;
    
    return account;
  }
}

module.exports = new EmailService();
