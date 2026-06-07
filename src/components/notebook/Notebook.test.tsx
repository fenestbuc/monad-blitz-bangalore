import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Notebook } from './Notebook';
import * as wagmi from 'wagmi';

// Mock wagmi hooks
vi.mock('wagmi', () => {
  return {
    useAccount: vi.fn(),
    useConnect: vi.fn(),
    useDisconnect: vi.fn(),
    useWriteContract: vi.fn(),
    useReadContract: vi.fn().mockReturnValue({ data: null, refetch: vi.fn() })
  };
});

// Mock Next.js fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Notebook Component UI & Logic', () => {
  const mockNotes = [
    {
      id: '1',
      title: 'Test Note 1',
      content: 'This is the first test note.',
      agent_name: 'agent-1',
      hash: 'mockhash1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Test Note 2',
      content: 'This is the second test note.',
      agent_name: 'agent-2',
      hash: 'mockhash2',
      tx_hash: '0xmocktx',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (wagmi.useAccount as any).mockReturnValue({ address: '0x123', isConnected: true });
    (wagmi.useConnect as any).mockReturnValue({ connect: vi.fn() });
    (wagmi.useDisconnect as any).mockReturnValue({ disconnect: vi.fn() });
    (wagmi.useWriteContract as any).mockReturnValue({ writeContractAsync: vi.fn() });

    mockFetch.mockImplementation((url) => {
      if (url === '/api/notes') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockNotes)
        });
      }
      return Promise.resolve({ ok: true });
    });
  });

  it('renders the initial UI state correctly', async () => {
    render(<Notebook />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Agent Memory')).toBeInTheDocument();
    });

    // Check if notes are loaded into the sidebar
    expect(screen.getByText('Test Note 1')).toBeInTheDocument();
    expect(screen.getByText('Test Note 2')).toBeInTheDocument();
    
    // Check if new note mode is active by default
    const newEntryElements = screen.getAllByText('New Entry');
    expect(newEntryElements.length).toBeGreaterThan(0);
    expect(screen.getByPlaceholderText('Observation log...')).toBeInTheDocument();
  });

  it('allows creating a new note', async () => {
    mockFetch.mockImplementationOnce((url, options) => {
      if (url === '/api/notes' && options?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ ...mockNotes[0], id: '3', title: 'New Note' })
        });
      }
      if (url === '/api/notes') return Promise.resolve({ ok: true, json: () => Promise.resolve(mockNotes) });
      return Promise.resolve({ ok: true });
    });

    render(<Notebook />);
    await waitFor(() => expect(screen.getByText('Agent Memory')).toBeInTheDocument());

    // Fill form
    fireEvent.change(screen.getByPlaceholderText('Observation log...'), { target: { value: 'New Note' } });
    fireEvent.change(screen.getByPlaceholderText('Write immutable payload here... (Markdown supported)'), { target: { value: 'New content' } });
    
    // Save
    const saveBtn = screen.getByText('Sign & Anchor on Monad');
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/notes', expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('New Note')
      }));
    });
  });

  it('displays transaction hash securely when present', async () => {
    render(<Notebook />);
    await waitFor(() => {
      expect(screen.getByText('Test Note 2')).toBeInTheDocument();
    });
    
    // Select the second note which has a tx_hash
    fireEvent.click(screen.getByText('Test Note 2'));
    
    await waitFor(() => {
      expect(screen.getByText('Secured on Monad Testnet')).toBeInTheDocument();
    });
  });
});
