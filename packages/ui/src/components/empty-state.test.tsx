import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EmptyState } from "./empty-state";

describe("EmptyState", () => {
  it("renders the title", () => {
    render(<EmptyState title="No applications yet" />);
    expect(
      screen.getByRole("heading", { name: "No applications yet" }),
    ).toBeTruthy();
  });
});
