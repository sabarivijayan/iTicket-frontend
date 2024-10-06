'use client';

import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import styles from '../LoginPopup/LoginPopup.module.css';

interface SignupFormProps {
  onSignupSuccess: (email: string) => void;
}

export default function SignupForm({ onSignupSuccess }: SignupFormProps) {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Normal signup handler
  const handleSignup = async () => {
    setError('');
    if (!email || !phone || !password) {
      setError('All fields are required');
      return;
    }

    try {
      const res = await fetch('http://localhost:4000/user/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, phone, password }),
      });

      const data = await res.json();

      if (res.ok) {
        await sendOtp(email); // Send OTP on successful signup
        onSignupSuccess(email); // Pass the email for OTP verification step
      } else {
        setError(data.message || 'Signup failed');
      }
    } catch (error) {
      setError('Error during signup');
    }
  };

  // Handle OTP sending for both normal and Google signup
  const sendOtp = async (email: string) => {
    try {
      const res = await fetch('http://localhost:4000/user/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        throw new Error('Failed to send OTP');
      }
    } catch (error) {
      setError('Error sending OTP');
    }
  };

  // Handle Google signup
  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const res = await fetch('http://localhost:4000/user/google-signup', {
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
        await sendOtp(data.email); // Send OTP after successful Google signup
        onSignupSuccess(data.email); // Pass the email to OTP verification step
      } else {
        setError(data.message || 'Google signup failed');
      }
    } catch (error) {
      setError('Google signup failed');
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
        type="tel"
        placeholder="Phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleSignup}>Sign Up</button>

      <p>or</p>

      <GoogleLogin
        onSuccess={handleGoogleSuccess} // Call the Google success handler
        onError={() => {
          setError('Google Sign In Failed');
        }}
      />
    </div>
  );
}
