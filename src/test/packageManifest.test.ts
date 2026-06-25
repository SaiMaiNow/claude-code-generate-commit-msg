import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("package manifest", () => {
  it("defaults diff mode to auto so unstaged changes are included", () => {
    const packageJson = readPackageJson();

    assert.equal(
      packageJson.contributes.configuration.properties["claudeCommit.git.diffMode"].default,
      "auto"
    );
  });

  it("shows SCM generate command only for Git providers with an available AI CLI", () => {
    const packageJson = readPackageJson();
    const scmTitleContribution = packageJson.contributes.menus["scm/title"].find(
      (item: { command: string }) => item.command === "claudeCommit.generateCommitMessage"
    );

    assert.equal(
      scmTitleContribution.when,
      "claudeCommit.aiCliAvailable && scmProvider == git"
    );
  });

  it("shows command palette generate command only when a Git repository is open", () => {
    const packageJson = readPackageJson();
    const commandPaletteContribution = packageJson.contributes.menus.commandPalette.find(
      (item: { command: string }) => item.command === "claudeCommit.generateCommitMessage"
    );

    assert.equal(
      commandPaletteContribution.when,
      "claudeCommit.aiCliAvailable && gitOpenRepositoryCount >= 1"
    );
  });

  it("includes Marketplace presentation metadata", () => {
    const packageJson = readPackageJson();

    assert.equal(packageJson.icon, "icon.png");
    assert.equal(packageJson.repository.url, "https://github.com/SaiMaiNow/claude-code-generate-commit-msg.git");
    assert.equal(packageJson.bugs.url, "https://github.com/SaiMaiNow/claude-code-generate-commit-msg/issues");
    assert.equal(packageJson.homepage, "https://github.com/SaiMaiNow/claude-code-generate-commit-msg#readme");
    assert.ok(packageJson.keywords.includes("commit-message"));
  });
});

function readPackageJson(): Record<string, any> {
  return JSON.parse(readFileSync(join(process.cwd(), "package.json"), "utf8"));
}
