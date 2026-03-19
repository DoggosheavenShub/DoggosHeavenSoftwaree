import React from 'react';
import { useLocation, Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ADMIN_ONLY_PATHS = [
  '/staff/inventory',
  '/staff/editinventory',
  '/staff/alertlist',
  '/staff/stockhistory',
];

const CheckAuth = ({ isAuthenticated }) => {
  const location = useLocation().pathname;
  const { user } = useSelector((state) => state.auth);

  if (isAuthenticated) {
    if (location.includes('login')) {
      return <Navigate to="/staff/dashboard" />;
    }

    // Block staff from admin-only paths
    if (user?.role === 'staff') {
      const blocked = ADMIN_ONLY_PATHS.some(
        (p) => location.toLowerCase() === p || location.toLowerCase().startsWith(p + '/')
      );
      if (blocked) {
        return <Navigate to="/staff/inventoryList" />;
      }
    }
  }

  if (!isAuthenticated) {
    if (!location.includes('login')) {
      return <Navigate to="/login" />;
    }
  }

  return <Outlet />;
};

export default CheckAuth;
