import * as vscode from "vscode";
import { ProviderRegistry } from "./ai/providerRegistry";
import { ClaudeCodeProvider } from "./ai/providers/claudeCodeProvider";
import { CustomCommandProvider } from "./ai/providers/customCommandProvider";
import { AiCliAvailability, AiCliAvailabilityService } from "./core/aiCliAvailabilityService";
import { ExtensionConfig } from "./config/extensionConfig";
import { CommitMessageService } from "./core/commitMessageService";
import { GitInputWriter } from "./core/gitInputWriter";
import { GitService } from "./git/gitService";

export function activate(context: vscode.ExtensionContext): void {
  const config = new ExtensionConfig();
  const providers = new ProviderRegistry();
  const availabilityService = new AiCliAvailabilityService(config);

  providers.register(new ClaudeCodeProvider(config));
  providers.register(new CustomCommandProvider(config));

  const service = new CommitMessageService(
    config,
    new GitService(),
    providers,
    new GitInputWriter()
  );
  let hasShownMissingCliWarning = false;
  const refreshAiCliAvailability = async (showWarning = false) => {
    const availability = await availabilityService.getSelectedProviderAvailability();

    await vscode.commands.executeCommand("setContext", "claudeCommit.aiCliAvailable", availability.isAvailable);

    if (availability.isAvailable) {
      hasShownMissingCliWarning = false;
      return availability;
    }

    if (showWarning && !hasShownMissingCliWarning) {
      hasShownMissingCliWarning = true;
      void showMissingAiCliMessage(availability, "warning");
    }

    return availability;
  };

  void refreshAiCliAvailability(true);

  context.subscriptions.push(
    vscode.commands.registerCommand("claudeCommit.generateCommitMessage", async () => {
      const availability = await refreshAiCliAvailability();

      if (!availability.isAvailable) {
        await showMissingAiCliMessage(availability, "error");
        return;
      }

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
      await refreshAiCliAvailability(true);
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
    }),
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (
        event.affectsConfiguration("claudeCommit.ai.provider") ||
        event.affectsConfiguration("claudeCommit.providers.claudeCode.command") ||
        event.affectsConfiguration("claudeCommit.providers.customCommand.command")
      ) {
        void refreshAiCliAvailability(true);
      }
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

async function showMissingAiCliMessage(
  availability: AiCliAvailability,
  severity: "warning" | "error"
): Promise<void> {
  const message = buildMissingAiCliMessage(availability);
  const openSettings = "Open Settings";
  const selectProvider = "Select Provider";
  const action =
    severity === "error"
      ? await vscode.window.showErrorMessage(message, openSettings, selectProvider)
      : await vscode.window.showWarningMessage(message, openSettings, selectProvider);

  if (action === openSettings) {
    await vscode.commands.executeCommand("workbench.action.openSettings", "claudeCommit");
    return;
  }

  if (action === selectProvider) {
    await vscode.commands.executeCommand("claudeCommit.selectProvider");
  }
}

function buildMissingAiCliMessage(availability: AiCliAvailability): string {
  if (availability.reason === "missing-command") {
    return `AI Commit provider "${availability.providerId}" has no CLI command configured.`;
  }

  return `AI Commit cannot find CLI command "${availability.command}" for provider "${availability.providerId}".`;
}
