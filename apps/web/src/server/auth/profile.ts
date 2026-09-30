import type { PersonalInfo } from "@winnow/core";

export function profileToPersonalInfo(
  user: { name: string; email: string },
  profile: {
    title: string;
    phone: string;
    linkedin: string;
    github: string;
  },
): PersonalInfo {
  return {
    name: user.name,
    email: user.email,
    title: profile.title,
    phone: profile.phone,
    linkedin: profile.linkedin,
    github: profile.github,
  };
}
