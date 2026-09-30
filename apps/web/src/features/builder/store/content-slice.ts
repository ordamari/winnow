import type { StateCreator } from "zustand"
import {
  buildInitialSelections,
  type PersonalInfo,
  type ResumeData,
  type ResumeSelections,
  type TailorResult,
} from "@winnow/core"

import type { BuilderStore } from "./builder-store"

function slugId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

const emptyPersonalInfo: PersonalInfo = {
  name: "",
  title: "",
  phone: "",
  email: "",
  linkedin: "",
  github: "",
}

const emptySelections: ResumeSelections = {
  selectedVersionById: {},
  selectedTitle: "",
  enabledSkills: {},
  enabledBullets: {},
  enabledHighlights: {},
  experienceTitles: {},
  skillList: [],
  categoryList: [],
  skillCategoryId: {},
}

export type ContentSlice = {
  bank: ResumeData | null
  selections: ResumeSelections
  personalInfo: PersonalInfo
  hydrate: (data: ResumeData) => void
  updatePersonalInfo: <K extends keyof PersonalInfo>(
    key: K,
    value: PersonalInfo[K]
  ) => void
  resetContent: () => void
  applyContentSelections: (result: TailorResult) => void
  toggleSkill: (skillId: string) => void
  toggleBullet: (bulletId: string) => void
  toggleHighlight: (highlightId: string) => void
  setVersion: (slotId: string, versionId: string) => void
  setTitle: (title: string) => void
  setExperienceTitle: (expId: string, title: string) => void
  addCategory: (label: string) => void
  removeCategory: (categoryId: string) => void
  renameCategory: (categoryId: string, label: string) => void
  assignSkill: (skillId: string, categoryId: string | null) => void
}

export const createContentSlice: StateCreator<
  BuilderStore,
  [],
  [],
  ContentSlice
> = (set, get) => ({
  bank: null,
  selections: emptySelections,
  personalInfo: emptyPersonalInfo,
  hydrate: (data) => {
    set({
      bank: data,
      selections: buildInitialSelections(data),
      personalInfo: { ...data.personalInfo },
      bulletMatches: {},
      highlightMatches: {},
      jdMatch: null,
    })
  },
  updatePersonalInfo: (key, value) => {
    set((state) => ({
      personalInfo: { ...state.personalInfo, [key]: value },
    }))
  },
  resetContent: () => {
    const bank = get().bank
    if (!bank) return
    set({
      selections: buildInitialSelections(bank),
      personalInfo: { ...bank.personalInfo },
      bulletMatches: {},
      highlightMatches: {},
      jdMatch: null,
    })
  },
  applyContentSelections: (result) => {
    set((state) => ({
      selections: {
        ...state.selections,
        selectedTitle: result.selectedTitle,
        selectedVersionById: {
          ...state.selections.selectedVersionById,
          ...result.selectedVersionById,
        },
        experienceTitles: {
          ...state.selections.experienceTitles,
          ...result.experienceTitles,
        },
        enabledSkills: {
          ...state.selections.enabledSkills,
          ...result.enabledSkills,
        },
        enabledBullets: {
          ...state.selections.enabledBullets,
          ...result.enabledBullets,
        },
        enabledHighlights: {
          ...state.selections.enabledHighlights,
          ...result.enabledHighlights,
        },
        skillCategoryId: {
          ...state.selections.skillCategoryId,
          ...result.skillCategoryId,
        },
      },
      bulletMatches: result.bulletMatches,
      highlightMatches: result.highlightMatches,
      jdMatch: result.jdMatch,
    }))
  },
  toggleSkill: (skillId) => {
    set((state) => ({
      selections: {
        ...state.selections,
        enabledSkills: {
          ...state.selections.enabledSkills,
          [skillId]: !state.selections.enabledSkills[skillId],
        },
      },
    }))
  },
  toggleBullet: (bulletId) => {
    set((state) => ({
      selections: {
        ...state.selections,
        enabledBullets: {
          ...state.selections.enabledBullets,
          [bulletId]: !state.selections.enabledBullets[bulletId],
        },
      },
    }))
  },
  toggleHighlight: (highlightId) => {
    set((state) => ({
      selections: {
        ...state.selections,
        enabledHighlights: {
          ...state.selections.enabledHighlights,
          [highlightId]: !state.selections.enabledHighlights[highlightId],
        },
      },
    }))
  },
  setVersion: (slotId, versionId) => {
    set((state) => ({
      selections: {
        ...state.selections,
        selectedVersionById: {
          ...state.selections.selectedVersionById,
          [slotId]: versionId,
        },
      },
    }))
  },
  setTitle: (title) => {
    set((state) => ({
      selections: { ...state.selections, selectedTitle: title },
    }))
  },
  setExperienceTitle: (expId, title) => {
    set((state) => ({
      selections: {
        ...state.selections,
        experienceTitles: {
          ...state.selections.experienceTitles,
          [expId]: title,
        },
      },
    }))
  },
  addCategory: (label) => {
    const trimmed = label.trim()
    if (!trimmed) return
    const id = slugId("cat")
    set((state) => ({
      selections: {
        ...state.selections,
        categoryList: [
          ...state.selections.categoryList,
          { id, label: trimmed },
        ],
      },
    }))
  },
  removeCategory: (categoryId) => {
    set((state) => {
      const skillCategoryId = { ...state.selections.skillCategoryId }
      for (const skillId of Object.keys(skillCategoryId)) {
        if (skillCategoryId[skillId] === categoryId) {
          skillCategoryId[skillId] = null
        }
      }
      return {
        selections: {
          ...state.selections,
          categoryList: state.selections.categoryList.filter(
            (category) => category.id !== categoryId
          ),
          skillCategoryId,
        },
      }
    })
  },
  renameCategory: (categoryId, label) => {
    set((state) => ({
      selections: {
        ...state.selections,
        categoryList: state.selections.categoryList.map((category) =>
          category.id === categoryId ? { ...category, label } : category
        ),
      },
    }))
  },
  assignSkill: (skillId, categoryId) => {
    set((state) => ({
      selections: {
        ...state.selections,
        skillCategoryId: {
          ...state.selections.skillCategoryId,
          [skillId]: categoryId,
        },
      },
    }))
  },
})
