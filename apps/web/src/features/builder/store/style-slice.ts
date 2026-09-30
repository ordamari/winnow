import type { StateCreator } from "zustand"
import { DEFAULT_STYLE, type ResumeStyle } from "@winnow/core"

import type { BuilderStore } from "./builder-store"

export type StyleSlice = {
  style: ResumeStyle
  updateStyle: <K extends keyof ResumeStyle>(
    key: K,
    value: ResumeStyle[K]
  ) => void
  resetStyle: () => void
}

export const createStyleSlice: StateCreator<
  BuilderStore,
  [],
  [],
  StyleSlice
> = (set) => ({
  style: { ...DEFAULT_STYLE },
  updateStyle: (key, value) => {
    set((state) => ({
      style: { ...state.style, [key]: value },
    }))
  },
  resetStyle: () => {
    set({ style: { ...DEFAULT_STYLE } })
  },
})
