import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RetailerDetailPage from "./RetailerDetailPage";
import { aminaAccount, aminaIdentity, retailerHistory, retailerTransfers } from "../test/fixtures";
import {
  createInvoice,
  loadRetailerDetail,
  portalData,
  resetPortalDataMocks,
} from "../test/mockPortalData";

const mocks = vi.hoisted(() => ({
  usePortalData: vi.fn(),
  useRetailerDetail: vi.fn(),
}));

vi.mock("../lib/portalData", () => ({
  usePortalData: mocks.usePortalData,
  useRetailerDetail: mocks.useRetailerDetail,
}));

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/retailers/identity-1"]}>
      <Routes>
        <Route path="/retailers/:id" element={<RetailerDetailPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("RetailerDetailPage", () => {
  beforeEach(() => {
    resetPortalDataMocks();
    mocks.usePortalData.mockReturnValue(portalData());
    mocks.useRetailerDetail.mockReturnValue({
      data: {
        identity: aminaIdentity,
        account: aminaAccount,
        expectedPayments: [
          {
            id: "expected-1",
            identityId: aminaIdentity.id,
            expectedAmount: 100000,
            label: "January invoice",
            dueDate: "2026-01-31",
            status: "pending",
            createdAt: "2026-01-01T00:00:00.000Z",
          },
        ],
        transfers: retailerTransfers,
        history: retailerHistory,
      },
      loading: false,
      error: "",
    });
  });

  it("loads retailer detail and renders account, invoice, transfer, and history sections", () => {
    renderPage();

    expect(loadRetailerDetail).toHaveBeenCalledWith("identity-1");
    expect(screen.getByRole("heading", { name: "Amina Stores" })).toBeInTheDocument();
    expect(screen.getByText("1234567890")).toBeInTheDocument();
    expect(screen.getByText("January invoice")).toBeInTheDocument();
    expect(screen.getByText("Retailer created")).toBeInTheDocument();
    expect(screen.getByText("Amina Stores", { selector: "td" })).toBeInTheDocument();
  });

  it("creates an invoice for the current retailer", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByPlaceholderText("Delivery #0032 - Rice & Beans"), "Delivery #0042");
    await user.type(screen.getByPlaceholderText("Amount"), "75000");
    await user.type(screen.getByDisplayValue(""), "2026-02-10");
    await user.click(screen.getByRole("button", { name: "Create invoice" }));

    await waitFor(() => {
      expect(createInvoice).toHaveBeenCalledWith({
        identityId: "identity-1",
        expectedAmount: 75000,
        label: "Delivery #0042",
        dueDate: "2026-02-10",
      });
    });
  });
});
