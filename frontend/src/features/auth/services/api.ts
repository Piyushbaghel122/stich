import axios from "axios";

interface AuthPayload {
  email: string;
  password: string;
}

interface RegisterPayload extends AuthPayload {
  username: string;
  phone: string;
  country: string;
}

interface AuthResponse {
  message: string;
  token?: string;
  user?: unknown;
}

const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
});

export async function register(payload: RegisterPayload) {
  const response = await api.post<AuthResponse>("/auth/register", payload);
  return response.data;
}

export async function login(payload: AuthPayload) {
  const response = await api.post<AuthResponse>("/auth/login", payload);
  return response.data;
}

export async function logout() {
  const response = await api.post<AuthResponse>("/auth/logout");
  return response.data;
}

export async function getMe() {
  const response = await api.get<AuthResponse>("/auth/getMe");
  return response.data;
}

export async function forgotPassword(payload: { email: string }) {
  const response = await api.post<AuthResponse>("/auth/forgot-password", payload);
  return response.data;
}

export async function resetPassword(
  token: string,
  payload: { password: string },
) {
  const response = await api.post<AuthResponse>(
    `/auth/reset-password/${token}`,
    payload,
  );
  return response.data;
}

export async function sendOtp(payload: { phone: string }) {
  const response = await api.post<AuthResponse>("/auth/phone", payload);
  return response.data;
}

export async function verifyOtp(payload: { otp: string; phone: string }) {
  const response = await api.post<AuthResponse>("/auth/verify-otp", payload);
  return response.data;
}

export default api;
