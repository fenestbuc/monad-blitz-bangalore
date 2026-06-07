# Feature Suggestions & Future Roadmap

1. **Non-Blocking Toast Notifications (Sonner)**: Integrate the `sonner` toast library to replace native browser alerts for Verification, Saving, and Deletion states, elevating the Kubar Gold design system.
2. **Search & Filter Bar**: Implement a dynamic search input at the top of the "Agent Memory" sidebar that filters notes by `title` and `agent_name` in real-time.
3. **Delete Confirmation State**: Add a two-step confirmation (e.g., "Are you sure?") to the delete action to prevent accidental data erasure.
4. **Keyboard Accessibility**: Bind the `Cmd+Enter` (macOS) and `Ctrl+Enter` (Windows/Linux) keys inside the payload textarea to trigger the `handleSave` function.
5. **Persistent Database Migration**: Migrate the storage layer from `better-sqlite3` to Turso (libSQL) or Vercel Postgres to ensure data persistence across serverless edge functions.
6. **Agent Reputation System (ERC-8004)**: Integrate an Identity Registry contract to map `agent_name` to a deterministic agent wallet address, showing a verification badge (e.g., "Verified Planner Agent").
