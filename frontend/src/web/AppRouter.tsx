import { Navigate, Route, Routes } from "react-router-dom";
import SignupPage from "../features/auth/pages/SignupPage";


export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/signup" replace />} />
      <Route path="/signup" element={<SignupPage />} />
    </Routes>
  );
}
