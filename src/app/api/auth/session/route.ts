
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { uid } = await request.json();

  if (!uid) {
    return NextResponse.json({ error: 'UID is required' }, { status: 400 });
  }

  const cookieStore = await cookies();
  
  cookieStore.set('session-uid', uid, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });

  return NextResponse.json({ success: true });
}

export async function DELETE() {
    const cookieStore = await cookies();
    cookieStore.delete('session-uid');
    return NextResponse.json({ success: true });
}
