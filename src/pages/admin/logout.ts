import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ cookies, redirect }) => {
  // Clear the auth cookie
  cookies.delete('admin_auth', { path: '/admin' });
  
  // Redirect to home page
  return redirect('/');
};
