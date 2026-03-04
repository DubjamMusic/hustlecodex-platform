#!/bin/bash

set -euo pipefail

if ! command -v jq &> /dev/null; then
    echo "jq is required but it's not installed. Aborting."
    exit 1
fi

GITHUB_TOKEN=${GITHUB_TOKEN:-}

if [[ -z "${GITHUB_TOKEN}" ]]; then
    echo "GITHUB_TOKEN is not set. Authentication might fail."
fi

# Get open pull requests
PRs=$(curl -s -H "Authorization: token ${GITHUB_TOKEN}" -H "Accept: application/vnd.github.v3+json" https://api.github.com/repos/DubjamMusic/hustlecodex-platform/pulls | jq -c '.[]')

# Iterate through each PR and get the latest workflow run status
for PR in $PRs; do
    PR_NUMBER=$(echo $PR | jq -r '.number')
    HEAD_SHA=$(echo $PR | jq -r '.head.sha')
    WORKFLOW_RUN_STATUS=$(curl -s -H "Authorization: token ${GITHUB_TOKEN}" -H "Accept: application/vnd.github.v3+json" "https://api.github.com/repos/DubjamMusic/hustlecodex-platform/commits/$HEAD_SHA/check-runs" | jq -r '.check_runs | sort_by(.created_at) | last')

    if [ -z "$WORKFLOW_RUN_STATUS" ]; then
        echo "PR #${PR_NUMBER}: No check runs found for HEAD SHA ${HEAD_SHA}"
    else
        echo "PR #${PR_NUMBER}: Latest status: ";
        echo "$WORKFLOW_RUN_STATUS" | jq '.status, .conclusion'
    fi
done
