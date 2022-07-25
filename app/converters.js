export function extractUsersAndTeams(orgName, reviewers) {
  const separator = reviewers.includes(",") ? "," : " ";
  const split = reviewers.split(separator);

  return {
    teams: split.filter((reviewer) => reviewer.includes("/")),
    users: split.filter((reviewer) => !reviewer.includes("/")),
  };
}
