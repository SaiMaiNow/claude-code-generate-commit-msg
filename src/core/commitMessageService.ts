import * as vscode from "vscode";
import { ExtensionConfig } from "../config/extensionConfig";
import { GitService } from "../git/gitService";
import { ProviderRegistry } from "../ai/providerRegistry";
import { GitInputWriter } from "./gitInputWriter";

export class CommitMessageService {
  constructor(
    private readonly config: ExtensionConfig,
    private readonly gitService: GitService,
    private readonly providers: ProviderRegistry,
    private readonly gitInputWriter: GitInputWriter
  ) {}

  async generate(token?: vscode.CancellationToken): Promise<void> {
    const commitConfig = this.config.getCommitConfig();
    const repo = await this.gitService.findRepository();
    const diff = await this.gitService.readDiff(repo.rootPath, commitConfig.diffMode);

    if (diff.trim().length === 0) {
      vscode.window.showInformationMessage(getEmptyDiffMessage(commitConfig.diffMode));
      return;
    }

    const provider = this.providers.get(commitConfig.provider);
    const message = await provider.generateCommitMessage(
      {
        diff,
        model: commitConfig.model,
        locale: commitConfig.locale,
        style: commitConfig.style,
        maxSubjectLength: commitConfig.maxSubjectLength
      },
      token
    );

    if (message.length === 0) {
      throw new Error("AI provider returned an empty commit message.");
    }

    const wroteToGitInput = await this.gitInputWriter.write(repo.rootPath, message);

    if (!wroteToGitInput) {
      await vscode.env.clipboard.writeText(message);
      vscode.window.showInformationMessage("Commit message copied to clipboard.");
      return;
    }

    vscode.window.showInformationMessage("Commit message generated.");
  }
}

function getEmptyDiffMessage(diffMode: string): string {
  if (diffMode === "staged") {
    return "No staged git changes found for commit message generation.";
  }

  if (diffMode === "unstaged") {
    return "No unstaged git changes found for commit message generation.";
  }

  return "No staged or unstaged git changes found for commit message generation.";
}
