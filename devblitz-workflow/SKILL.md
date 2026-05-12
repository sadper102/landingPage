---
name: devblitz-workflow
description: Workflow and commands for DEVBLITZ project management including GitHub operations and Vercel deployment.
---

# DEVBLITZ Workflow

This skill provides standardized commands and procedures for managing DEVBLITZ projects, specifically focusing on source control via GitHub and deployment via Vercel.

## GitHub Operations

Use these patterns when the user needs to interact with GitHub.

### Initializing and Pushing to a New Repository
1. Initialize local repository (if not already done): `git init`
2. Add files: `git add .`
3. Commit: `git commit -m "Your message"`
4. Link to GitHub: `git remote add origin https://github.com/USERNAME/REPO_NAME.git`
5. Set branch: `git branch -M main`
6. Push: `git push -u origin main`

### Updating Changes
To save Vercel deployment limits, focus on committing changes locally and only push when ready for production.

1. **Stage Changes:** `git add .`
2. **Commit Locally:** `git commit -m "Your description of changes"`
3. **Push to Production (When Ready):** `git push`

> **Note:** Do NOT push after every small edit. Batch multiple commits together before pushing to GitHub to avoid hitting Vercel deployment limits.

## Vercel Deployment

Use these patterns for deploying and managing Vercel environments.

### Production Deployment (Manual)
Run this command for a direct production deploy:
`npx vercel --prod`

### Linking to GitHub (Recommended)
1. Ensure the project is pushed to GitHub.
2. Go to the [Vercel Dashboard](https://vercel.com/new).
3. Select the repository and click **Import**.
4. Configure framework (Standard Static if only index.html) and click **Deploy**.

## Project Maintenance

### Checking Status
- Git status: `git status`
- Vercel deployment info: `npx vercel list`
