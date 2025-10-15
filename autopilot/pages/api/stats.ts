import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { Octokit } from '@octokit/rest';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Fetch candidates count
    const { count: candidatesCount, error: candidatesError } = await supabase
      .from('candidates')
      .select('*', { count: 'exact', head: true });

    if (candidatesError) throw candidatesError;

    // Fetch interviews count
    const { count: interviewsCount, error: interviewsError } = await supabase
      .from('interviews')
      .select('*', { count: 'exact', head: true });

    if (interviewsError) throw interviewsError;

    // Fetch job postings count
    const { count: jobPostingsCount, error: jobPostingsError } = await supabase
      .from('job_postings')
      .select('*', { count: 'exact', head: true });

    if (jobPostingsError) throw jobPostingsError;

    // Fetch GitHub issues count (if token is available)
    let githubIssues = 0;
    if (process.env.GITHUB_TOKEN) {
      try {
        const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
        const { data } = await octokit.issues.listForRepo({
          owner: process.env.GITHUB_OWNER || 'elevateforhumanity',
          repo: process.env.GITHUB_REPO || 'ecosystem2',
          state: 'open',
          per_page: 1,
        });
        githubIssues = data.length;
      } catch (error) {
        console.error('Failed to fetch GitHub issues:', error);
      }
    }

    res.status(200).json({
      candidates: candidatesCount || 0,
      interviews: interviewsCount || 0,
      jobPostings: jobPostingsCount || 0,
      githubIssues,
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch stats',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
