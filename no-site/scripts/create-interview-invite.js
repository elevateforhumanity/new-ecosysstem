#!/usr/bin/env node

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';

const outputDir = process.env.OUTPUT_DIR || '.autopilot_out';
const invitesDir = path.join(outputDir, 'invites');

// Ensure output directory exists
if (!fs.existsSync(invitesDir)) {
  fs.mkdirSync(invitesDir, { recursive: true });
}

function formatDateForICS(date) {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function generateICS(interview) {
  const startDate = new Date(interview.date + 'T' + interview.time);
  const endDate = new Date(startDate.getTime() + interview.duration * 60000);
  
  const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Elevate for Humanity//Autopilot//EN
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
UID:${Date.now()}-${Math.random().toString(36).substr(2, 9)}@elevateforhumanity.org
DTSTAMP:${formatDateForICS(new Date())}
DTSTART:${formatDateForICS(startDate)}
DTEND:${formatDateForICS(endDate)}
SUMMARY:${interview.type} Interview - ${interview.candidateName}
DESCRIPTION:${interview.type} interview with ${interview.candidateName} for ${interview.position}\\n\\nMeeting Link: ${interview.meetingLink || 'TBD'}\\n\\nNotes: ${interview.notes || 'None'}
LOCATION:${interview.location || 'Remote'}
ORGANIZER;CN=${interview.organizerName}:mailto:${interview.organizerEmail}
ATTENDEE;CN=${interview.candidateName};RSVP=TRUE:mailto:${interview.candidateEmail}
${interview.interviewers.map(i => `ATTENDEE;CN=${i.name};RSVP=TRUE:mailto:${i.email}`).join('\n')}
STATUS:CONFIRMED
SEQUENCE:0
BEGIN:VALARM
TRIGGER:-PT15M
ACTION:DISPLAY
DESCRIPTION:Interview reminder
END:VALARM
END:VEVENT
END:VCALENDAR`;
  
  return ics;
}

async function createInterviewInvite() {
  console.log(chalk.bold.blue('\n📅 Create Interview Invite (ICS)\n'));
  
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'candidateName',
      message: 'Candidate name:',
      validate: (input) => input.length > 0 || 'Name is required',
    },
    {
      type: 'input',
      name: 'candidateEmail',
      message: 'Candidate email:',
      validate: (input) => input.includes('@') || 'Valid email required',
    },
    {
      type: 'input',
      name: 'position',
      message: 'Position:',
      default: 'Full-Stack Developer',
    },
    {
      type: 'list',
      name: 'type',
      message: 'Interview type:',
      choices: [
        'Phone Screen',
        'Technical Interview',
        'Behavioral Interview',
        'Panel Interview',
        'Final Interview',
      ],
    },
    {
      type: 'input',
      name: 'date',
      message: 'Date (YYYY-MM-DD):',
      default: () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
      },
      validate: (input) => {
        const date = new Date(input);
        return !isNaN(date.getTime()) || 'Invalid date format';
      },
    },
    {
      type: 'input',
      name: 'time',
      message: 'Time (HH:MM in 24h format):',
      default: '14:00',
      validate: (input) => {
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(input) || 'Invalid time format';
      },
    },
    {
      type: 'number',
      name: 'duration',
      message: 'Duration (minutes):',
      default: 60,
    },
    {
      type: 'input',
      name: 'location',
      message: 'Location:',
      default: 'Remote - Zoom',
    },
    {
      type: 'input',
      name: 'meetingLink',
      message: 'Meeting link (optional):',
    },
    {
      type: 'input',
      name: 'organizerName',
      message: 'Your name:',
      default: process.env.ORG_NAME || 'Elevate for Humanity',
    },
    {
      type: 'input',
      name: 'organizerEmail',
      message: 'Your email:',
      default: process.env.ORG_EMAIL || 'hiring@elevateforhumanity.org',
    },
    {
      type: 'confirm',
      name: 'addInterviewers',
      message: 'Add additional interviewers?',
      default: false,
    },
  ]);
  
  const interviewers = [];
  if (answers.addInterviewers) {
    let addMore = true;
    while (addMore) {
      const interviewer = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: 'Interviewer name:',
        },
        {
          type: 'input',
          name: 'email',
          message: 'Interviewer email:',
        },
      ]);
      interviewers.push(interviewer);
      
      const { more } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'more',
          message: 'Add another interviewer?',
          default: false,
        },
      ]);
      addMore = more;
    }
  }
  
  answers.interviewers = interviewers;
  
  const spinner = ora('Generating ICS file...').start();
  
  try {
    const icsContent = generateICS(answers);
    const filename = `interview-${answers.candidateName.toLowerCase().replace(/\s+/g, '-')}-${answers.date}.ics`;
    const filepath = path.join(invitesDir, filename);
    
    fs.writeFileSync(filepath, icsContent, 'utf8');
    
    spinner.succeed(chalk.green('ICS file created successfully!'));
    
    console.log(chalk.cyan('\n📁 File location:'), filepath);
    console.log(chalk.gray('\nYou can now:'));
    console.log(chalk.gray('  • Email this file to the candidate'));
    console.log(chalk.gray('  • Import into Google Calendar, Outlook, or Apple Calendar'));
    console.log(chalk.gray('  • The candidate can accept/decline the invite\n'));
    
    // Show summary
    console.log(chalk.cyan('Interview Summary:'));
    console.log(chalk.gray(`  Candidate: ${answers.candidateName} (${answers.candidateEmail})`));
    console.log(chalk.gray(`  Position: ${answers.position}`));
    console.log(chalk.gray(`  Type: ${answers.type}`));
    console.log(chalk.gray(`  Date: ${answers.date} at ${answers.time}`));
    console.log(chalk.gray(`  Duration: ${answers.duration} minutes`));
    console.log(chalk.gray(`  Location: ${answers.location}`));
    if (answers.meetingLink) {
      console.log(chalk.gray(`  Link: ${answers.meetingLink}`));
    }
    if (interviewers.length > 0) {
      console.log(chalk.gray(`  Additional interviewers: ${interviewers.map(i => i.name).join(', ')}`));
    }
    console.log('');
    
  } catch (error) {
    spinner.fail(chalk.red('Failed to create ICS file'));
    console.error(chalk.red('\nError:'), error.message);
    process.exit(1);
  }
}

// Run the creator
createInterviewInvite();
