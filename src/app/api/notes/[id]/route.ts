import { NextResponse } from 'next/server';
import { getNoteById, updateNote, deleteNote, setTxHash } from '@/lib/storage';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const note = getNoteById(id);
    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }
    return NextResponse.json(note);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch note' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Check if we are ONLY updating the tx_hash
    if (body.tx_hash !== undefined && Object.keys(body).length === 1) {
       const updated = setTxHash(id, body.tx_hash);
       if (!updated) {
         return NextResponse.json({ error: 'Note not found' }, { status: 404 });
       }
       return NextResponse.json(updated);
    }
    
    const { title, content } = body;
    
    if (!title || !content) {
      return NextResponse.json({ error: 'Missing required fields for update' }, { status: 400 });
    }

    const updatedNote = updateNote(id, title, content);
    if (!updatedNote) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }
    
    return NextResponse.json(updatedNote);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update note' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    deleteNote(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
  }
}
