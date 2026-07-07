import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DashboardPage from "./DashboardPage";
import { loadCollections, portalData, resetPortalDataMocks } from "../test/mockPortalData";

const mocks = vi.hoisted(() => ({
  usePortalData: vi.fn(),
}));

vi.mock("../lib/portalData", () => ({
  usePortalData: mocks.usePortalData,
}));

describe("DashboardPage", () => {
  beforeEach(() => {
    resetPortalDataMocks();
    mocks.usePortalData.mockReturnValue(portalData());
  });

  it("loads collection data and renders the main reconciliation metrics", () => {
    render(<DashboardPage />);

    expect(loadCollections).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("heading", { name: "Collections Overview" })).toBeInTheDocument();
    expect(screen.getByText("Total Retailers")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("Total Invoiced")).toBeInTheDocument();
    expect(screen.getByText(/150,000/)).toBeInTheDocument();
    expect(screen.getByText("Amount Collected")).toBeInTheDocument();
    expect(screen.getAllByText(/40,000/).length).toBeGreaterThan(0);
    expect(screen.getByText("Outstanding")).toBeInTheDocument();
    expect(screen.getByText(/110,000/)).toBeInTheDocument();
  });

  it("renders recent transfer activity with status", () => {
    render(<DashboardPage />);

    expect(screen.getByText("Recent Activity")).toBeInTheDocument();
    expect(screen.getByText("Amina Stores")).toBeInTheDocument();
    expect(screen.getByText("1234567890")).toBeInTheDocument();
    expect(screen.getByTitle("Matched")).toHaveTextContent("Matched");
  });
});
