import type { APIRoute } from 'astro';
import { invalidateSession } from '../../middleware';

export const GET: APIRoute = async ({ cookies, redirect }) => {
  // Get the session token before clearing
  const sessionToken = cookies.get('admin_auth')?.value;

  // Invalidate the session in the store
  if (sessionToken) {
    invalidateSession(sessionToken);
  }

  // Clear the auth cookie (both current path: '/' and legacy path: '/admin')
  cookies.delete('admin_auth', { path: '/' });
  cookies.delete('admin_auth', { path: '/admin' });

  // Redirect to home page
  return redirect('/');
};
