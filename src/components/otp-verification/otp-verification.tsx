// components/auth/OtpVerification.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/styles/LoginPopup.module.css';

export default function OtpVerification({ email }: { email: string }) {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleOtpVerification = async () => {
    setError('');
    if (!otp) {
      setError('OTP is required');
      return;
    }

    try {
      const res = await fetch('http://localhost:4000/user/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/login'); // Redirect to login after successful OTP verification
      } else {
        setError(data.message || 'OTP verification failed');
      }
    } catch (error) {
      setError('Error verifying OTP');
    }
  };

  return (
    <div>
      <h2 className={styles.loginPopupHeading}>OTP Verification</h2>
      {error && <p className={styles.loginErrorMessage}>{error}</p>}
      <input
        type="text"
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
      />
      <button onClick={handleOtpVerification}>Verify OTP</button>
    </div>
  );
}
