import { graphql } from "@octokit/graphql";

async function convertLabelsToIds(labels, token, login, repository) {
  const convertedLabels = await Promise.all(
    labels.map(
      async (label) => await labelNameToId(token, login, repository, label)
    )
  );

  const invalidLabels = convertedLabels
    .filter((result) => result.err !== undefined)
    .map((result) => result.label);

  const labelIds = convertedLabels
    .filter((result) => result.id !== undefined)
    .map((result) => result.id);
  return { invalidLabels, labelIds };
}

export async function addLabel(token, login, repository, labelableId, labels) {
  try {
    const { invalidLabels, labelIds } = await convertLabelsToIds(
      labels,
      token,
      login,
      repository
    );

    await graphql(
      `
        mutation ($labelableId: ID!, $labelIds: [ID!]!) {
          addLabelsToLabelable(
            input: { labelableId: $labelableId, labelIds: $labelIds }
          ) {
            clientMutationId
          }
        }
      `,
      {
        labelableId,
        labelIds,
        headers: {
          authorization: `token ${token}`,
        },
      }
    );

    if (invalidLabels.length > 0) {
      const comment = `I wasn't able to add the following labels: ${invalidLabels.join(
        ","
      )}

Check that [the label exists](https://github.com/${login}/${repository}/labels) and is spelt right then try again.
      `;

      await reportError(token, labelableId, comment);
    }
  } catch (error) {
    console.error("Failed to add label", error);

    console.error(JSON.stringify(error.errors));
  }
}

async function labelNameToId(token, login, repository, labelName) {
  const result = await graphql(
    `
      query ($login: String!, $repository: String!, $labelName: String!) {
        repositoryOwner(login: $login) {
          repository(name: $repository) {
            label(name: $labelName) {
              id
            }
          }
        }
      }
    `,
    {
      login,
      repository,
      labelName,
      headers: {
        authorization: `token ${token}`,
      },
    }
  );

  if (!result.repositoryOwner.repository.label) {
    return {
      err: "NOT_FOUND",
      label: labelName,
    };
  }

  return {
    id: result.repositoryOwner.repository.label.id,
  };
}

export async function removeLabel(
  token,
  login,
  repository,
  labelableId,
  labels
) {
  try {
    const { invalidLabels, labelIds } = await convertLabelsToIds(
      labels,
      token,
      login,
      repository
    );

    await graphql(
      `
        mutation ($labelableId: ID!, $labelIds: [ID!]!) {
          removeLabelsFromLabelable(
            input: { labelableId: $labelableId, labelIds: $labelIds }
          ) {
            clientMutationId
          }
        }
      `,
      {
        labelableId,
        labelIds,
        headers: {
          authorization: `token ${token}`,
        },
      }
    );

    if (invalidLabels.length > 0) {
      const comment = `I wasn't able to remove the following labels: ${invalidLabels.join(
        ","
      )}

Check that [the label exists](https://github.com/${login}/${repository}/labels) and is spelt right then try again.
      `;

      await reportError(token, labelableId, comment);
    }
  } catch (error) {
    console.error("Failed to add label", error);

    console.error(JSON.stringify(error.errors));
  }
}

async function lookupUser(token, username, originalUser) {
  const result = await graphql(
    `
      query ($login: String!) {
        repositoryOwner(login: $login) {
          ... on User {
            id
          }
        }
      }
    `,
    {
      login: username,
      headers: {
        authorization: `token ${token}`,
      },
    }
  );

  if (!result.repositoryOwner) {
    return {
      err: "NOT_FOUND",
      user: originalUser,
    };
  }

  return {
    id: result.repositoryOwner?.id,
  };
}

async function lookupTeam(token, organization, teamName, originalTeamName) {
  const result = await graphql(
    `
      query ($login: String!, $teamName: String!) {
        organization(login: $login) {
          team(slug: $teamName) {
            id
          }
        }
      }
    `,
    {
      login: organization,
      teamName: teamName,
      headers: {
        authorization: `token ${token}`,
      },
    }
  );

  if (!result.organization.team) {
    return {
      err: "NOT_FOUND",
      team: originalTeamName,
    };
  }

  return {
    id: result.organization.team.id,
  };
}

export async function reportError(token, subjectId, comment) {
  await graphql(
    `
      mutation ($comment: String!, $subjectId: ID!) {
        addComment(input: { subjectId: $subjectId, body: $comment }) {
          commentEdge {
            node {
              id
            }
          }
        }
      }
    `,
    {
      comment,
      subjectId,
      headers: {
        authorization: `token ${token}`,
      },
    }
  );
}

export async function reopenIssue(token, sourceRepo, issueId) {
  try {
    await graphql(
      `
        mutation ($issue: ID!) {
          reopenIssue(input: { issueId: $issue }) {
            issue {
              url
            }
          }
        }
      `,
      {
        issue: issueId,
        headers: {
          authorization: `token ${token}`,
        },
      }
    );
  } catch (error) {
    console.error("Failed to reopen issue", error);

    console.error(JSON.stringify(error.errors));
  }
}

export async function requestReviewers(
  token,
  organization,
  sourceRepo,
  issueId,
  users,
  teams
) {
  try {
    const convertedUsers = await Promise.all(
      users
        .map((user) => {
          return {
            original_user: user,
            user: user.replace(/^@/, ""),
          };
        })
        .map(
          async (result) =>
            await lookupUser(token, result.user, result.original_user)
        )
    );

    const invalidUsers = convertedUsers
      .filter((result) => result.err !== undefined)
      .map((result) => result.user);

    const userIds = convertedUsers
      .filter((result) => result.id !== undefined)
      .map((result) => result.id);

    const convertedTeams = await Promise.all(
      teams
        .map((teamSlug) => {
          return {
            original_team: teamSlug,
            team: teamSlug.replace(`@${organization}/`, ""),
          };
        })
        .map(
          async (result) =>
            await lookupTeam(
              token,
              organization,
              result.team,
              result.original_team
            )
        )
    );

    const invalidTeams = convertedTeams
      .filter((result) => result.err !== undefined)
      .map((result) => result.team);

    const teamIds = convertedTeams
      .filter((result) => result.id !== undefined)
      .map((result) => result.id);

    await graphql(
      `
        mutation ($pullRequestId: ID!, $userIds: [ID!]!, $teamIds: [ID!]!) {
          requestReviews(
            input: {
              pullRequestId: $pullRequestId
              userIds: $userIds
              teamIds: $teamIds
              union: true
            }
          ) {
            pullRequest {
              url
            }
          }
        }
      `,
      {
        pullRequestId: issueId,
        userIds,
        teamIds,
        headers: {
          authorization: `token ${token}`,
        },
      }
    );

    if (invalidUsers.length > 0 || invalidTeams.length > 0) {
      const invalidReviewers = [...invalidUsers, ...invalidTeams];

      const comment = `I wasn't able to request review for the following reviewer(s): ${invalidReviewers.join(
        ","
      )}

Check that the reviewer is spelt right and try again.
      `;

      await reportError(token, issueId, comment);
    }
  } catch (error) {
    console.error("Failed to request reviewers", error);

    console.error(JSON.stringify(error.errors));
  }
}

export async function closeIssue(token, sourceRepo, issueId, reason) {
  try {
    await graphql(
      `
        mutation ($issue: ID!, $stateReason: IssueClosedStateReason) {
          closeIssue(input: { issueId: $issue, stateReason: $stateReason }) {
            issue {
              url
            }
          }
        }
      `,
      {
        issue: issueId,
        stateReason: reason,
        headers: {
          authorization: `token ${token}`,
        },
      }
    );
  } catch (error) {
    console.error("Failed to close issue", error);

    console.error(JSON.stringify(error.errors));
  }
}

export async function transferIssue(
  token,
  owner,
  sourceRepo,
  targetRepo,
  issueId
) {
  try {
    const { target } = await graphql(
      `
        query ($owner: String!, $targetRepo: String!) {
          target: repository(owner: $owner, name: $targetRepo) {
            id
          }
        }
      `,
      {
        owner,
        targetRepo,
        headers: {
          authorization: `token ${token}`,
        },
      }
    );

    await graphql(
      `
        mutation ($issue: ID!, $repo: ID!) {
          transferIssue(input: { issueId: $issue, repositoryId: $repo }) {
            issue {
              url
            }
          }
        }
      `,
      {
        issue: issueId,
        repo: target.id,
        headers: {
          authorization: `token ${token}`,
        },
      }
    );
  } catch (error) {
    console.error("Failed to transfer issue", error);

    console.error(JSON.stringify(error.errors));
  }
}
