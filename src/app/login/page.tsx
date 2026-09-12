"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import AppLogo from '../../components/AppLogo';
import BrandLogo from '../../components/BrandLogo';

function LoginForm() {
  const { status, data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  // Toggle state between 'signin' and 'signup'
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');

  // Input states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'user' | 'partner'>('user');

  // Form states
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const errorParam = searchParams.get('error');

  useEffect(() => {
    if (errorParam) {
      if (errorParam === 'OAuthSignin') {
        setErrorMsg("Google Sign-In failed to start (OAuthSignin). Please ensure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are configured in your Vercel Environment Variables.");
      } else if (errorParam === 'OAuthCallback') {
        setErrorMsg("Google Sign-In callback failed (OAuthCallback). Please ensure 'https://www.earnbyapps.com/api/auth/callback/google' and 'https://earnbyapps.com/api/auth/callback/google' are added to Authorized redirect URIs in Google Cloud Console, and NEXTAUTH_URL is set in Vercel.");
      } else if (errorParam === 'CredentialsSignin') {
        setErrorMsg("Invalid email or password. Please try again.");
      } else if (errorParam === 'OAuthAccountNotLinked') {
        setErrorMsg("This email is already associated with another login method.");
      } else if (errorParam === 'AccessDenied') {
        setErrorMsg("Access denied. Your account may be blocked or restricted.");
      } else {
        setErrorMsg(`Sign-in error: ${errorParam}`);
      }
    }
  }, [errorParam]);

  // If already logged in, redirect away
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const userRole = (session.user as any).role;
      if (userRole === 'admin') {
        router.push('/admin');
      } else if (userRole === 'partner') {
        router.push('/partner/overview');
      } else {
        router.push('/');
      }
    }
  }, [status, session, router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await signIn('credentials', {
        email: email,
        password: password,
        redirect: false
      });

      if (res?.error) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg("Logged in successfully! Redirecting...");
        setTimeout(() => {
          router.push(callbackUrl);
        }, 1500);
      }
    } catch (err: any) {
      setErrorMsg("An unexpected sign in error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      const registerRes = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          fullName,
          role
        })
      });

      const registerData = await registerRes.json();

      if (!registerRes.ok) {
        setErrorMsg(registerData.error || "Registration failed.");
        setIsLoading(false);
        return;
      }

      // Success - automatically sign them in
      setSuccessMsg("Registration successful! Logging you in...");
      
      const loginRes = await signIn('credentials', {
        email: email,
        password: password,
        redirect: false
      });

      if (loginRes?.error) {
        setErrorMsg("Registration succeeded, but login failed: " + loginRes.error);
        setIsLoading(false);
      } else {
        setTimeout(() => {
          router.push(callbackUrl);
        }, 1500);
      }
    } catch (err: any) {
      setErrorMsg("An unexpected sign up error occurred.");
      setIsLoading(false);
    }
  };

  const triggerGoogleSignIn = () => {
    signIn('google', { callbackUrl });
  };

  return (
    <div className="login-page-root">
      <div className="login-card-container">
        
        {/* Top Glow bar */}
        <div className="login-card-glow-bar"></div>

        <div className="login-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <AppLogo size={48} showSparkle />
          <div style={{ marginTop: '4px' }}>
            <BrandLogo fontSize="1.5rem" />
          </div>
          <p>Sign in or create an account to start earning or listing apps.</p>
        </div>

        {/* Continue with Google on TOP */}
        <button 
          type="button" 
          onClick={triggerGoogleSignIn}
          className="google-signin-btn"
          style={{ marginBottom: '20px' }}
        >
          <svg className="google-svg-icon" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </button>

        <div className="login-separator" style={{ marginBottom: '24px' }}>
          <span>OR CONTINUE WITH EMAIL</span>
        </div>

        {/* Tab Toggle */}
        <div className="login-tabs">
          <button 
            type="button" 
            className={`tab-btn ${activeTab === 'signin' ? 'active' : ''}`}
            onClick={() => { setActiveTab('signin'); setErrorMsg(null); }}
          >
            Sign In
          </button>
          <button 
            type="button" 
            className={`tab-btn ${activeTab === 'signup' ? 'active' : ''}`}
            onClick={() => { setActiveTab('signup'); setErrorMsg(null); }}
          >
            Sign Up
          </button>
        </div>

        {errorMsg && (
          <div className="alert-box error-alert">
            <span>⚠️</span> {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="alert-box success-alert">
            <span>🎉</span> {successMsg}
          </div>
        )}

        {activeTab === 'signin' ? (
          <form onSubmit={handleSignIn} className="login-form">
            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="you@example.com" 
                required 
              />
            </div>
            
            <div className="form-group">
              <label>Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••" 
                required 
              />
            </div>

            <button type="submit" className="login-submit-btn" disabled={isLoading}>
              {isLoading ? "Signing In..." : "Sign In"}
            </button>

            <div style={{ marginTop: '12px', padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px dashed var(--border-color)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <div style={{ fontWeight: 600, marginBottom: '6px', color: 'var(--text-primary)' }}>Quick Demo Logins:</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button 
                  type="button" 
                  onClick={() => { setEmail('aashish.gupta.mails@gmail.com'); setPassword('password123'); setErrorMsg(null); }}
                  style={{ background: 'var(--bg-dark)', border: '1px solid var(--border-color)', color: 'var(--accent-cyan)', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.72rem' }}
                >
                  Admin Demo
                </button>
                <button 
                  type="button" 
                  onClick={() => { setEmail('tester@example.com'); setPassword('password123'); setErrorMsg(null); }}
                  style={{ background: 'var(--bg-dark)', border: '1px solid var(--border-color)', color: 'var(--accent-cyan)', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.72rem' }}
                >
                  User Demo
                </button>
              </div>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSignUp} className="login-form">
            <div className="form-group">
              <label>Full Name</label>
              <input 
                type="text" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
                placeholder="John Doe" 
                required 
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="you@example.com" 
                required 
              />
            </div>
            
            <div className="form-group">
              <label>Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Minimum 6 characters" 
                required 
              />
            </div>

            <div className="form-group">
              <label>I want to:</label>
              <div className="role-selector-container">
                <button
                  type="button"
                  className={`role-btn ${role === 'user' ? 'active' : ''}`}
                  onClick={() => setRole('user')}
                >
                  💵 Earn Money
                </button>
                <button
                  type="button"
                  className={`role-btn ${role === 'partner' ? 'active' : ''}`}
                  onClick={() => setRole('partner')}
                >
                  🚀 List Campaigns
                </button>
              </div>
            </div>

            <button type="submit" className="login-submit-btn" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>
        )}

      </div>

      <style>{`
        .login-page-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-dark);
          padding: 24px;
          transition: background-color 0.2s ease;
        }

        .login-card-container {
          width: 100%;
          max-width: 440px;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 40px 32px;
          box-shadow: var(--shadow-premium);
          position: relative;
          transition: background-color 0.2s ease, border-color 0.2s ease;
        }

        .login-card-glow-bar {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #06b6d4 0%, #4f46e5 100%);
          border-top-left-radius: 16px;
          border-top-right-radius: 16px;
        }

        .login-header {
          text-align: center;
          margin-bottom: 28px;
        }

        .logo-emoji {
          font-size: 2.2rem;
          display: block;
          margin-bottom: 12px;
        }

        .login-header h2 {
          font-family: var(--font-display);
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0 0 8px 0;
          letter-spacing: -0.02em;
        }

        .login-header p {
          font-size: 0.82rem;
          color: var(--text-secondary);
          margin: 0;
          line-height: 1.5;
        }

        .login-tabs {
          display: flex;
          background: var(--bg-dark);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 4px;
          margin-bottom: 24px;
        }

        .tab-btn {
          flex: 1;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          padding: 8px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .tab-btn.active {
          background: var(--bg-card);
          color: var(--text-primary);
          box-shadow: var(--shadow-sm);
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .alert-box {
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 0.8rem;
          margin-bottom: 20px;
          line-height: 1.4;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .error-alert {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #f87171;
        }

        .success-alert {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
          color: #34d399;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group label {
          font-size: 0.74rem;
          text-transform: uppercase;
          color: var(--text-secondary);
          font-weight: 700;
          letter-spacing: 0.05em;
        }

        .form-group input {
          width: 100%;
          background: var(--bg-dark);
          border: 1px solid var(--border-color);
          padding: 10px 14px;
          border-radius: 8px;
          color: var(--text-primary);
          font-size: 0.9rem;
          outline: none;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }

        .form-group input:focus {
          border-color: var(--accent-cyan);
          background: rgba(6, 182, 212, 0.03);
          box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.15);
        }

        .role-selector-container {
          display: flex;
          gap: 10px;
        }

        .role-btn {
          flex: 1;
          background: var(--bg-dark);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          padding: 10px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.82rem;
          font-weight: 600;
          transition: all 0.2s;
        }

        .role-btn.active {
          border-color: var(--accent-cyan);
          background: rgba(6, 182, 212, 0.12);
          color: var(--accent-cyan);
        }

        .login-submit-btn {
          background: linear-gradient(90deg, #06b6d4 0%, #0891b2 100%);
          color: #000000;
          border: none;
          padding: 12px;
          border-radius: 8px;
          font-weight: 800;
          cursor: pointer;
          font-size: 0.92rem;
          transition: all 0.2s;
          margin-top: 8px;
        }

        .login-submit-btn:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        .login-separator {
          text-align: center;
          margin: 20px 0;
          position: relative;
        }

        .login-separator::before {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          top: 50%;
          height: 1px;
          background: var(--border-color);
          z-index: 1;
        }

        .login-separator span {
          background: var(--bg-card);
          padding: 0 10px;
          font-size: 0.72rem;
          color: var(--text-muted);
          position: relative;
          z-index: 2;
          font-weight: 700;
        }

        .google-signin-btn {
          width: 100%;
          background: var(--bg-dark);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          padding: 12px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.88rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.2s;
        }

        .google-signin-btn:hover {
          background: var(--bg-card-hover);
          border-color: var(--border-hover);
        }

        .google-svg-icon {
          width: 18px;
          height: 18px;
        }
      `}</style>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#06080c',
        color: '#ffffff',
        fontFamily: 'sans-serif'
      }}>
        Loading Account Portal...
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
