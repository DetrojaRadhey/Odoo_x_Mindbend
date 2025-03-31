
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, ServiceProvider } from '../types';
import { mockUsers, mockServiceProviders } from '../lib/mockData';
import { toast } from "@/lib/toast";

// Define different types for users and service providers
type UserAuthUser = User & {
  userType: 'user';
};

type ServiceProviderAuthUser = ServiceProvider & {
  userType: 'service_provider';
};

// Combined type
type AuthUser = UserAuthUser | ServiceProviderAuthUser;

interface AuthContextType {
  currentUser: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
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
      setCurrentUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      // In a real app, this would be an API call
      // For now, we'll use mock data

      // Check if it's a normal user
      const user = mockUsers.find(u => u.email === email);
      if (user) {
        const authUser: UserAuthUser = {
          ...user,
          userType: 'user'
        };
        setCurrentUser(authUser);
        localStorage.setItem('currentUser', JSON.stringify(authUser));
        toast.success("Logged in successfully!");
        return;
      }

      // Check if it's a service provider
      const provider = mockServiceProviders.find(p => p.email === email);
      if (provider) {
        const authUser: ServiceProviderAuthUser = {
          ...provider,
          userType: 'service_provider'
        };
        setCurrentUser(authUser);
        localStorage.setItem('currentUser', JSON.stringify(authUser));
        toast.success("Logged in successfully!");
        return;
      }

      throw new Error("Invalid email or password");
    } catch (error) {
      toast.error("Login failed: " + (error as Error).message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: Partial<User>): Promise<void> => {
    setIsLoading(true);
    try {
      // In a real app, this would be an API call to create a user
      // For now, we'll just create a mock user and "log them in"
      if (!userData.email || !userData.name || !userData.mobile || !userData.location) {
        throw new Error("Missing required fields");
      }

      const newUser: User = {
        id: Math.random().toString(36).substring(2, 15),
        email: userData.email,
        name: userData.name,
        mobile: userData.mobile,
        location: userData.location,
        latlon: userData.latlon || {
          lat: 0,
          lon: 0
        },
        other_contact: userData.other_contact || []
      };

      const authUser: UserAuthUser = {
        ...newUser,
        userType: 'user'
      };

      // In a real app, we would save the user to the database
      setCurrentUser(authUser);
      localStorage.setItem('currentUser', JSON.stringify(authUser));
      toast.success("Registration successful!");
    } catch (error) {
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
      
      if (currentUser.userType !== 'user') {
        throw new Error("Only regular users can update their profile");
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
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    toast.success("Logged out successfully!");
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
