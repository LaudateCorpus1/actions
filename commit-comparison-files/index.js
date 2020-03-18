const github = require('@actions/github');
const core = require('@actions/core');
const isEmpty = require('lodash.isempty');
const minimatch = require('minimatch');

async function run() {
  try {
    const delimiter = core.getInput('delimiter') || ' ';
    const token = core.getInput('token', { required: true });
    const baseRef = core.getInput('baseRef', { required: true });
    const headRef = core.getInput('headRef', { required: true });
    const { owner, repo } = github.context.repo;

    const octokit = new github.GitHub(token);

    const response = await octokit.repos.compareCommits({
      owner,
      repo,
      base: baseRef,
      head: headRef,
    });

    const files = response.data.files.map(file => file.filename);
    const fileFilters = Array.from(Object.entries(process.env)).reduce(
      (filters, [key, value]) => {
        if (/INPUT_(\w+)_FILES/.test(key)) {
          filters[key.toLowerCase().replace('input_', '')] = value;
        }
        return filters;
      },
      {}
    );

    if (isEmpty(fileFilters)) {
      core.setFailed('No file filters were provided.');

      return;
    }

    for (const filter in fileFilters) {
      if (Object.prototype.hasOwnProperty.call(fileFilters, filter)) {
        const minimatchFilter = minimatch.filter(fileFilters[filter]);
        const matches = files.filter(minimatchFilter);

        core.setOutput(filter, matches.join(delimiter));
      }
    }
  } catch (e) {
    core.setFailed(`Action failed with error ${e}`);
  }
}

run();
