import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RetailersPage from "./RetailersPage";
import { createRetailer, loadCollections, portalData, resetPortalDataMocks } from "../test/mockPortalData";

const mocks = vi.hoisted(() => ({
  usePortalData: vi.fn(),
}));

vi.mock("../lib/portalData", () => ({
  usePortalData: mocks.usePortalData,
}));

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/retailers"]}>
      <Routes>
        <Route path="/retailers" element={<RetailersPage />} />
        <Route path="/retailers/:id" element={<div>Retailer detail page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("RetailersPage", () => {
  beforeEach(() => {
    resetPortalDataMocks();
    mocks.usePortalData.mockReturnValue(portalData());
  });

  it("loads collections and renders retailer account rows with outstanding balances", async () => {
    renderPage();

    expect(loadCollections).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("heading", { name: "Retailers" })).toBeInTheDocument();
    expect(screen.getByText("Amina Stores")).toBeInTheDocument();
    expect(screen.getByText("1234567890")).toBeInTheDocument();
    expect(screen.getByText(/60,000/)).toBeInTheDocument();
    expect(screen.getByText("Partial")).toBeInTheDocument();
    expect(screen.getByText("Bello Mart")).toBeInTheDocument();
    expect(screen.getByText("0987654321")).toBeInTheDocument();
    expect(screen.getByTitle("Outstanding")).toHaveTextContent("Due");
  });

  it("creates a retailer account and navigates to the new retailer detail page", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByPlaceholderText("Retailer business name"), "New Market Shop");
    await user.selectOptions(screen.getByDisplayValue("Tier 1"), "2");
    await user.click(screen.getByRole("button", { name: "Create + provision" }));

    await waitFor(() => {
      expect(createRetailer).toHaveBeenCalledWith("New Market Shop", 2);
    });
    expect(await screen.findByText("Retailer detail page")).toBeInTheDocument();
  });

  it("shows an inline error when retailer provisioning fails", async () => {
    const user = userEvent.setup();
    createRetailer.mockRejectedValueOnce(new Error("Nomba unavailable"));
    renderPage();

    await user.type(screen.getByPlaceholderText("Retailer business name"), "New Market Shop");
    await user.click(screen.getByRole("button", { name: "Create + provision" }));

    expect(await screen.findByText("Nomba unavailable")).toBeInTheDocument();
  });
});
