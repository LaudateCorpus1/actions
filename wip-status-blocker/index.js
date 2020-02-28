const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const LABEL = core.getInput('label');

  if (!GITHUB_TOKEN) {
    core.setFailed('GITHUB_TOKEN is not set in environment.');
  }

  const octokit = new github.GitHub(GITHUB_TOKEN);

  const { owner, repo } = github.context.repo;
  const [, pull_number] = /refs\/pull\/(\d+)\/merge/g.exec(github.context.ref);
  const { data: pullRequest } = await octokit.pulls.get({
    owner,
    repo,
    pull_number,
  });

  const labels = pullRequest.labels.map(obj => obj.name);
  const blocked = labels.includes(LABEL);

  if (blocked) {
    core.error(`This PR has the '${LABEL}' label. Actions will be skipped while this label is preset.`);
    core.error(`To continue running Actions, remove the label, then push a new commit or manually re-run all jobs.`);
    core.setFailed();
  }
}

if (github.context.eventName === 'pull_request') {
  run();
}
