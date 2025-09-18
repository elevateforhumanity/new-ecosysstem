# Netlify Domain Configuration Automation

This workflow automates the process of configuring your Netlify domain and resolving SSL issues whenever you push changes to the repository. It uses GitHub Actions to trigger the setup and update process.

## Workflow Steps
1. **Add Netlify Secrets to GitHub**
   - Go to your repository's Settings > Secrets and variables > Actions.
   - Add the following secrets:
     - `NETLIFY_AUTH_TOKEN`: Your Netlify personal access token.
     - `NETLIFY_SITE_ID`: The ID of your Netlify site.
     - (Optional) `NETLIFY_CUSTOM_DOMAIN`: Your custom domain name.

2. **Push Any Change**
   - After adding the secrets, push any change to the repository (e.g., update the README).
   - This will trigger the workflow and automatically configure your Netlify domain and SSL.

3. **SSL Issue Resolution**
   - The workflow will handle SSL certificate provisioning and renewal automatically through Netlify's API.

## Troubleshooting
- Ensure your Netlify token has sufficient permissions.
- Check the Actions tab for workflow logs and errors.
- For custom domains, make sure DNS records are correctly set up.

## References
- [Netlify API Documentation](https://docs.netlify.com/api/get-started/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
