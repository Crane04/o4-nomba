import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LoginPage from "./LoginPage";
import { auth, login, resetAuthMocks } from "../test/mockAuth";

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
}));

vi.mock("../lib/auth", () => ({
  useAuth: mocks.useAuth,
}));

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/login"]}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<div>Dashboard route</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("LoginPage", () => {
  beforeEach(() => {
    resetAuthMocks();
    mocks.useAuth.mockReturnValue(auth({ organization: null }));
  });

  it("submits credentials and navigates to the dashboard", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByPlaceholderText("admin@company.com"), "ops@example.com");
    await user.type(screen.getByPlaceholderText("Password"), "correct-password");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith("ops@example.com", "correct-password");
    });
    expect(await screen.findByText("Dashboard route")).toBeInTheDocument();
  });

  it("shows login errors inline", async () => {
    const user = userEvent.setup();
    login.mockRejectedValueOnce(new Error("Invalid credentials"));
    renderPage();

    await user.type(screen.getByPlaceholderText("admin@company.com"), "ops@example.com");
    await user.type(screen.getByPlaceholderText("Password"), "wrong-password");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByText("Invalid credentials")).toBeInTheDocument();
  });
});
