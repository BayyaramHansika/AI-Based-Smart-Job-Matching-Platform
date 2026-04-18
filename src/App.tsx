/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { JobSearch } from './pages/JobSearch';
import { Profile } from './pages/Profile';
import { Applications } from './pages/Applications';
import { RecruiterDashboard } from './pages/RecruiterDashboard';
import { Login } from './pages/Login';
import { Messages } from './pages/Messages';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
}

function RoleBoundDashboard() {
  const { role } = useAuth();
  return role === 'seeker' ? <Dashboard /> : <RecruiterDashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<RoleBoundDashboard />} />
            <Route path="jobs" element={<JobSearch />} />
            <Route path="applications" element={<Applications />} />
            <Route path="profile" element={<Profile />} />
            <Route path="messages" element={<Messages />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

