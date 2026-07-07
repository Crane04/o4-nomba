import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ReviewPage from "./ReviewPage";
import { reviewTransfer } from "../test/fixtures";
import { auth, resetAuthMocks } from "../test/mockAuth";
import {
  loadReviewQueue,
  portalData,
  rejectCandidate,
  resetPortalDataMocks,
  resolveCandidate,
} from "../test/mockPortalData";

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
  usePortalData: vi.fn(),
}));

vi.mock("../lib/auth", () => ({
  useAuth: mocks.useAuth,
}));

vi.mock("../lib/portalData", () => ({
  usePortalData: mocks.usePortalData,
}));

describe("ReviewPage", () => {
  beforeEach(() => {
    resetAuthMocks();
    resetPortalDataMocks();
    mocks.useAuth.mockReturnValue(auth());
    mocks.usePortalData.mockReturnValue(
      portalData({
        reviewQueue: {
          data: [reviewTransfer],
          loading: false,
          error: "",
        },
      })
    );
  });

  it("loads and renders flagged candidate matches", () => {
    render(<ReviewPage />);

    expect(loadReviewQueue).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("heading", { name: "Flagged Payments" })).toBeInTheDocument();
    expect(screen.getByText("Bello Ltd")).toBeInTheDocument();
    expect(screen.getByText("February invoice")).toBeInTheDocument();
    expect(screen.getByText("Bello Mart")).toBeInTheDocument();
    expect(screen.getByText(/Amount and retailer name/)).toBeInTheDocument();
  });

  it("confirms and rejects candidate matches with the organization email", async () => {
    const user = userEvent.setup();
    render(<ReviewPage />);

    await user.click(screen.getByRole("button", { name: "Confirm match" }));
    await waitFor(() => {
      expect(resolveCandidate).toHaveBeenCalledWith("match-1", "ops@example.com");
    });

    await user.click(screen.getByRole("button", { name: "Not a match" }));
    await waitFor(() => {
      expect(rejectCandidate).toHaveBeenCalledWith("match-1", "ops@example.com");
    });
  });
});
