export interface ServiceProvider {
  id: string;
  type: "Private hospital" | "Mechanical";
  name: string;
  role: "service_provider";
  contact: {
    mobile: string[];
    email: string;
  };
  location: {
    state: string;
    district: string;
    city: string;
    address: string;
  };
  latlon: {
    latitude: number;
    longitude: number;
  };
  rating: number;
  service_count: number;
  password?: string; // For authentication
  email: string; // For authentication
}

export interface User {
  id: string;
  email: string;
  name: string;
  mobile: string;
  role: "user";
  location: {
    state: string;
    district: string;
    city: string;
    address?: string;  // Added address field
  };
  latlon: {
    latitude: number;
    longitude: number;
  };
  other_contact: string[];
  password?: string; // For authentication
}

export type RequestStatus = "pending" | "accepted" | "closed";

export type RequestTitle = 
  | "Towing" 
  | "Flat-Tyre" 
  | "Battery-Jumpstart" 
  | "Starting Problem" 
  | "Key-Unlock-Assistance" 
  | "Fuel-Delivery" 
  | "Other";

export interface ServiceRequest {
  id: string;
  latlon: {
    lat: number;
    lon: number;
  };
  title: RequestTitle;
  describe_problem: string;
  vehical_info: {
    type: "bike" | "car";
    number: string;
    name: string;
  };
  status: RequestStatus;
  user: User;
  service_provider: ServiceProvider | null;
  created_at: Date;
}

export interface EmergencyRequest {
  id: string;
  latlon: {
    lat: number;
    lon: number;
  };
  status: RequestStatus;
  user: User;
  service_provider: ServiceProvider | null;
  created_at: Date;
}

export interface Payment {
  id: string;
  userId: string;
  serviceProviderId: string;
  advance: number;
  requestId: string;
  created_at: Date;
  status: "pending" | "paid" | "failed";
}

export interface Review {
  id: string;
  userId: string;
  serviceProviderId: string;
  requestId: string;
  rating: number;
  comment: string;
  created_at: Date;
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: "admin";
  password?: string; // Optional since we don't want to expose it in frontend
}

// Update the existing types to include admin
type AdminAuthUser = Admin & {
  role: 'admin';
};

// Add this to your existing types
export type AuthUserType = 'user' | 'service_provider' | 'admin';
