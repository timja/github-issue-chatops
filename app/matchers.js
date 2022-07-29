export function transferMatcher(text) {
  return text.match(/\/transfer ([\dA-Za-z-]+)/);
}

export function closeMatcher(text) {
  return text.match(/\/close (not-planned)|\/close/);
}

export function reopenMatcher(text) {
  return text.match(/\/reopen/);
}

export function labelMatcher(text) {
  return text.match(/\/label ([\s/A-Za-z\d-,:]+)/);
}

export function removeLabelMatcher(text) {
  // TODO prevent matching across lines
  return text.match(/\/remove-label ([\s/A-Za-z\d-,:]+)/);
}

export function reviewerMatcher(text) {
  return text.match(/\/reviewers? ([\s/@A-Za-z\d-,]+)/);
}
