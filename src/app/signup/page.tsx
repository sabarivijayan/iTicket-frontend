"use client";
import React from 'react';
import AuthForm from './auth-form';
import { sendUserAuthRequest } from '@/api-helpers/api-helpers';
import { useDispatch } from 'react-redux';
import { userActions } from '@/store';

interface AuthData {
  email: string;
  phone?: string;
  password: string;
  signup: boolean;
}

interface AuthResponse {
  token: string;
  userId: string;
}

const Auth = () => {
  const dispatch = useDispatch();

  const onResponseReceived = (data: AuthResponse | null) => {
    if (data && data.userId && data.token) {
      // Store token and userId in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.userId);

      // Dispatch login action
      dispatch(userActions.login());
    } else {
      console.error("Token or userId not found in response data");
    }
  };

  const getData = (data: AuthData) => {
    sendUserAuthRequest(data, data.signup)
      .then(onResponseReceived)
      .catch((err) => console.log(err));
  };

  return (
    <div>
      <AuthForm onSubmit={getData} isAdmin={false} />
    </div>
  );
};

export default Auth;
