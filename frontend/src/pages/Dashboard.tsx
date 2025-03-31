
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import UserDashboard from "@/components/UserDashboard";
import ServiceProviderDashboard from "@/components/ServiceProviderDashboard";

const Dashboard = () => {
  const { currentUser } = useAuth();
  
  // Redirect if not logged in
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <div className="min-h-screen bg-background p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {currentUser.name}
            </p>
          </div>
        </div>
        
        {currentUser.userType === 'user' ? (
          <UserDashboard />
        ) : (
          <ServiceProviderDashboard />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
