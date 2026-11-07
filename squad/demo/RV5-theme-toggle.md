# RV5 · Theme toggle

<!-- Placeholder: replace with the real ticket. The first line (# RV5 · …) becomes the ClickUp task name;
     everything below it becomes the task description. Keep it a ticket, not a spec: the PM writes the Spec. -->

## Goal
Let people switch between the Calm (light) and Midnight (dark) themes from inside the app.

## Scope
- A toggle on Home: Light, Dark, or System (follow the device). Default: System.
- The choice is remembered across app restarts on iOS, Android and web.
- Every existing screen follows the chosen theme immediately.

## Acceptance criteria
1. Choosing Light or Dark changes every screen at once, with no reload.
2. Choosing System follows the device setting, including when it changes while the app is open.
3. The choice survives a restart on web and on a phone.
4. No hard-coded colours: everything comes from the theme tokens.

## Out of scope
- New themes or colour changes.
- Syncing the choice across devices (no backend change).
