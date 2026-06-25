import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { AIProvider } from "../ai/aiProvider";
import { ProviderRegistry } from "../ai/providerRegistry";

const provider: AIProvider = {
  id: "test-provider",
  label: "Test Provider",
  async generateCommitMessage() {
    return "test: commit message";
  }
};

describe("ProviderRegistry", () => {
  it("returns registered providers by id", () => {
    const registry = new ProviderRegistry();

    registry.register(provider);

    assert.equal(registry.get("test-provider"), provider);
    assert.deepEqual(registry.list(), [provider]);
  });

  it("rejects duplicate provider ids", () => {
    const registry = new ProviderRegistry();

    registry.register(provider);

    assert.throws(() => registry.register(provider), /already registered/);
  });
});
