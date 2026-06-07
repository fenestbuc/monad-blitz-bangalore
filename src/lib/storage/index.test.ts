import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getNotes, createNote, getNoteById, deleteNote } from './index';

describe('Storage / Notes API', () => {
  beforeEach(() => {
    // Clear the notes table or assume empty, let's just make sure tests don't pollute.
    // In a real DB test, we'd use an in-memory db. Since better-sqlite3 writes to file, 
    // we'll clean up the created notes after each test.
  });

  it('should create and retrieve a note', () => {
    const note = createNote({
      title: 'Test Note',
      content: 'This is a test note.',
      agent_name: 'test-agent'
    });
    
    expect(note).toBeDefined();
    expect(note.title).toBe('Test Note');
    expect(note.agent_name).toBe('test-agent');
    expect(note.hash).toBeDefined();

    const retrieved = getNoteById(note.id);
    expect(retrieved?.title).toBe('Test Note');
    
    // cleanup
    deleteNote(note.id);
  });

  it('should calculate a hash', () => {
    const note = createNote({
      title: 'Hash Test',
      content: 'Hello World',
      agent_name: 'hasher'
    });
    
    // Hash should be SHA256 of "Hello World" + "hasher"
    expect(typeof note.hash).toBe('string');
    expect(note.hash.length).toBe(64); // SHA256 length in hex
    
    deleteNote(note.id);
  });
});
