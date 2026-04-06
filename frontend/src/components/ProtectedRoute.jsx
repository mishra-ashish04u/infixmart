import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { MyContext } from '../App';

const ProtectedRoute = ({ children }) => {
  const { isLogin, authLoading } = useContext(MyContext);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-[#ff5252] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return isLogin ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
