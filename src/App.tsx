/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import MemberList from './components/MemberList';
import MemberForm from './components/MemberForm';
import Subscriptions from './components/Subscriptions';
import Finances from './components/Finances';
import Login from './components/Login';
import { useAuth } from './hooks/useAuth';
import { Toaster } from '@/components/ui/sonner';

import PublicLayout from './components/PublicLayout';
import Home from './components/Home';
import Activities from './components/Activities';
import Donate from './components/Donate';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  return <>{children}</>;
}

export default function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/donate" element={<Donate />} />
        </Route>

        <Route path="/login" element={<Login />} />

        {/* Private Routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/members" element={<MemberList />} />
                  <Route path="/members/add" element={<MemberForm />} />
                  <Route path="/members/edit/:id" element={<MemberForm />} />
                  <Route path="/members/:id" element={<div>Member Profile View (Coming Soon)</div>} />
                  <Route path="/subscriptions" element={<Subscriptions />} />
                  <Route path="/finances" element={<Finances />} />
                  <Route path="/settings" element={<div>Settings (Coming Soon)</div>} />
                  <Route path="*" element={<Navigate to="/admin" />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Fallback for authenticated users who might go to /login or / */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
