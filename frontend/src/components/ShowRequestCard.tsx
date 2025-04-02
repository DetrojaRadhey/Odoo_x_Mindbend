import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Car, Bike, MapPin, Wrench, Clock, User, Phone, Mail } from "lucide-react";
import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface VehicleInfo {
  type: "bike" | "car";
  number: string;
  name: string;
}

interface ServiceProvider {
  _id: string;
  name: string;
  contact: {
    mobile: string;
    email: string;
  };
}

interface Request {
  _id: string;
  title: string;
  describe_problem: string;
  vehical_info: VehicleInfo;
  status: "pending" | "accepted" | "closed";
  advance: number;
  createdAt: string;
  service_provider: ServiceProvider[];
  user: {
    name: string;
    mobile: string;
    email: string;
  };
}

export default function ShowRequestCard() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await axios.get('http://localhost:8080/request/my-requests', {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json'
            }
          });
        if (response.data.success) {
          setRequests(response.data.data.requests);
        } else {
          setError('Failed to fetch requests');
        }
      } catch (err) {
        setError('Error connecting to the server');
        console.error('Error fetching requests:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

//   const handleCancelRequest = async (requestId: string) => {
//     try {
//       const response = await axios.delete(`http://localhost:5000/api/request/${requestId}`);
//       if (response.data.success) {
//         setRequests(requests.filter(request => request._id !== requestId));
//       }
//     } catch (err) {
//       console.error('Error cancelling request:', err);
//     }
//   };

  const handleCardClick = (request: Request) => {
    console.log(request);
    
    if (request.service_provider && request.service_provider.length > 0) {
      navigate('/service-providers', { 
        state: { 
          providers: request.service_provider,
          requestTitle: request.title
        }
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'accepted':
        return 'bg-green-500';
      case 'closed':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-center">
          <p className="text-xl font-semibold">{error}</p>
          <p className="mt-2">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">My Requests</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {requests.map((request) => (
          <div 
            key={request._id} 
            onClick={() => handleCardClick(request)}
            className="cursor-pointer transition-all duration-200 hover:scale-[1.02]"
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-semibold">{request.title}</CardTitle>
                <Badge className={getStatusColor(request.status)}>
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Vehicle Information */}
                  <div className="flex items-center space-x-2">
                    {request.vehical_info.type === "car" ? (
                      <Car className="h-5 w-5 text-blue-500" />
                    ) : (
                      <Bike className="h-5 w-5 text-orange-500" />
                    )}
                    <span className="text-sm">
                      {request.vehical_info.name} ({request.vehical_info.number})
                    </span>
                  </div>

                  {/* Problem Description */}
                  <div className="flex items-start space-x-2">
                    <Wrench className="h-5 w-5 text-purple-500 mt-0.5" />
                    <span className="text-sm">{request.describe_problem}</span>
                  </div>

                  {/* Service Providers */}
                  {/* {request.service_provider && request.service_provider.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm">Assigned Service Providers:</h3>
                      {request.service_provider.map((provider) => (
                        <div key={provider._id} className="pl-7 space-y-1">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-green-500" />
                            <span className="text-sm">{provider.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-blue-500" />
                            <span className="text-sm">{provider.contact.mobile}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-purple-500" />
                            <span className="text-sm">{provider.contact.email}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )} */}

                  {/* Request Details */}
                  {/* <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-gray-500" />
                    <span className="text-sm">
                      {new Date(request.createdAt).toLocaleString()}
                    </span>
                  </div> */}

                  {/* Advance Amount */}
                  {/* {request.advance > 0 && (
                    <div className="text-sm font-semibold text-green-600">
                      Advance: ₹{request.advance}
                    </div>
                  )} */}

                  {/* Action Buttons */}
                  {request.status === "pending" && (
                    <div className="flex space-x-2 pt-2" onClick={(e) => e.stopPropagation()}>
                      {/* <Button
                        variant="outline"
                        onClick={() => navigate(`/edit-request/${request._id}`)}
                      >
                        Edit
                      </Button> */}
                      {/* <Button
                        variant="destructive"
                        onClick={() => handleCancelRequest(request._id)}
                      >
                        Cancel
                      </Button> */}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
