import { Routes, Route, Navigate } from "react-router-dom";
import { LoginPage, PrivateRoute } from "@/features/auth";
import { CompareDatabasePage } from "@/features/compare-database";
import { CopyProjectPage } from "@/features/copy-project";
import { GenerateClassPage } from "@/features/generate-class";
import { UsersPage } from "@/features/users";
import { JsonToolsPage } from "@/features/json-tools";
import { Base64ToolsPage } from "@/features/base64-tools";
import { CryptographyPage } from "@/features/cryptography";
import { ProfilePage } from "@/features/profile";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route path="/" element={<Navigate to="/compare-database" replace />} />
      <Route
        path="/compare-database"
        element={
          <PrivateRoute>
            <CompareDatabasePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/copy-project"
        element={
          <PrivateRoute>
            <CopyProjectPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/generate-class"
        element={
          <PrivateRoute>
            <GenerateClassPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/users"
        element={
          <PrivateRoute>
            <UsersPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/json-tools"
        element={
          <PrivateRoute>
            <JsonToolsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/base64-tools"
        element={
          <PrivateRoute>
            <Base64ToolsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/cryptography-tools"
        element={
          <PrivateRoute>
            <CryptographyPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <ProfilePage />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}
