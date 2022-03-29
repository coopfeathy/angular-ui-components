#!/usr/bin/env node

/**
 * Script that notifies Slack about the currently failing job. This script
 * will be a noop when running for forked builds (i.e. PRs).
 */

const {
  isVersionBranch,
  getConfig,
  assertValidGithubConfig,
} = require('@angular/dev-infra-private/ng-dev');

if (process.env.CIRCLE_PR_NUMBER) {
  console.info('Skipping notifications for pull requests.');
  process.exit(0);
}

const {
  CIRCLE_JOB: jobName,
  CIRCLE_BRANCH: branchName,
  CIRCLE_BUILD_URL: jobUrl,
  SLACK_COMPONENTS_CI_FAILURES_WEBHOOK_URL: webhookUrl,
} = process.env;

const {github} = getConfig([assertValidGithubConfig]);
const isPublishBranch = isVersionBranch(branchName) || branchName === github.mainBranchName;

// We don't want to spam the CI failures channel with e.g. Renovate branch failures.
if (isPublishBranch === false) {
  console.info('Skipping notifications for non-publish branches.');
  process.exit(0);
}

const {echo, set} = require('shelljs');

const text = `\`${jobName}\` failed in branch: ${branchName}: ${jobUrl}`;
const payload = {text};
const [channelName] = process.argv.slice(2);

set('-e');

// If an explicit channel has been specified, override the default
// webhook channel to the specified one.
if (channelName !== undefined) {
  payload.channel = channelName;
}

echo(JSON.stringify(payload, null, 2)).exec(
  `curl -d@- -H "Content-Type: application/json" ${webhookUrl}`,
);
console.info('Notified Slack about job failure.');
