import { vi } from "vitest";
import type { AuthContextValue } from "../lib/types";

export const login = vi.fn<AuthContextValue["login"]>();
export const signup = vi.fn<AuthContextValue["signup"]>();
export const logout = vi.fn<AuthContextValue["logout"]>();

export function resetAuthMocks() {
  login.mockReset();
  signup.mockReset();
  logout.mockReset();
  login.mockResolvedValue();
  signup.mockResolvedValue();
}

export function auth(overrides: Partial<AuthContextValue> = {}): AuthContextValue {
  return {
    organization: {
      id: "org-1",
      name: "OhFour Demo",
      email: "ops@example.com",
    },
    loading: false,
    login,
    signup,
    logout,
    ...overrides,
  };
}
