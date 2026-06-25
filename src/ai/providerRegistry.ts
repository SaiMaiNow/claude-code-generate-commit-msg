import { AIProvider } from "./aiProvider";

export class ProviderRegistry {
  private readonly providers = new Map<string, AIProvider>();

  register(provider: AIProvider): void {
    if (this.providers.has(provider.id)) {
      throw new Error(`AI provider already registered: ${provider.id}`);
    }

    this.providers.set(provider.id, provider);
  }

  get(providerId: string): AIProvider {
    const provider = this.providers.get(providerId);

    if (!provider) {
      throw new Error(`Unknown AI provider: ${providerId}`);
    }

    return provider;
  }

  list(): readonly AIProvider[] {
    return [...this.providers.values()];
  }
}
