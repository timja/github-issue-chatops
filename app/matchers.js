export function transferMatcher(text) {
  return text.match(/\/transfer ([a-zA-Z\d-]+)/);
}

export function closeMatcher(text) {
  return text.match(/\/close (not-planned)|\/close/);
}

export function reopenMatcher(text) {
  return text.match(/\/reopen/);
}

export function labelMatcher(text) {
  return text.match(/\/label ([a-zA-Z\d-, ]+)/);
}

export function removeLabelMatcher(text) {
  return text.match(/\/remove-label ([a-zA-Z\d-, ]+)/);
}

export function reviewerMatcher(text) {
  return text.match(/\/reviewers? ([@a-z/A-Z\d-, ]+)/);
}
