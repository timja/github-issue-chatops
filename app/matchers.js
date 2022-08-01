export function transferMatcher(text) {
  return text.match(/(?:^| | \r\n|\n)\/transfer ([\dA-Za-z-]+)/);
}

export function closeMatcher(text) {
  return text.match(/(?:^| | \r\n|\n)\/close (not-planned)|\/close/);
}

export function reopenMatcher(text) {
  return text.match(/(?:^| | \r\n|\n)\/reopen/);
}

export function labelMatcher(text) {
  return text.match(/(?:^| | \r\n|\n)\/label ([ /A-Za-z\d-,:]+)/);
}

export function removeLabelMatcher(text) {
  // TODO prevent matching across lines
  return text.match(/(?:^| | \r\n|\n)\/remove-label ([ /A-Za-z\d-,:]+)/);
}

export function reviewerMatcher(text) {
  return text.match(/(?:^| | \r\n|\n)\/reviewers? ([ /@A-Za-z\d-,]+)/);
}
