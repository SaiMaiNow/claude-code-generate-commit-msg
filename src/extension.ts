import * as vscode from "vscode";
import { ProviderRegistry } from "./ai/providerRegistry";
import { ClaudeCodeProvider } from "./ai/providers/claudeCodeProvider";
import { CustomCommandProvider } from "./ai/providers/customCommandProvider";
import { ExtensionConfig } from "./config/extensionConfig";
import { CommitMessageService } from "./core/commitMessageService";
import { GitInputWriter } from "./core/gitInputWriter";
import { GitService } from "./git/gitService";

export function activate(context: vscode.ExtensionContext): void {
  const config = new ExtensionConfig();
  const providers = new ProviderRegistry();

  providers.register(new ClaudeCodeProvider(config));
  providers.register(new CustomCommandProvider(config));

  const service = new CommitMessageService(
    config,
    new GitService(),
    providers,
    new GitInputWriter()
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("claudeCommit.generateCommitMessage", async () => {
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "Generating commit message...",
          cancellable: true
        },
        async (_progress, token) => {
          try {
            await service.generate(token);
          } catch (error) {
            vscode.window.showErrorMessage(toErrorMessage(error));
          }
        }
      );
    }),
    vscode.commands.registerCommand("claudeCommit.selectProvider", async () => {
      const selected = await vscode.window.showQuickPick(
        providers.list().map((provider) => ({
          label: provider.label,
          description: provider.id,
          providerId: provider.id
        })),
        {
          title: "Select AI Provider",
          placeHolder: "Choose the provider used for commit message generation"
        }
      );

      if (!selected) {
        return;
      }

      await config.updateProvider(selected.providerId);
      vscode.window.showInformationMessage(`AI provider set to ${selected.label}.`);
    }),
    vscode.commands.registerCommand("claudeCommit.selectModel", async () => {
      const currentModel = config.getCommitConfig().model;
      const model = await vscode.window.showInputBox({
        title: "Select AI Model",
        prompt: "Enter a model name, or leave empty to use the provider default.",
        value: currentModel
      });

      if (model === undefined) {
        return;
      }

      await config.updateModel(model.trim());
      vscode.window.showInformationMessage(
        model.trim().length > 0 ? `AI model set to ${model.trim()}.` : "AI model reset to provider default."
      );
    })
  );
}

export function deactivate(): void {}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}
