
export interface ServiceProvider {
  id: string;
  type: "Private hospital" | "Mechanical";
  name: string;
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
  | "Roadside Assistance Towing" 
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
