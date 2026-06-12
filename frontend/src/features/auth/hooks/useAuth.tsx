import { useState } from "react";
import {
  forgotPassword,
  getMe,
  login,
  logout,
  register,
  resetPassword,
  sendOtp,
  verifyOtp,
} from "../services/api";
import { setLoading ,setError , setUser } from "../state/authScile"
`
export default function useAuth() {

  async function run<T>(request: () => Promise<T>) {
    setLoading(true);
    setError(null);

    try {
      return await request();
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Request failed",
      );
      throw requestError;
    } finally {
      setLoading(false);
    }
  }

  return {
    user,
    loading,
    error,
    signup: (payload: Parameters<typeof register>[0]) =>
      run(async () => {
        const data = await register(payload);
        setUser(data.user);
        return data;
      }),
    login: (payload: Parameters<typeof login>[0]) =>
      run(async () => {
        const data = await login(payload);
        setUser(data.user);
        return data;
      }),
    logout: () =>
      run(async () => {
        const data = await logout();
        setUser(null);
        return data;
      }),
    getMe: () =>
      run(async () => {
        const data = await getMe();
        setUser(data.user);
        return data;
      }),
    forgotPassword: (payload: Parameters<typeof forgotPassword>[0]) =>
      run(() => forgotPassword(payload)),
    resetPassword: (
      token: string,
      payload: Parameters<typeof resetPassword>[1],
    ) => run(() => resetPassword(token, payload)),
    sendOtp: (payload: Parameters<typeof sendOtp>[0]) =>
      run(() => sendOtp(payload)),
    verifyOtp: (payload: Parameters<typeof verifyOtp>[0]) =>
      run(() => verifyOtp(payload)),
  };
}
