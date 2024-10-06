'use client';

import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import styles from '../LoginPopup/LoginPopup.module.css';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  // Normal login handler
  const handleLogin = async () => {
    setError('');
    if (!email || !password) {
      setError('Both fields are required');
      return;
    }

    try {
      const res = await fetch('http://localhost:4000/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token); // Store token
        router.push('/'); // Redirect to homepage after login
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      setError('Error during login');
    }
  };

  // Handle Google login
  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const res = await fetch('http://localhost:4000/user/google-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: credentialResponse.credential,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token); // Store token
        router.push('/'); // Redirect to homepage after successful login
      } else {
        setError(data.message || 'Google login failed');
      }
    } catch (error) {
      setError('Google login failed');
    }
  };

  return (
    <div>
      {error && <p className={styles.authErrorMessage}>{error}</p>}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Log In</button>

      <p>or</p>

      <GoogleLogin
        onSuccess={handleGoogleSuccess} // Google login handler
        onError={() => {
          setError('Google Sign In Failed');
        }}
      />
    </div>
  );
}
