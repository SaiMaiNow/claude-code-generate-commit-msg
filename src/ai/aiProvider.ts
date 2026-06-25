import { CancellationTokenLike } from "../shared/cancellation";

export interface CommitMessageRequest {
  readonly diff: string;
  readonly model: string;
  readonly locale: string;
  readonly style: CommitMessageStyle;
  readonly maxSubjectLength: number;
}

export type CommitMessageStyle = "conventional" | "simple";

export interface AIProvider {
  readonly id: string;
  readonly label: string;
  generateCommitMessage(request: CommitMessageRequest, token?: CancellationTokenLike): Promise<string>;
}
