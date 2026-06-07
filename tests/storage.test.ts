import { test, expect } from 'vitest';
import { createNote, getNotes, deleteNote } from '../src/lib/storage/index';

test('create and retrieve note', () => {
  const newNote = createNote({
    title: 'Test Note',
    content: 'This is a test note',
    agent_name: 'test-agent'
  });

  expect(newNote.title).toBe('Test Note');
  expect(newNote.content).toBe('This is a test note');
  expect(newNote.agent_name).toBe('test-agent');
  expect(newNote.hash).toBeDefined();

  const notes = getNotes();
  const found = notes.find(n => n.id === newNote.id);
  expect(found).toBeDefined();

  // Clean up
  deleteNote(newNote.id);
});
