# K1 Streamlined Edit Mode

The **Streamlined Edit Mode** (`/ownership/{interestId}/k1-streamlined`) provides a multi-year, spreadsheet-like view of all K-1 form data for an ownership interest.

## Overview

Instead of editing one tax year at a time, the streamlined view displays all years as columns with every K-1 field as a row, enabling rapid data entry across multiple years.

## Key Features

### Auto-Save on Blur

Fields save automatically when you leave them (on blur). There is **no save button** — changes are persisted in the background as you tab through fields.

- **Client state is source of truth** — the page does not reload after saves.
- A status indicator shows "Saving..." and "✓ Saved" in the header area.

### Keyboard Navigation

| Key             | Action                                      |
|-----------------|---------------------------------------------|
| `Tab`           | Move to next year (right), wrapping to next field |
| `Shift+Tab`     | Move to previous year (left), wrapping to previous field |
| `Arrow Up`      | Move to field above                         |
| `Arrow Down`    | Move to field below                         |
| `Ctrl+Arrow Left`  | Move to previous year                   |
| `Ctrl+Arrow Right` | Move to next year                        |

### Error Recovery

If a save fails (e.g., network error, server error):

- A **destructive alert banner** appears at the top of the page with the error details.
- **All fields become read-only** to prevent further data loss.
- The user must **refresh the page** to restore editing.

### Tax Year Begin/End Defaults

Tax year begin and end dates default to January 1 and December 31 of the tax year, respectively. The UI shows these as placeholder text when the value is null/blank or matches the default, reducing visual clutter.

The server (`K1FormController::store`) also applies these defaults when creating new forms.

## Technical Architecture

### Uncontrolled Cells with Local State

Each `K1Cell` component manages its own value via `useState`, independent of the parent component. This eliminates cascading re-renders — typing in one cell does not cause the entire table to re-render.

`K1Cell` is wrapped in `React.memo` to further prevent unnecessary re-renders when parent state (like `saveStatus`) changes.

### Ref-Based Data Store

Form data is stored in a `useRef` map (`formsDataRef`), not React state. This means:

- Updates to form data **do not trigger re-renders**.
- Saves always call a single **POST upsert** endpoint keyed by `ownership interest + tax year`.
- After a successful save, the server response updates the ref silently.

### Year-Keyed K-1 Access

K-1 forms are addressed by `ownership_interest_id + tax_year` (not by K-1 row ID):

- `GET /api/ownership-interests/{interest}/k1s/{taxYear}`
- `POST /api/ownership-interests/{interest}/k1s` (upsert; includes `tax_year`)

### Component Structure

```
k1-form-streamlined.tsx          # Vite entry point
  └── K1FormStreamlined.tsx      # Main component
       └── K1Cell (memoized)     # Per-field cell, local state
```

## Entry Point

The feature is mounted in `resources/views/k1-form-streamlined.blade.php` via the `k1-form-streamlined.tsx` entry point, which reads the `interestId` from a data attribute on the mount element.
