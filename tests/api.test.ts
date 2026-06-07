import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST, PUT, DELETE } from '../src/app/api/notes/route';
import * as routeId from '../src/app/api/notes/[id]/route';
import * as storage from '../src/lib/storage';

vi.mock('../src/lib/storage', () => ({
  getNotes: vi.fn(),
  getNoteById: vi.fn(),
  createNote: vi.fn(),
  updateNote: vi.fn(),
  setTxHash: vi.fn(),
  deleteNote: vi.fn(),
}));

describe('API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/notes', () => {
    it('returns all notes', async () => {
      const mockNotes = [{ id: '1', title: 'Note 1' }];
      (storage.getNotes as any).mockReturnValue(mockNotes);

      const res = await GET();
      const data = await res.json();
      
      expect(res.status).toBe(200);
      expect(data).toEqual(mockNotes);
    });
  });

  describe('POST /api/notes', () => {
    it('creates a new note successfully', async () => {
      const mockNote = { id: '1', title: 'New Note', content: 'test', agent_name: 'agent' };
      (storage.createNote as any).mockReturnValue(mockNote);

      const req = new Request('http://localhost/api/notes', {
        method: 'POST',
        body: JSON.stringify({ title: 'New Note', content: 'test', agent_name: 'agent' })
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data).toEqual(mockNote);
      expect(storage.createNote).toHaveBeenCalled();
    });

    it('returns 400 on missing fields', async () => {
      const req = new Request('http://localhost/api/notes', {
        method: 'POST',
        body: JSON.stringify({ title: 'New Note' })
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/notes/[id]', () => {
    it('updates tx_hash separately', async () => {
      const mockUpdated = { id: '1', tx_hash: '0x123' };
      (storage.setTxHash as any).mockReturnValue(mockUpdated);

      const req = new Request('http://localhost/api/notes/1', {
        method: 'PUT',
        body: JSON.stringify({ tx_hash: '0x123' })
      });

      const res = await routeId.PUT(req, { params: Promise.resolve({ id: '1' }) });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toEqual(mockUpdated);
      expect(storage.setTxHash).toHaveBeenCalledWith('1', '0x123');
    });

    it('returns 400 on missing update fields', async () => {
      const req = new Request('http://localhost/api/notes/1', {
        method: 'PUT',
        body: JSON.stringify({ title: 'Missing Content' })
      });

      const res = await routeId.PUT(req, { params: Promise.resolve({ id: '1' }) });
      expect(res.status).toBe(400);
    });
  });
});
