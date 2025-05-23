// In-memory token blacklist
// TODO: Replace with Redis implementation for production
class TokenBlacklist {
  private blacklistedTokens: Set<string> = new Set();

  addToBlacklist(token: string): void {
    this.blacklistedTokens.add(token);
  }

  isBlacklisted(token: string): boolean {
    return this.blacklistedTokens.has(token);
  }

  // Optional: Add a method to clean up old tokens periodically
  // This is especially important when using in-memory storage
  cleanup(): void {
    // In a production environment with Redis, we would set TTL on tokens
    // For now, we'll just clear the set periodically
    this.blacklistedTokens.clear();
  }
}

// Export a singleton instance
export const tokenBlacklist = new TokenBlacklist();
