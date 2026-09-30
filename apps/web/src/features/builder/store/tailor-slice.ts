import type { BulletMatch } from "@winnow/core";
import type { StateCreator } from "zustand";

import type { BuilderStore } from "./builder-store";

export type TailorSlice = {
  bulletMatches: Record<string, BulletMatch>;
  highlightMatches: Record<string, BulletMatch>;
  jdMatch: BulletMatch | null;
};

export const createTailorSlice: StateCreator<
  BuilderStore,
  [],
  [],
  TailorSlice
> = () => ({
  bulletMatches: {},
  highlightMatches: {},
  jdMatch: null,
});
