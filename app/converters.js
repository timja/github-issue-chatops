export function extractUsersAndTeams(orgName, reviewers) {
  const split = reviewers.split(/[,\s]/).filter(Boolean);

  return {
    teams: split.filter((reviewer) => reviewer.includes("/")),
    users: split.filter((reviewer) => !reviewer.includes("/")),
  };
}

export function extractCommaSeparated(item) {
  return item.split(",").filter(Boolean);
}
