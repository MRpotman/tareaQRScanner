// src/routes/PrivateRoute.tsx
import React from "react";
import { Route, Redirect, RouteProps } from "react-router-dom";
import { useAuth } from "../contexts/authContext";

interface PrivateRouteProps extends RouteProps {
  allowedRoles?: Array<"admin" | "user">;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ allowedRoles, ...rest }) => {
  const { user } = useAuth();

  if (!user) {
    return <Redirect to='/login' />;
  }

  if (allowedRoles && !allowedRoles.includes(user.rol as "admin" | "user")) {
    return <Redirect to='/unauthorized' />;
  }

  return <Route {...rest} />;
};

export default PrivateRoute;
