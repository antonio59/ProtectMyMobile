import { defineMiddleware } from 'astro:middleware';
import { checkRateLimit, getClientIp } from './lib/security';

const ADMIN_PASSWORD = import.meta.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;

// JWT implementation using Web Crypto API (stateless, works on serverless)
async function importKey(secret: string) {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

async function signJWT(payload: object, secret: string): Promise<string> {
  const key = await importKey(secret);
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(`${header}.${body}`)
  );
  const sigBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)));
  return `${header}.${body}.${sigBase64}`;
}

async function verifyJWT(token: string, secret: string): Promise<any | null> {
  const [header, body, sig] = token.split('.');
  if (!header || !body || !sig) return null;
  try {
    const key = await importKey(secret);
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      Uint8Array.from(atob(sig.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0)),
      new TextEncoder().encode(`${header}.${body}`)
    );
    if (!valid) return null;
    return JSON.parse(atob(body));
  } catch {
    return null;
  }
}

export function invalidateSession(_token: string): void {
  // No-op: JWTs are stateless; logout clears the client cookie
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // Only protect /admin routes
  if (!pathname.startsWith('/admin')) {
    return next();
  }

  // Check for valid JWT in cookie
  const authCookie = context.cookies.get('admin_auth');
  if (authCookie?.value && ADMIN_PASSWORD) {
    const payload = await verifyJWT(authCookie.value, ADMIN_PASSWORD);
    if (payload && payload.exp > Date.now()) {
      return next();
    }
  }

  // Check for login form submission
  if (context.request.method === 'POST') {
    const ip = getClientIp(context.request);
    const rateLimited = checkRateLimit(`admin-login:${ip}`, 5, 5 * 60_000);
    if (rateLimited) return rateLimited;
    const formData = await context.request.formData();
    const password = formData.get('password');

    if (password === ADMIN_PASSWORD) {
      const token = await signJWT(
        { exp: Date.now() + 24 * 60 * 60 * 1000 },
        ADMIN_PASSWORD
      );

      context.cookies.set('admin_auth', token, {
        path: '/',
        maxAge: 60 * 60 * 24,
        httpOnly: true,
        secure: import.meta.env.PROD,
        sameSite: 'strict',
      });

      return context.redirect(pathname);
    }
  }

  // Show login page
  const isWrongPassword = context.request.method === 'POST';

  return new Response(generateLoginPage(isWrongPassword), {
    status: 401,
    headers: {
      'Content-Type': 'text/html',
    },
  });
});

function generateLoginPage(showError: boolean): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Login | ProtectMyMobile</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .login-container {
      background: white;
      border-radius: 16px;
      padding: 40px;
      width: 100%;
      max-width: 400px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }
    .logo {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo h1 {
      font-size: 24px;
      color: #1a1a2e;
    }
    .logo span {
      color: #e94560;
    }
    h2 {
      text-align: center;
      color: #333;
      margin-bottom: 8px;
      font-size: 20px;
    }
    .subtitle {
      text-align: center;
      color: #666;
      margin-bottom: 30px;
      font-size: 14px;
    }
    .error {
      background: #fee2e2;
      border: 1px solid #fecaca;
      color: #dc2626;
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 20px;
      font-size: 14px;
      text-align: center;
    }
    form { display: flex; flex-direction: column; gap: 16px; }
    label {
      font-weight: 500;
      color: #374151;
      font-size: 14px;
    }
    input[type="password"] {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      font-size: 16px;
      transition: border-color 0.2s;
    }
    input[type="password"]:focus {
      outline: none;
      border-color: #e94560;
    }
    button {
      background: #e94560;
      color: white;
      border: none;
      padding: 14px 24px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }
    button:hover { background: #d63550; }
    .back-link {
      text-align: center;
      margin-top: 20px;
    }
    .back-link a {
      color: #6b7280;
      text-decoration: none;
      font-size: 14px;
    }
    .back-link a:hover { color: #e94560; }
  </style>
</head>
<body>
  <div class="login-container">
    <div class="logo">
      <h1>Protect<span>My</span>Mobile</h1>
    </div>
    <h2>Admin Access</h2>
    <p class="subtitle">Enter password to continue</p>
    
    ${showError ? '<div class="error">Incorrect password. Please try again.</div>' : ''}
    
    <form method="POST">
      <div>
        <label for="password">Password</label>
        <input type="password" id="password" name="password" required autofocus placeholder="Enter admin password">
      </div>
      <button type="submit">Sign In</button>
    </form>
    
    <div class="back-link">
      <a href="/">← Back to site</a>
    </div>
  </div>
</body>
</html>
`;
}
