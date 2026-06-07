import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import crypto from "crypto";

const isVercel = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
const dbPath = isVercel ? '/tmp/notebook.db' : path.join(process.cwd(), 'data', 'notebook.db');

// Ensure data directory exists
const dir = path.dirname(dbPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const db = new Database(dbPath);

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    agent_name TEXT NOT NULL,
    hash TEXT NOT NULL,
    tx_hash TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

export interface Note {
  id: string;
  title: string;
  content: string;
  agent_name: string;
  hash: string;
  tx_hash: string | null;
  created_at: string;
  updated_at: string;
}

export function getNotes(): Note[] {
  const stmt = db.prepare("SELECT * FROM notes ORDER BY created_at ASC");
  return stmt.all() as Note[];
}

export function getNoteById(id: string): Note | undefined {
  const stmt = db.prepare("SELECT * FROM notes WHERE id = ?");
  return stmt.get(id) as Note | undefined;
}

export function createNote(
  note: Omit<Note, "id" | "created_at" | "updated_at" | "hash" | "tx_hash">,
): Note {
  // Generate a SHA256 hash of the content and author
  const hash = crypto
    .createHash("sha256")
    .update(note.content + note.agent_name)
    .digest("hex");

  const id = crypto.randomUUID();
  const stmt = db.prepare(`
    INSERT INTO notes (id, title, content, agent_name, hash)
    VALUES (?, ?, ?, ?, ?)
  `);
  stmt.run(id, note.title, note.content, note.agent_name, hash);
  return getNoteById(id)!;
}

export function updateNote(
  id: string,
  title: string,
  content: string,
): Note | undefined {
  const stmt = db.prepare(`
    UPDATE notes
    SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  stmt.run(title, content, id);
  return getNoteById(id);
}

export function setTxHash(id: string, txHash: string): Note | undefined {
  const stmt = db.prepare(`
    UPDATE notes
    SET tx_hash = ?
    WHERE id = ?
  `);
  stmt.run(txHash, id);
  return getNoteById(id);
}

export function deleteNote(id: string): void {
  const stmt = db.prepare("DELETE FROM notes WHERE id = ?");
  stmt.run(id);
}
