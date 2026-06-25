import * as vscode from "vscode";

interface GitExtension {
  getAPI(version: 1): GitAPI;
}

interface GitAPI {
  repositories: readonly GitRepository[];
}

interface GitRepository {
  rootUri: vscode.Uri;
  inputBox: {
    value: string;
  };
}

export class GitInputWriter {
  async write(rootPath: string, message: string): Promise<boolean> {
    const extension = vscode.extensions.getExtension<GitExtension>("vscode.git");

    if (!extension) {
      return false;
    }

    const gitExtension = extension.isActive ? extension.exports : await extension.activate();
    const gitApi = gitExtension.getAPI(1);
    const repository = gitApi.repositories.find((candidate) => candidate.rootUri.fsPath === rootPath);

    if (!repository) {
      return false;
    }

    repository.inputBox.value = message;
    return true;
  }
}
