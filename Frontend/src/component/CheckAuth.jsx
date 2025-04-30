import React from 'react'
import { useLocation,Navigate,Outlet} from 'react-router-dom';

const CheckAuth = ({isAuthenticated}) => {
  
  const location=useLocation().pathname;

  if(isAuthenticated){
     if(location.includes("login"))
     return <Navigate to="/dashboard"/>
  }
  
  if(!isAuthenticated){
     if(!(location.includes("login")))
     return <Navigate to ="/login"/>
  }

  return <Outlet/>
}

export default CheckAuth
