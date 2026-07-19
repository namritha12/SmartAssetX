import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

// Common Components & Pages
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AssetManagement from './pages/admin/AssetManagement';
import UserManagement from './pages/admin/UserManagement';
import DepartmentManagement from './pages/admin/DepartmentManagement';
import CategoryManagement from './pages/admin/CategoryManagement';
import Reports from './pages/admin/Reports';

// Manager Pages
import ManagerDashboard from './pages/manager/Dashboard';
import Requests from './pages/manager/Requests';
import DepartmentAssets from './pages/manager/DepartmentAssets';

// Employee Pages
import EmployeeDashboard from './pages/employee/Dashboard';
import MyAssets from './pages/employee/MyAssets';
import RequestAsset from './pages/employee/RequestAsset';
import RequestHistory from './pages/employee/RequestHistory';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Profile (Access allowed for any authenticated user) */}
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />

        {/* Admin Routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/assets" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AssetManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/users" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <UserManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/departments" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <DepartmentManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/categories" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <CategoryManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/reports" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <Reports />
            </ProtectedRoute>
          } 
        />

        {/* Manager Routes */}
        <Route 
          path="/manager" 
          element={
            <ProtectedRoute allowedRoles={['MANAGER']}>
              <ManagerDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/manager/requests" 
          element={
            <ProtectedRoute allowedRoles={['MANAGER']}>
              <Requests />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/manager/department-assets" 
          element={
            <ProtectedRoute allowedRoles={['MANAGER']}>
              <DepartmentAssets />
            </ProtectedRoute>
          } 
        />

        {/* Employee Routes */}
        <Route 
          path="/employee" 
          element={
            <ProtectedRoute allowedRoles={['EMPLOYEE']}>
              <EmployeeDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/employee/assets" 
          element={
            <ProtectedRoute allowedRoles={['EMPLOYEE']}>
              <MyAssets />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/employee/request-asset" 
          element={
            <ProtectedRoute allowedRoles={['EMPLOYEE']}>
              <RequestAsset />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/employee/request-history" 
          element={
            <ProtectedRoute allowedRoles={['EMPLOYEE']}>
              <RequestHistory />
            </ProtectedRoute>
          } 
        />

        {/* Fallback Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
