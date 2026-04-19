'use client';

import axios, { endpoints } from 'src/lib/axios';

import { setSession } from './utils';
import { JWT_STORAGE_KEY } from './constant';

// ----------------------------------------------------------------------

/** **************************************
 * Sign in
 *************************************** */
export const signInWithPassword = async ({ username, password }) => {
  try {
    const params = { username, password };

    const res = await axios.post(endpoints.auth.signIn, params);

    // Response is wrapped: { meta: {...}, data: { token, user } }
    const { token, user } = res.data?.data || res.data;

    if (!token) {
      throw new Error('Access token not found in response');
    }

    // Store user info in session
    sessionStorage.setItem('user', JSON.stringify(user));
    setSession(token);
  } catch (error) {
    console.error('Error during sign in:', error);
    throw error;
  }
};

/** **************************************
 * Sign up
 *************************************** */
export const signUp = async ({ email, password, firstName, lastName }) => {
  const params = {
    email,
    password,
    firstName,
    lastName,
  };

  try {
    const res = await axios.post(endpoints.auth.signUp, params);

    const { accessToken } = res.data;

    if (!accessToken) {
      throw new Error('Access token not found in response');
    }

    sessionStorage.setItem(JWT_STORAGE_KEY, accessToken);
  } catch (error) {
    console.error('Error during sign up:', error);
    throw error;
  }
};

/** **************************************
 * Sign out
 *************************************** */
export const signOut = async () => {
  try {
    await setSession(null);
    sessionStorage.removeItem('user');
  } catch (error) {
    console.error('Error during sign out:', error);
    throw error;
  }
};
