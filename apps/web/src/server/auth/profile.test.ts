import { describe, expect, it } from "vitest";

import { profileToPersonalInfo } from "./profile";

describe("profileToPersonalInfo", () => {
  it("copies the account name and email with the profile contact fields", () => {
    expect(
      profileToPersonalInfo(
        { name: "Alex Rivera", email: "alex.rivera.demo@example.com" },
        {
          title: "Frontend Developer",
          phone: "555-010-2048",
          linkedin: "linkedin.com/in/alex-rivera-demo",
          github: "github.com/alex-rivera-demo",
        },
      ),
    ).toEqual({
      name: "Alex Rivera",
      email: "alex.rivera.demo@example.com",
      title: "Frontend Developer",
      phone: "555-010-2048",
      linkedin: "linkedin.com/in/alex-rivera-demo",
      github: "github.com/alex-rivera-demo",
    });
  });
});
