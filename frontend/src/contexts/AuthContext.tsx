import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, ServiceProvider, Admin, AuthUserType } from '../types';
import { mockUsers, mockServiceProviders } from '../lib/mockData';
import { toast } from "@/lib/toast";
import axios from "axios";

// Define different types for users and service providers
type UserAuthUser = User & {
  role: 'user';
};

type ServiceProviderAuthUser = ServiceProvider & {
  role: 'service_provider';
};

type AdminAuthUser = Admin & {
  role: 'admin';
};

// Combined type
type AuthUser = UserAuthUser | ServiceProviderAuthUser | AdminAuthUser;

interface AuthContextType {
  currentUser: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string, role: AuthUserType) => Promise<void>;
  logout: () => void;
  register: (userData: Partial<User>) => Promise<void>;
  updateUserProfile: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if a user is already logged in (from localStorage)
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Validate that role exists and is valid
        if (!parsedUser.role || !['user', 'service_provider', 'admin'].includes(parsedUser.role)) {
          console.warn('Invalid user data in localStorage, logging out');
          localStorage.removeItem('currentUser');
          setCurrentUser(null);
        } else {
          setCurrentUser(parsedUser);
        }
      } catch (e) {
        console.error('Error parsing user from localStorage', e);
        localStorage.removeItem('currentUser');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, role: AuthUserType): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:3000/auth/login', 
        { email, password },
        { withCredentials: true }
      );
      
      if (response.data.success) {
        const userData = response.data.data.user;
        
        // Make sure role is explicitly set here
        const authUser: AuthUser = {
          ...userData,
          role: role, // Explicitly set role to match the parameter
        } as AuthUser;
        console.log(authUser);
        
        setCurrentUser(authUser);
        localStorage.setItem('currentUser', JSON.stringify(authUser));
        toast.success("Logged in successfully!");
      } else {
        throw new Error(response.data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed: " + (error as Error).message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: Partial<User>): Promise<void> => {
    setIsLoading(true);
    try {
      // The API call is now handled in the Register component
      // But we need to set the user state after successful registration
      setCurrentUser({
        id: userData.id, // This would come from the backend response
        name: userData.name,
        email: userData.email,
        role: 'user',
        location: userData.location || { state: '', district: '', city: '' },
        mobile: userData.mobile || '',
        latlon: userData.latlon || { lat: 0, lon: 0 },
        other_contact: userData.other_contact || []
      } as UserAuthUser);
      toast.success("Registration successful!");
    } catch (error) {
      console.error("Error in register context:", error);
      toast.error("Registration failed: " + (error as Error).message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateUserProfile = async (userData: Partial<User>): Promise<void> => {
    setIsLoading(true);
    try {
      if (!currentUser) {
        throw new Error("No user is logged in");
      }
      
      if (currentUser.role === 'admin') {
        throw new Error("Admin profile updates are not supported");
      }
      
      // Since we've checked that currentUser.userType is 'user',
      // TypeScript knows this is a UserAuthUser type
      const updatedUser: UserAuthUser = {
        ...currentUser,
        ...userData,
        location: {
          ...currentUser.location,
          ...(userData.location || {})
        }
      };
      
      // In a real app, we would make an API call to update the user in the database
      setCurrentUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile: " + (error as Error).message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // try {
    //   await axios.post('http://localhost:8080/auth/logout', {}, { withCredentials: true });
    //   setCurrentUser(null);
    //   toast.success("Logged out successfully!");
    // } catch (error) {
    //   console.error("Logout error:", error);
    //   throw error;
    // }
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    toast.success('Logged out successfully!');
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      isLoading, 
      login, 
      logout, 
      register, 
      updateUserProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
