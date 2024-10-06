'use client';

import { useState } from 'react';
import LoginForm from '../Login-component/login-component';
import SignupForm from '../signup-component/signup-component';
import OtpVerification from '../otp-verification/otp-verification';
import styles from '@/styles/AuthModal.module.css';

export default function AuthModal({ onClose }: { onClose: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  // Handles successful signup, sends OTP
  const handleSignupSuccess = (email: string) => {
    setUserEmail(email);
    setShowOtpVerification(true); // Show OTP screen after signup
  };

  return (
    <div className={styles.authModalOverlay}>
      <div className={styles.authModalContainer}>
        <button className={styles.authCloseButton} onClick={onClose}>
          &times;
        </button>

        {!showOtpVerification ? (
          <>
            <h2 className={styles.authModalHeading}>
              {isLogin ? 'Log In' : 'Sign Up'}
            </h2>
            {isLogin ? (
              <LoginForm /> // Handle normal and Google login
            ) : (
              <SignupForm onSignupSuccess={handleSignupSuccess} /> // Handle normal and Google signup
            )}
            <p>
              {isLogin ? (
                <>
                  Don&apos;t have an account?{' '}
                  <span
                    style={{ cursor: 'pointer', color: '#0070f3' }}
                    onClick={() => setIsLogin(false)}
                  >
                    Sign up here
                  </span>
                </>
              ) : (
                <>
                  Already a user?{' '}
                  <span
                    style={{ cursor: 'pointer', color: '#0070f3' }}
                    onClick={() => setIsLogin(true)}
                  >
                    Log in here
                  </span>
                </>
              )}
            </p>
          </>
        ) : (
          <OtpVerification email={userEmail} /> // Display OTP verification screen
        )}
      </div>
    </div>
  );
}
