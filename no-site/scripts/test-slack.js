#!/usr/bin/env node

import 'dotenv/config';
import axios from 'axios';
import chalk from 'chalk';
import ora from 'ora';

const slackToken = process.env.SLACK_BOT_TOKEN;
const slackChannel = process.env.SLACK_HIRING_CHANNEL || 'hiring-alerts';

if (!slackToken) {
  console.error(chalk.red('❌ SLACK_BOT_TOKEN not set in .env'));
  console.log(chalk.yellow('\nTo set up Slack integration:'));
  console.log(chalk.gray('  1. Create a Slack app: https://api.slack.com/apps'));
  console.log(chalk.gray('  2. Add bot token scopes: chat:write, chat:write.public'));
  console.log(chalk.gray('  3. Install app to workspace'));
  console.log(chalk.gray('  4. Copy Bot User OAuth Token to .env\n'));
  process.exit(1);
}

async function sendSlackMessage(message) {
  try {
    const response = await axios.post(
      'https://slack.com/api/chat.postMessage',
      {
        channel: slackChannel,
        text: message.text,
        blocks: message.blocks,
      },
      {
        headers: {
          'Authorization': `Bearer ${slackToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (!response.data.ok) {
      throw new Error(response.data.error || 'Unknown Slack API error');
    }
    
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.error || error.message);
    }
    throw error;
  }
}

async function testSlackIntegration() {
  console.log(chalk.bold.blue('\n💬 Slack Integration Test\n'));
  console.log(chalk.cyan('Channel:'), slackChannel);
  console.log('');
  
  const spinner = ora('Sending test message...').start();
  
  try {
    const testMessage = {
      text: '🤖 EFH Autopilot Test Message',
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🤖 EFH Autopilot Test',
            emoji: true,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: 'This is a test message from the EFH Autopilot CLI.\n\nIf you can see this, Slack integration is working! ✅',
          },
        },
        {
          type: 'divider',
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: '*Status:*\nConnected',
            },
            {
              type: 'mrkdwn',
              text: '*Time:*\n' + new Date().toLocaleString(),
            },
          ],
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: '🔗 <https://github.com/elevateforhumanity/fix2|View on GitHub>',
            },
          ],
        },
      ],
    };
    
    await sendSlackMessage(testMessage);
    
    spinner.succeed(chalk.green('Test message sent successfully!'));
    
    console.log(chalk.cyan('\n✅ Slack integration is working'));
    console.log(chalk.gray('   Check your Slack channel for the test message\n'));
    
    // Show example of hiring alert
    console.log(chalk.cyan('Example hiring alert:\n'));
    console.log(chalk.gray('  When a new candidate applies, you\'ll receive:'));
    console.log(chalk.gray('  • Candidate name and position'));
    console.log(chalk.gray('  • Resume/portfolio links'));
    console.log(chalk.gray('  • Quick action buttons'));
    console.log(chalk.gray('  • Direct link to candidate profile\n'));
    
  } catch (error) {
    spinner.fail(chalk.red('Failed to send test message'));
    console.error(chalk.red('\nError:'), error.message);
    
    if (error.message.includes('channel_not_found')) {
      console.log(chalk.yellow('\n⚠️  Channel not found'));
      console.log(chalk.gray('   Make sure the channel exists and the bot is invited'));
      console.log(chalk.gray('   Invite the bot: /invite @your-bot-name\n'));
    } else if (error.message.includes('not_authed') || error.message.includes('invalid_auth')) {
      console.log(chalk.yellow('\n⚠️  Authentication failed'));
      console.log(chalk.gray('   Check that your SLACK_BOT_TOKEN is correct\n'));
    }
    
    process.exit(1);
  }
}

// Example function to send hiring alert (for reference)
export async function sendHiringAlert(candidate) {
  const message = {
    text: `🎯 New Candidate: ${candidate.full_name}`,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `🎯 New Candidate: ${candidate.full_name}`,
          emoji: true,
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Position:*\n${candidate.position}`,
          },
          {
            type: 'mrkdwn',
            text: `*Source:*\n${candidate.source || 'Direct'}`,
          },
          {
            type: 'mrkdwn',
            text: `*Email:*\n${candidate.email}`,
          },
          {
            type: 'mrkdwn',
            text: `*Phone:*\n${candidate.phone || 'Not provided'}`,
          },
        ],
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Links:*\n${candidate.linkedin_url ? `• <${candidate.linkedin_url}|LinkedIn>` : ''}${candidate.github_url ? `\n• <${candidate.github_url}|GitHub>` : ''}${candidate.portfolio_url ? `\n• <${candidate.portfolio_url}|Portfolio>` : ''}`,
        },
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: '✅ Review',
              emoji: true,
            },
            style: 'primary',
            url: `https://elevateforhumanity.org/autopilot/candidates/${candidate.id}`,
          },
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: '📧 Email',
              emoji: true,
            },
            url: `mailto:${candidate.email}`,
          },
        ],
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `Applied: ${new Date(candidate.created_at).toLocaleDateString()}`,
          },
        ],
      },
    ],
  };
  
  return await sendSlackMessage(message);
}

// Run the test
testSlackIntegration();
