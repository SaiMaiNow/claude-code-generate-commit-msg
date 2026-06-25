import * as vscode from "vscode";
import { CommitMessageStyle } from "../ai/aiProvider";

export type DiffMode = "staged" | "unstaged" | "auto";

export interface ClaudeCodeConfig {
  readonly command: string;
  readonly arguments: readonly string[];
  readonly modelArguments: readonly string[];
}

export interface CustomCommandConfig {
  readonly command: string;
  readonly arguments: readonly string[];
  readonly modelArguments: readonly string[];
}

export interface CommitConfig {
  readonly provider: string;
  readonly model: string;
  readonly diffMode: DiffMode;
  readonly style: CommitMessageStyle;
  readonly locale: string;
  readonly maxSubjectLength: number;
}

export class ExtensionConfig {
  private readonly section = "claudeCommit";

  getCommitConfig(): CommitConfig {
    const config = vscode.workspace.getConfiguration(this.section);

    return {
      provider: config.get("ai.provider", "claude-code"),
      model: config.get("ai.model", ""),
      diffMode: config.get("git.diffMode", "auto"),
      style: config.get("commit.style", "conventional"),
      locale: config.get("commit.locale", "en"),
      maxSubjectLength: config.get("commit.maxSubjectLength", 72)
    };
  }

  getClaudeCodeConfig(): ClaudeCodeConfig {
    const config = vscode.workspace.getConfiguration(this.section);

    return {
      command: config.get("providers.claudeCode.command", "claude"),
      arguments: config.get("providers.claudeCode.arguments", ["-p", "{prompt}"]),
      modelArguments: config.get("providers.claudeCode.modelArguments", ["--model", "{model}"])
    };
  }

  getCustomCommandConfig(): CustomCommandConfig {
    const config = vscode.workspace.getConfiguration(this.section);

    return {
      command: config.get("providers.customCommand.command", ""),
      arguments: config.get("providers.customCommand.arguments", ["{prompt}"]),
      modelArguments: config.get("providers.customCommand.modelArguments", ["--model", "{model}"])
    };
  }

  async updateProvider(providerId: string): Promise<void> {
    await vscode.workspace
      .getConfiguration(this.section)
      .update("ai.provider", providerId, vscode.ConfigurationTarget.Global);
  }

  async updateModel(model: string): Promise<void> {
    await vscode.workspace
      .getConfiguration(this.section)
      .update("ai.model", model, vscode.ConfigurationTarget.Global);
  }
}
