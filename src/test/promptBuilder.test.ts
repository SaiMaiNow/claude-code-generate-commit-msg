import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildCommitPrompt } from "../core/promptBuilder";

describe("buildCommitPrompt", () => {
  it("asks the provider to return only one conventional commit message", () => {
    const prompt = buildCommitPrompt({
      diff: "diff --git a/file.ts b/file.ts",
      model: "",
      locale: "en",
      style: "conventional",
      maxSubjectLength: 72
    });

    assert.match(prompt, /Generate exactly one git commit message/);
    assert.match(prompt, /Conventional Commits/);
    assert.match(prompt, /Return only the commit message/);
    assert.match(prompt, /diff --git a\/file\.ts b\/file\.ts/);
  });
});
