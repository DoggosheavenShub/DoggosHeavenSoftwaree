import React from 'react';
import { useLocation, Navigate, Outlet } from 'react-router-dom';

  import { useSelector } from 'react-redux';

const CheckAuth = ({ isAuthenticated }) => {
  const location = useLocation().pathname;
  // const userRole = localStorage.getItem("userRole");
const {user}=useSelector((state)=>state.auth);

  // If user is authenticated
  if (isAuthenticated) {
   
    if (location.includes("login")) {
      if (user.role === 'staff') {
        return <Navigate to="/staff/dashboard" />;
      } else if (user.role === 'customer') {
        return <Navigate to="/customer/dashboard" />;
      } 
    }

  }

  if(location.includes("customer")){
    if(user.role==="staff"){
      return <Navigate to="/login"/>
    }
  }

   if(location.includes("staff")){
    if(user.role==="customer"){
      return <Navigate to="/login"/>
    }
  }

  
  if (!isAuthenticated) {
    if (!location.includes("login")) {
      return <Navigate to="/login" />;
    }
  }

  return <Outlet />;
};

export default CheckAuth;