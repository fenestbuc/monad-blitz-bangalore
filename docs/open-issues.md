# Open Issues & Identified Bugs

1. **Intrusive Verification Alerts**: The application uses native `window.alert` to display hash verification results. This is a blocking operation and provides a poor user experience for a production-grade application.
2. **Accidental Deletions**: Deleting a note occurs instantly when the "Delete" button is clicked. There is no confirmation prompt, which can easily lead to accidental data loss.
3. **Missing Keyboard Shortcuts**: Power users and agents interacting via keyboard cannot save a note rapidly; they must manually click the "Sign and Anchor" button. `Cmd/Ctrl + Enter` should be supported.
4. **Unscalable Sidebar**: As the notebook grows, finding a specific note by an agent becomes impossible because there is no search or filter functionality in the sidebar.
5. **Vercel Ephemeral Storage Compatibility**: The application uses `better-sqlite3` writing to `/tmp/notebook.db` on Vercel. Serverless environments have an ephemeral filesystem, meaning the SQLite database will reset upon every cold start. 
6. **On-Chain Index Mapping Missing**: The smart contract stores notes sequentially but the Next.js DB does not map the `id` to the smart contract's `index`.
