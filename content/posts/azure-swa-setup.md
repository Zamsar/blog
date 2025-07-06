---
title: Azure SWA Initial Setup
description: Static Web Apps. Fast CI/CD. Live deployment.
date: 2025-07-01
slug: azure-swa-setup
---

This post details the first steps in deploying a static website using Azure Static Web Apps. We'll cover the basics of setting up a new resource, connecting it to GitHub, and getting your first site live with continuous deployment.

## Key Learnings

* **GitHub Integration:** Seamless connection for CI/CD.
* **Automatic Builds:** Workflow automation for deployment.
* **Free SSL:** HTTPS out-of-the-box.
* **Custom Domains:** Easy configuration for your custom domain.

### Deployment Process Overview

1.  **Code Commit:** Push changes to your GitHub repository.
2.  **GitHub Action Trigger:** The Azure Static Web Apps workflow automatically starts.
3.  **Build & Deploy:** Your site is built and deployed to Azure's global CDN.

This setup is ideal for personal projects, offering powerful features with minimal overhead. It allows developers to focus on content and code, not infrastructure.
