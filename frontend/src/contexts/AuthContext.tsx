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
        
        let authUser: AuthUser;
        
        // Create the appropriate user type based on the role
        if (userData.role === 'user') {
          authUser = {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            role: 'user',
            mobile: userData.mobile || '',
            location: userData.location || { state: '', district: '', city: '', address: '' },
            other_contact: userData.other_contact || [],
            latlon: userData.latlon || { lat: 0, lon: 0 }
          } as UserAuthUser;
        } else if (userData.role === 'service_provider') {
          authUser = {
            _id: userData.id,
            name: userData.name,
            email: userData.email,
            role: 'service_provider',
            contact: userData.contact,
            location: userData.location,
            type: userData.type,
            rating: userData.rating,
            service_count: userData.service_count,
            latlon: userData.latlon
          } as ServiceProviderAuthUser;
        } else {
          authUser = {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            role: 'admin'
          } as AdminAuthUser;
        }
        
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
      
      if (currentUser.role !== 'user') {
        throw new Error("Only users can update their profile");
      }
      
      // Create updated user object with all required fields
      const updatedUser: UserAuthUser = {
        ...currentUser as UserAuthUser,
        name: userData.name || currentUser.name,
        email: currentUser.email, // Keep the original email
        mobile: userData.mobile || currentUser.mobile,
        role: 'user',
        location: {
          state: userData.location?.state || currentUser.location?.state || '',
          district: userData.location?.district || currentUser.location?.district || '',
          city: userData.location?.city || currentUser.location?.city || '',
          address: userData.location?.address || currentUser.location?.address || ''
        },
        other_contact: userData.other_contact || currentUser.other_contact || [],
        latlon: currentUser.latlon // Keep the original latlon
      };
      
      // Update the current user state
      setCurrentUser(updatedUser);
      
      // Update localStorage with the new user data
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
    } catch (error) {
      console.error("Update profile error:", error);
      toast.error("Failed to update profile: " + (error as Error).message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // try {
    //   await axios.post('http://localhost:3000/auth/logout', {}, { withCredentials: true });
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
