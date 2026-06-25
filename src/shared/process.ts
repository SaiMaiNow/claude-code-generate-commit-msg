import { spawn } from "node:child_process";
import { CancellationTokenLike } from "./cancellation";

export interface ProcessResult {
  readonly stdout: string;
  readonly stderr: string;
}

export interface RunProcessOptions {
  readonly cwd?: string;
  readonly token?: CancellationTokenLike;
}

export function runProcess(command: string, args: readonly string[], options: RunProcessOptions = {}): Promise<ProcessResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      shell: false,
      windowsHide: true
    });

    let stdout = "";
    let stderr = "";

    const abort = () => {
      child.kill();
      reject(new Error(`Command cancelled: ${command}`));
    };

    if (options.token?.isCancellationRequested) {
      abort();
      return;
    }

    const cancellationSubscription = options.token?.onCancellationRequested(abort);

    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString("utf8");
    });

    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString("utf8");
    });

    child.on("error", (error) => {
      reject(error);
    });

    child.on("close", (code) => {
      cancellationSubscription?.dispose();

      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }

      reject(new Error(`${command} exited with code ${code ?? "unknown"}: ${stderr.trim()}`));
    });
  });
}
