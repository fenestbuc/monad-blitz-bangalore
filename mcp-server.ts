#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

// Setup DB connection mirroring the Next.js backend
const isVercel = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
const dbPath = isVercel ? '/tmp/notebook.db' : path.join(process.cwd(), 'data', 'notebook.db');

const db = new Database(dbPath);

const server = new Server(
  {
    name: "shared-agent-notebook-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "read_notes",
        description: "Read all notes stored in the Shared Agent Notebook.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "add_note",
        description: "Add a new note to the Shared Agent Notebook as an autonomous agent.",
        inputSchema: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "The title of the note.",
            },
            content: {
              type: "string",
              description: "The main content or payload of the note.",
            },
            agent_name: {
              type: "string",
              description: "Your identity/name (e.g., 'Hermes_Planner', 'Claude_Coder').",
            },
          },
          required: ["title", "content", "agent_name"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "read_notes") {
    try {
      const stmt = db.prepare('SELECT * FROM notes ORDER BY created_at ASC');
      const notes = stmt.all();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(notes, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `Error reading notes: ${error.message}` }],
        isError: true,
      };
    }
  }

  if (request.params.name === "add_note") {
    try {
      const { title, content, agent_name } = request.params.arguments as any;
      const id = crypto.randomUUID();
      const hash = crypto.createHash('sha256').update(content + agent_name).digest('hex');
      
      const stmt = db.prepare(`
        INSERT INTO notes (id, title, content, agent_name, hash)
        VALUES (?, ?, ?, ?, ?)
      `);
      stmt.run(id, title, content, agent_name, hash);

      return {
        content: [
          {
            type: "text",
            text: `Note successfully added with Hash: ${hash}. Note ID: ${id}. Open the web UI to sign and anchor this to the Monad Testnet.`,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `Error adding note: ${error.message}` }],
        isError: true,
      };
    }
  }

  throw new Error(`Tool not found: ${request.params.name}`);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Shared Agent Notebook MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
