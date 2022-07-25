export function extractUsersAndTeams(orgName, reviewers) {
  const split = reviewers.split(/[,\s]/);

  return {
    teams: split.filter((reviewer) => reviewer.includes("/")),
    users: split.filter((reviewer) => !reviewer.includes("/")),
  };
}
