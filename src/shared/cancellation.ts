export interface DisposableLike {
  dispose(): void;
}

export interface CancellationTokenLike {
  readonly isCancellationRequested: boolean;
  onCancellationRequested(listener: () => void): DisposableLike;
}
