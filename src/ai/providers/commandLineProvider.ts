import { AIProvider, CommitMessageRequest } from "../aiProvider";
import { buildCommitPrompt } from "../../core/promptBuilder";
import { CancellationTokenLike } from "../../shared/cancellation";
import { runProcess } from "../../shared/process";

export interface CommandLineProviderConfig {
  readonly command: string;
  readonly arguments: readonly string[];
  readonly modelArguments: readonly string[];
}

export abstract class CommandLineProvider implements AIProvider {
  constructor(
    readonly id: string,
    readonly label: string
  ) {}

  async generateCommitMessage(request: CommitMessageRequest, token?: CancellationTokenLike): Promise<string> {
    const config = this.getConfig();
    const prompt = buildCommitPrompt(request);
    const args = this.resolveArgs(config.arguments, {
      prompt,
      model: request.model
    });

    if (request.model.trim().length > 0) {
      args.push(...this.resolveArgs(config.modelArguments, {
        prompt,
        model: request.model
      }));
    }

    if (config.command.trim().length === 0) {
      throw new Error(`${this.label} command is not configured.`);
    }

    const result = await runProcess(config.command, args, {
      token
    });

    return normalizeGeneratedMessage(result.stdout);
  }

  protected abstract getConfig(): CommandLineProviderConfig;

  private resolveArgs(args: readonly string[], values: { prompt: string; model: string }): string[] {
    return args.map((arg) =>
      arg
        .replaceAll("{prompt}", values.prompt)
        .replaceAll("{model}", values.model)
    );
  }
}

function normalizeGeneratedMessage(output: string): string {
  return output
    .trim()
    .replace(/^```(?:text)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}
