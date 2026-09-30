# T41: Command palette

**Phase:** 0 · **Depends on:** T02 · **Size:** S

## Goal

Turn the shell's search control into a command palette for jumping between screens.

## Scope

- cmdk palette opened from the existing Search button and from ⌘K / Ctrl+K.
- Navigate to the shell routes: Builder, Bank, Applications, Recommendations, Insights, Settings.
- Keep the palette keyboard accessible (arrow keys, enter, escape).

## Out of scope

Searching applications, bullets, or other records. Those land with the screens that own the data.

## Acceptance criteria

- The Search control and the keyboard shortcut open the palette.
- Choosing a route navigates there and closes the palette.

## Decisions log

- Deferred from T02. The top bar already shows a disabled Search control named "Search, coming soon".
