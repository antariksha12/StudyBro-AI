import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Spinner } from "./Loader";

export default function ProtectedRoute({ children }) {
  const auth = useAuth();

  // Context not yet mounted or still resolving Firebase auth state
  if (!auth || auth.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base-900">
        <Spinner size={32} />
      </div>
    );
  }

  if (!auth.user) return <Navigate to="/login" replace />;
  return children;
}
