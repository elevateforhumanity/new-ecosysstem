#!/bin/bash
# Commit and push changes to your GitHub repository for Netlify deployment

git add .
git commit -m "Update Netlify redirects and remove _redirects file"
git push

echo "Changes pushed. Check your Netlify dashboard for deployment status."