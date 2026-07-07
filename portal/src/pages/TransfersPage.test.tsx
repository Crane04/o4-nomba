import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TransfersPage from "./TransfersPage";
import { matchedTransfer, underReviewTransfer } from "../test/fixtures";
import { loadTransfers, portalData, resetPortalDataMocks } from "../test/mockPortalData";

const mocks = vi.hoisted(() => ({
  usePortalData: vi.fn(),
}));

vi.mock("../lib/portalData", () => ({
  usePortalData: mocks.usePortalData,
}));

describe("TransfersPage", () => {
  beforeEach(() => {
    resetPortalDataMocks();
    mocks.usePortalData.mockReturnValue(
      portalData({
        transfers: {
          data: [matchedTransfer, underReviewTransfer],
          loading: false,
          error: "",
        },
      })
    );
  });

  it("loads transfers and renders transfer summary metrics", () => {
    render(<TransfersPage />);

    expect(loadTransfers).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("heading", { name: "Transfers" })).toBeInTheDocument();
    expect(screen.getByText("Total Transfers")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("Total Received")).toBeInTheDocument();
    expect(screen.getByText(/65,000/)).toBeInTheDocument();
    expect(screen.getByText("Reconciled")).toBeInTheDocument();
    expect(screen.getAllByText(/40,000/).length).toBeGreaterThan(0);
    expect(screen.getByText("Under Review")).toBeInTheDocument();
  });

  it("filters transfers by customer, sender, account, or reference", async () => {
    const user = userEvent.setup();
    render(<TransfersPage />);

    await user.type(screen.getByPlaceholderText("Search transfers"), "BEL-2026");

    expect(screen.getByText("Bello Mart")).toBeInTheDocument();
    expect(screen.getByText("Bello Limited")).toBeInTheDocument();
    expect(screen.queryByText("Amina Stores")).not.toBeInTheDocument();
  });
});
