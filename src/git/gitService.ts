import * as vscode from "vscode";
import { DiffMode } from "../config/extensionConfig";
import { runProcess } from "../shared/process";

export interface GitRepositoryInfo {
  readonly rootPath: string;
}

export class GitService {
  async findRepository(): Promise<GitRepositoryInfo> {
    const cwd = this.getPreferredWorkspacePath();
    const result = await runProcess("git", ["rev-parse", "--show-toplevel"], {
      cwd
    });

    return {
      rootPath: result.stdout.trim()
    };
  }

  async readDiff(rootPath: string, mode: DiffMode): Promise<string> {
    if (mode === "staged") {
      return this.readStagedDiff(rootPath);
    }

    if (mode === "unstaged") {
      return this.readUnstagedDiff(rootPath);
    }

    const stagedDiff = await this.readStagedDiff(rootPath);

    if (stagedDiff.trim().length > 0) {
      return stagedDiff;
    }

    return this.readUnstagedDiff(rootPath);
  }

  private async readStagedDiff(rootPath: string): Promise<string> {
    const result = await runProcess("git", ["diff", "--cached", "--no-ext-diff", "--no-color"], {
      cwd: rootPath
    });

    return result.stdout;
  }

  private async readUnstagedDiff(rootPath: string): Promise<string> {
    const result = await runProcess("git", ["diff", "--no-ext-diff", "--no-color"], {
      cwd: rootPath
    });

    return result.stdout;
  }

  private getPreferredWorkspacePath(): string | undefined {
    const activeEditor = vscode.window.activeTextEditor;

    if (activeEditor) {
      const folder = vscode.workspace.getWorkspaceFolder(activeEditor.document.uri);

      if (folder) {
        return folder.uri.fsPath;
      }
    }

    return vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  }
}
