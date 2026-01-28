import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AuthPageClient } from '@/components/auth/AuthPageClient';

export default async function AuthPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('session-uid')?.value;

  // If user is already authenticated, redirect to dashboard server-side
  if (userId) {
    redirect('/prompts');
  }

  return <AuthPageClient />;
}