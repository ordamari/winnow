import { create } from "zustand";

import { type ContentSlice, createContentSlice } from "./content-slice";
import { createStyleSlice, type StyleSlice } from "./style-slice";
import { createTailorSlice, type TailorSlice } from "./tailor-slice";

export type BuilderStore = ContentSlice & StyleSlice & TailorSlice;

export const useBuilderStore = create<BuilderStore>()((...args) => ({
  ...createContentSlice(...args),
  ...createStyleSlice(...args),
  ...createTailorSlice(...args),
}));
