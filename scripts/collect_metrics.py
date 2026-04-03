"""Collect GitHub Enterprise Cloud metrics using an installation token.

The script is designed to be called from the ``collect-metrics`` GitHub
Actions workflow.  It authenticates with the GitHub REST API using the token
that the workflow generates from the registered GitHub App, then prints a
summary of key organisation metrics to standard output.

Required environment variables
-------------------------------
GITHUB_TOKEN
    A GitHub App installation access token (or a classic PAT with the
    appropriate scopes for local testing).  The Actions workflow sets this
    from the ``actions/create-github-app-token`` step output.
GITHUB_ORG
    The login name of the GitHub Enterprise Cloud organisation whose metrics
    should be collected (e.g. ``my-org``).
"""

from __future__ import annotations

import json
import os
import sys
from datetime import datetime, timezone

import requests


BASE_URL = "https://api.github.com"


def get_headers(token: str) -> dict[str, str]:
    return {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }


def paginate(url: str, headers: dict[str, str]) -> list[dict]:
    """Fetch all pages for a list endpoint and return the combined results."""
    results: list[dict] = []
    while url:
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        data = response.json()
        if isinstance(data, list):
            results.extend(data)
        else:
            results.append(data)
        url = response.links.get("next", {}).get("url", "")
    return results


def collect_metrics(token: str, org: str) -> dict:
    """Return a dictionary of Enterprise Cloud metrics for *org*."""
    headers = get_headers(token)
    metrics: dict = {
        "organization": org,
        "collected_at": datetime.now(timezone.utc).isoformat(),
    }

    # --- Organisation details ---
    org_response = requests.get(
        f"{BASE_URL}/orgs/{org}", headers=headers, timeout=30
    )
    org_response.raise_for_status()
    org_data = org_response.json()

    metrics["plan"] = org_data.get("plan", {}).get("name", "unknown")
    metrics["total_private_repos"] = org_data.get("total_private_repos", 0)
    metrics["public_repos"] = org_data.get("public_repos", 0)
    metrics["owned_private_repos"] = org_data.get("owned_private_repos", 0)

    # --- Members ---
    members = paginate(
        f"{BASE_URL}/orgs/{org}/members?per_page=100", headers
    )
    metrics["total_members"] = len(members)

    # --- Repositories ---
    repos = paginate(
        f"{BASE_URL}/orgs/{org}/repos?type=all&per_page=100", headers
    )
    metrics["total_repos"] = len(repos)

    # --- GitHub Actions: billing / usage ---
    billing_response = requests.get(
        f"{BASE_URL}/orgs/{org}/settings/billing/actions",
        headers=headers,
        timeout=30,
    )
    if billing_response.status_code == 200:
        billing = billing_response.json()
        metrics["actions_minutes_used"] = billing.get(
            "total_minutes_used", "n/a"
        )
        metrics["actions_minutes_included"] = billing.get(
            "included_minutes", "n/a"
        )
        metrics["actions_minutes_paid"] = billing.get(
            "total_paid_minutes_used", "n/a"
        )
    else:
        metrics["actions_billing"] = (
            f"unavailable (HTTP {billing_response.status_code})"
        )

    # --- Storage: packages billing ---
    storage_response = requests.get(
        f"{BASE_URL}/orgs/{org}/settings/billing/packages",
        headers=headers,
        timeout=30,
    )
    if storage_response.status_code == 200:
        storage = storage_response.json()
        metrics["storage_bandwidth_gb_used"] = storage.get(
            "total_gigabytes_bandwidth_used", "n/a"
        )
        metrics["storage_bandwidth_gb_paid"] = storage.get(
            "total_paid_gigabytes_bandwidth_used", "n/a"
        )
    else:
        metrics["storage_billing"] = (
            f"unavailable (HTTP {storage_response.status_code})"
        )

    return metrics


def main() -> None:
    token = os.environ.get("GITHUB_TOKEN")
    org = os.environ.get("GITHUB_ORG")

    if not token:
        print("ERROR: GITHUB_TOKEN environment variable is not set.", file=sys.stderr)
        sys.exit(1)
    if not org:
        print("ERROR: GITHUB_ORG environment variable is not set.", file=sys.stderr)
        sys.exit(1)

    metrics = collect_metrics(token, org)
    print(json.dumps(metrics, indent=2))


if __name__ == "__main__":
    main()
