import { transferMatcher } from "./matchers.js";

describe("matchers", () => {
  describe("transfer", () => {
    test("matches /transfer and extracts the repo name", () => {
      const result = transferMatcher("/transfer github-comment-ops");

      expect(result).toBeTruthy();
      expect(result[1]).toEqual("github-comment-ops");
    });
    test("does not match input without /transfer", () => {
      const result = transferMatcher("transfer github-comment-ops");

      expect(result).toBeFalsy();
    });
    test("does not match without a repository name", () => {
      const result = transferMatcher("/transfer");

      expect(result).toBeFalsy();
    });
  });
});
