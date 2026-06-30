import { describe, it, expect } from "vitest";
import {
  scoreAmount,
  scoreName,
  scoreTiming,
  scoreHistory,
  scoreTransferAgainstCandidates,
} from "../lib/matchingEngine";

describe("scoreAmount", () => {
  it("scores an exact match as 1.0", () => {
    expect(scoreAmount(50000, 50000)).toBe(1);
  });

  it("scores a small underpayment as high but not perfect", () => {
    const score = scoreAmount(49800, 50000);
    expect(score).toBeGreaterThan(0.9);
    expect(score).toBeLessThan(1);
  });

  it("scores a large mismatch near zero", () => {
    const score = scoreAmount(20000, 50000);
    expect(score).toBeLessThan(0.1);
  });

  it("handles zero expected amount without throwing", () => {
    expect(scoreAmount(100, 0)).toBe(0);
  });
});

describe("scoreName", () => {
  it("scores identical names as 1.0", () => {
    expect(scoreName("Adeola Johnson", ["Adeola Johnson"])).toBe(1);
  });

  it("scores a typo'd name highly but not perfectly", () => {
    const score = scoreName("Adeola Jonson", ["Adeola Johnson"]);
    expect(score).toBeGreaterThan(0.85);
    expect(score).toBeLessThan(1);
  });

  it("picks the best match across multiple known names (post-rename case)", () => {
    const score = scoreName("Chidi Okafor", ["Chidi Eze", "Chidi Okafor"]);
    expect(score).toBe(1);
  });

  it("scores an unrelated name low", () => {
    const score = scoreName("Tunde Bakare", ["Adeola Johnson"]);
    expect(score).toBeLessThan(0.5);
  });

  it("is case and whitespace insensitive", () => {
    expect(scoreName("  adeola   johnson ", ["Adeola Johnson"])).toBe(1);
  });
});

describe("scoreTiming", () => {
  it("returns neutral 0.5 when there is no due date", () => {
    expect(scoreTiming(new Date(), null)).toBe(0.5);
  });

  it("scores a transfer on the due date as 1.0", () => {
    const due = new Date("2026-07-01T00:00:00Z");
    expect(scoreTiming(due, due)).toBe(1);
  });

  it("decays as the transfer moves further from the due date", () => {
    const due = new Date("2026-07-01T00:00:00Z");
    const farOff = new Date("2026-08-15T00:00:00Z");
    expect(scoreTiming(farOff, due)).toBeLessThan(0.3);
  });
});

describe("scoreHistory", () => {
  it("returns neutral-low score when there is no payment history", () => {
    expect(scoreHistory("Adeola Johnson", [])).toBe(0.3);
  });

  it("returns 1.0 when the sender has paid this identity before", () => {
    expect(scoreHistory("Adeola Johnson", ["Adeola Johnson", "Tunde Bakare"])).toBe(1);
  });

  it("returns a low score for a first-time sender despite other history existing", () => {
    expect(scoreHistory("New Sender", ["Adeola Johnson"])).toBe(0.2);
  });
});

describe("scoreTransferAgainstCandidates — integration", () => {
  const baseCandidate = {
    id: "ep_1",
    expectedAmount: 50000,
    label: "March rent",
    dueDate: new Date("2026-03-01T00:00:00Z"),
    identityCurrentName: "Adeola Johnson",
    identityKnownNames: ["Adeola Johnson"],
    priorSenderNames: ["Adeola Johnson"],
  };

  it("auto-match case: exact amount, exact name, on time -> high confidence", () => {
    const [top] = scoreTransferAgainstCandidates(
      { amount: 50000, senderName: "Adeola Johnson", receivedAt: new Date("2026-03-01T00:00:00Z") },
      [baseCandidate]
    );
    expect(top.confidenceScore).toBeGreaterThan(0.85);
  });

  it("misdirected/low-confidence case: wrong name, wrong amount -> low score, goes to review", () => {
    const [top] = scoreTransferAgainstCandidates(
      { amount: 12000, senderName: "Random Person", receivedAt: new Date("2026-03-01T00:00:00Z") },
      [baseCandidate]
    );
    expect(top.confidenceScore).toBeLessThan(0.5);
  });

  it("underpayment with typo'd name still ranks reasonably (manual review candidate)", () => {
    const [top] = scoreTransferAgainstCandidates(
      { amount: 49800, senderName: "Adeola Jonson", receivedAt: new Date("2026-03-02T00:00:00Z") },
      [baseCandidate]
    );
    expect(top.confidenceScore).toBeGreaterThan(0.6);
    expect(top.confidenceScore).toBeLessThan(0.95);
  });

  it("ranks multiple candidates best-first", () => {
    const weakCandidate = {
      ...baseCandidate,
      id: "ep_2",
      label: "Unrelated invoice",
      expectedAmount: 5000,
      identityCurrentName: "Someone Else",
      identityKnownNames: ["Someone Else"],
      priorSenderNames: [],
    };

    const results = scoreTransferAgainstCandidates(
      { amount: 50000, senderName: "Adeola Johnson", receivedAt: new Date("2026-03-01T00:00:00Z") },
      [weakCandidate, baseCandidate]
    );

    expect(results[0].expectedPaymentId).toBe("ep_1");
    expect(results[0].confidenceScore).toBeGreaterThan(results[1].confidenceScore);
  });

  it("post-rename case: transfer under old name still matches correctly", () => {
    const renamedCandidate = {
      ...baseCandidate,
      identityCurrentName: "Chidi Eze",
      identityKnownNames: ["Chidi Eze", "Chidi Okafor"],
      priorSenderNames: ["Chidi Okafor"],
    };

    const [top] = scoreTransferAgainstCandidates(
      { amount: 50000, senderName: "Chidi Okafor", receivedAt: new Date("2026-03-01T00:00:00Z") },
      [renamedCandidate]
    );

    expect(top.confidenceScore).toBeGreaterThan(0.85);
    expect(top.nameScore).toBe(1);
  });

  it("includes human-readable reasoning in every result", () => {
    const [top] = scoreTransferAgainstCandidates(
      { amount: 50000, senderName: "Adeola Johnson", receivedAt: new Date("2026-03-01T00:00:00Z") },
      [baseCandidate]
    );
    expect(top.reasoning).toContain("March rent");
    expect(top.reasoning.length).toBeGreaterThan(10);
  });
});
