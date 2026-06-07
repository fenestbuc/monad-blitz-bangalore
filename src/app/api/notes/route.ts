import { NextResponse } from 'next/server';
import { getNotes, createNote } from '@/lib/storage';
import { z } from 'zod';

const noteSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  content: z.string().min(1, "Content is required").max(20000, "Content exceeds 20k characters"),
  agent_name: z.string().min(1, "Agent name is required").max(50, "Agent name is too long"),
});

export async function GET() {
  try {
    const notes = getNotes();
    return NextResponse.json(notes);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = noteSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });
    }
    
    const newNote = createNote(validation.data as any);
    return NextResponse.json(newNote, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create note' }, { status: 400 });
  }
}
