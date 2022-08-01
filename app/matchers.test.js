import {
  closeMatcher,
  labelMatcher,
  removeLabelMatcher,
  reopenMatcher,
  reviewerMatcher,
  transferMatcher,
} from "./matchers.js";

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
    test("only matches the current line", () => {
      const result = transferMatcher("/transfer github-comment-ops\nasda");

      expect(result).toBeTruthy();
      expect(result[1]).toEqual("github-comment-ops");
    });
    test("does not match in the middle of a string", () => {
      const result = transferMatcher(
        "hello world/transfer github-comment-ops\nasda"
      );

      expect(result).toBeFalsy();
    });
  });

  describe("close", () => {
    test("matches /close", () => {
      const result = closeMatcher("/close");

      expect(result).toBeTruthy();
      expect(result[1]).toBeUndefined();
    });
    test("does not match input without /close", () => {
      const result = closeMatcher("close something");

      expect(result).toBeFalsy();
    });
    test("does not match /closenot-planned", () => {
      const result = closeMatcher("/closenot-planned");

      expect(result).toBeTruthy();
      expect(result[1]).toBeUndefined();
    });

    test("matches /close not-planned", () => {
      const result = closeMatcher("/close not-planned");

      expect(result).toBeTruthy();
      expect(result[1]).toEqual("not-planned");
    });
  });

  describe("reopen", () => {
    test("matches /reopen", () => {
      const result = reopenMatcher("/reopen");

      expect(result).toBeTruthy();
    });
    test("does not match input without /reopen", () => {
      const result = reopenMatcher("reopen blah");

      expect(result).toBeFalsy();
    });

    test("does not match in the middle of a string", () => {
      const result = reopenMatcher("a string/reopen");

      expect(result).toBeFalsy();
    });
  });

  describe("label", () => {
    test("matches /label label1", () => {
      const result = labelMatcher("/label label1");

      expect(result).toBeTruthy();
      expect(result[1]).toEqual("label1");
    });
    test("only matches the current line", () => {
      const result = labelMatcher("/label label1\nasda");

      expect(result).toBeTruthy();
      expect(result[1]).toEqual("label1");
    });
    test("does not match in the middle of a string", () => {
      const result = labelMatcher("something cool/label label1\nasda");

      expect(result).toBeFalsy();
    });
    test("does not match input without /label", () => {
      const result = labelMatcher("label label1");

      expect(result).toBeFalsy();
    });
    test("does not match /labellabel1", () => {
      const result = labelMatcher("/labellabel1");

      expect(result).toBeFalsy();
    });

    test("matches /label label1,label2", () => {
      const result = labelMatcher("/label label1,label2");

      expect(result).toBeTruthy();
      expect(result[1]).toEqual("label1,label2");
    });
    test("matches /label label1,label2 with spaces,label3", () => {
      const result = labelMatcher("/label label1,label 2 with spaces,label3");

      expect(result).toBeTruthy();
      expect(result[1]).toEqual("label1,label 2 with spaces,label3");
    });
  });

  describe("remove-label", () => {
    test("matches /remove-label label1", () => {
      const result = removeLabelMatcher("/remove-label label1");

      expect(result).toBeTruthy();
      expect(result[1]).toEqual("label1");
    });
    test("does not match input without /remove-label", () => {
      const result = removeLabelMatcher("remove-label label1");

      expect(result).toBeFalsy();
    });
    test("does not match /remove-labellabel1", () => {
      const result = removeLabelMatcher("/remove-labellabel1");

      expect(result).toBeFalsy();
    });

    test("matches /remove-label label1,label2", () => {
      const result = removeLabelMatcher("/remove-label label1,label2");

      expect(result).toBeTruthy();
      expect(result[1]).toEqual("label1,label2");
    });
    test("matches /remove-label label1,label2 with spaces,label3", () => {
      const result = removeLabelMatcher(
        "/remove-label label1,label 2 with spaces,label3"
      );

      expect(result).toBeTruthy();
      expect(result[1]).toEqual("label1,label 2 with spaces,label3");
    });
    test("only matches the current line", () => {
      const result = removeLabelMatcher("/remove-label label1\nasda");

      expect(result).toBeTruthy();
      expect(result[1]).toEqual("label1");
    });
    test("does not match in the middle of a string", () => {
      const result = removeLabelMatcher(
        "something cool/remove-label label1\nasda"
      );

      expect(result).toBeFalsy();
    });
  });

  describe("reviewer", () => {
    test("matches /reviewer reviewer1", () => {
      const result = reviewerMatcher("/reviewer reviewer1");

      expect(result).toBeTruthy();
      expect(result[1]).toEqual("reviewer1");
    });
    test("matches /reviewers reviewer1,reviewer2", () => {
      const result = reviewerMatcher("/reviewers reviewer1,reviewer2");

      expect(result).toBeTruthy();
      expect(result[1]).toEqual("reviewer1,reviewer2");
    });
    test("does not match input without /reviewer", () => {
      const result = reviewerMatcher("reviewer reviewer1");

      expect(result).toBeFalsy();
    });
    test("does not match /reviewerreviewer1", () => {
      const result = reviewerMatcher("/reviewerreviewer1");

      expect(result).toBeFalsy();
    });

    test("matches /reviewer reviewer1,reviewer2", () => {
      const result = reviewerMatcher("/reviewer reviewer1,reviewer2");

      expect(result).toBeTruthy();
      expect(result[1]).toEqual("reviewer1,reviewer2");
    });
    test("matches /reviewer reviewer1,@reviewer2,@org/team", () => {
      const result = reviewerMatcher(
        "/reviewer reviewer1,@reviewer2,@org/team"
      );

      expect(result).toBeTruthy();
      expect(result[1]).toEqual("reviewer1,@reviewer2,@org/team");
    });
    test("matches with space separator /reviewer reviewer1 @reviewer2 @org/team", () => {
      const result = reviewerMatcher(
        "/reviewer reviewer1 @reviewer2 @org/team"
      );

      expect(result).toBeTruthy();
      expect(result[1]).toEqual("reviewer1 @reviewer2 @org/team");
    });

    test("only matches the current line", () => {
      const result = reviewerMatcher("/reviewer reviewer1\nasda");

      expect(result).toBeTruthy();
      expect(result[1]).toEqual("reviewer1");
    });
    test("does not match in the middle of a string", () => {
      const result = reviewerMatcher("something cool/reviewer reviewer1\nasda");

      expect(result).toBeFalsy();
    });
  });
});
