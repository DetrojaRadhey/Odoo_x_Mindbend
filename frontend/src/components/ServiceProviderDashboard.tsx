import React, { useState, useEffect } from "react";
import axios from "axios";
import { useData } from "@/contexts/DataContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ServiceRequest, EmergencyRequest } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import RequestDetailsCard from "@/components/RequestDetailsCard";
import { MapPin, AlertTriangle, CheckCircle2, X } from "lucide-react";
import { toast } from "react-hot-toast";

// API base URL - should match your backend
const API_URL = "http://localhost:8080";

const ServiceProviderDashboard = () => {
  const { 
    getServiceProviderRequests,
    getServiceProviderEmergencyRequests,
    updateServiceRequestStatus,
    updateEmergencyRequestStatus
  } = useData();
  
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [selectedEmergency, setSelectedEmergency] = useState<EmergencyRequest | null>(null);
  
  const requests = getServiceProviderRequests();
  const emergencyRequests = getServiceProviderEmergencyRequests();
  
  // Group requests by status
  const acceptedRequests = requests.filter(req => req.status === "accepted");
  const closedRequests = requests.filter(req => req.status === "closed");
  
  const acceptedEmergencyRequests = emergencyRequests.filter(req => req.status === "accepted");
  const closedEmergencyRequests = emergencyRequests.filter(req => req.status === "closed");
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };
  
  const [pendingEmergencies, setPendingEmergencies] = useState<EmergencyRequest[]>([]);
  const [acceptedEmergencies, setAcceptedEmergencies] = useState<EmergencyRequest[]>([]);
  const [closedEmergencies, setClosedEmergencies] = useState<EmergencyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch pending emergency requests
  const fetchPendingEmergencies = async () => {
    try {
      const response = await axios.get(`${API_URL}/emergency/show-emergency`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        // Convert the backend data format to match your frontend type
        const formattedData = response.data.data.map((item: any) => ({
          id: item._id,
          user: {
            id: item.user._id,
            name: item.user.name,
            mobile: item.user.mobile,
            location: {
              city: "Near you", // Location details might need adjustment
              coordinates: item.latlon.coordinates
            }
          },
          status: item.status,
          created_at: new Date(item.createdAt || Date.now()).toISOString()
        }));
        
        setPendingEmergencies(formattedData);
      }
    } catch (error) {
      console.error("Error fetching emergency requests:", error);
      toast.error("Failed to load emergency requests");
    }
  };

  // Fetch accepted emergency requests
  const fetchAcceptedEmergencies = async () => {
    try {
      const response = await axios.get(`${API_URL}/emergency/get-accepted-emergency`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        // Convert the backend data format to match your frontend type
        const formattedData = response.data.data.map((item: any) => ({
          id: item._id,
          user: {
            id: item.user._id,
            name: item.user.name,
            mobile: item.user.mobile,
            location: {
              city: item.user.address || "Unknown location",
              coordinates: item.latlon.coordinates
            }
          },
          status: item.status,
          created_at: new Date(item.createdAt || Date.now()).toISOString()
        }));
        
        setAcceptedEmergencies(formattedData);
      }
    } catch (error) {
      console.error("Error fetching accepted emergencies:", error);
      toast.error("Failed to load accepted emergencies");
    }
  };

  // Fetch closed emergency requests
  const fetchClosedEmergencies = async () => {
    try {
      const response = await axios.get(`${API_URL}/emergency/done-emergencies`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        // Convert the backend data format to match your frontend type
        const formattedData = response.data.data.map((item: any) => ({
          id: item._id,
          user: {
            id: item.user._id,
            name: item.user.name,
            mobile: item.user.mobile,
            location: {
              city: item.user.address || "Unknown location",
              coordinates: item.latlon.coordinates
            }
          },
          status: item.status,
          created_at: new Date(item.createdAt || Date.now()).toISOString()
        }));
        
        setClosedEmergencies(formattedData);
      }
    } catch (error) {
      console.error("Error fetching closed emergencies:", error);
      toast.error("Failed to load completed emergencies");
    }
  };

  // Accept emergency request
  const acceptEmergencyRequest = async (requestId: string) => {
    try {
      const response = await axios.get(`${API_URL}/emergency/accept-emergency`, {
        data: { requestId },
        withCredentials: true
      });
      
      if (response.data.success) {
        toast.success("Emergency request accepted successfully");
        // Refresh the lists after acceptance
        fetchPendingEmergencies();
        fetchAcceptedEmergencies();
      }
    } catch (error) {
      console.error("Error accepting emergency request:", error);
      toast.error("Failed to accept emergency request");
    }
  };

  // Mark emergency as done
  const handleCloseRequest = async (id: string, isEmergency: boolean) => {
    try {
      if (isEmergency) {
        const response = await axios.post(`${API_URL}/emergency/mark-as-done`, {
          requestId: id
        }, {
          withCredentials: true
        });
        
        if (response.data.success) {
          toast.success("Emergency request marked as complete");
          // Refresh lists
          fetchAcceptedEmergencies();
          fetchClosedEmergencies();
        }
      } else {
        // Handle service request completion with existing function
        await updateServiceRequestStatus(id, "closed");
      }
    } catch (error) {
      console.error("Error closing request:", error);
      toast.error("Failed to mark request as complete");
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchPendingEmergencies(),
          fetchAcceptedEmergencies(),
          fetchClosedEmergencies()
        ]);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
    
    // Set up polling to refresh data every 30 seconds
    const intervalId = setInterval(() => {
      loadData();
    }, 30000);
    
    // Clear interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="space-y-8">
      {loading ? (
        <div className="text-center py-10">
          <p>Loading dashboard data...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="md:col-span-1">
              <CardHeader className="bg-blue-50 pb-2">
                <CardTitle className="text-lg flex items-center">
                  <CheckCircle2 className="w-5 h-5 mr-2 text-blue-500" />
                  Service Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-secondary/40 p-3 rounded-lg text-center">
                    <p className="text-2xl font-bold">{acceptedRequests.length + acceptedEmergencies.length}</p>
                    <p className="text-sm text-muted-foreground">Active</p>
                  </div>
                  <div className="bg-secondary/40 p-3 rounded-lg text-center">
                    <p className="text-2xl font-bold">{closedRequests.length + closedEmergencies.length}</p>
                    <p className="text-sm text-muted-foreground">Completed</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  View Map
                </Button>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader className="bg-red-50 pb-2">
                <CardTitle className="text-lg flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-emergency" />
                  Emergency Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 h-[180px] overflow-auto">
                {pendingEmergencies.length === 0 ? (
                  <div className="text-center text-muted-foreground p-4">
                    No emergency alerts at this time
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingEmergencies.map(request => (
                      <div 
                        key={request.id} 
                        className="border border-emergency rounded-md p-3 cursor-pointer hover:bg-red-50"
                        onClick={() => {
                          setSelectedEmergency(request);
                          setSelectedRequest(null);
                        }}
                      >
                        <div className="flex justify-between">
                          <div>
                            <p className="font-medium text-emergency flex items-center">
                              <AlertTriangle className="h-4 w-4 mr-1" /> 
                              Emergency Alert
                            </p>
                            <p className="text-sm">{request.user.name}</p>
                            <p className="text-xs flex items-center">
                              <MapPin className="h-3 w-3 mr-1" /> 
                              {request.user.location.city}
                            </p>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Badge className="bg-emergency">
                              {new Date(request.created_at).toLocaleTimeString()}
                            </Badge>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                acceptEmergencyRequest(request.id);
                              }}
                            >
                              Accept
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="pending">Pending Requests</TabsTrigger>
              <TabsTrigger value="active">Active Requests</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            
            <TabsContent value="pending" className="space-y-4">
              {requests.filter(req => req.status === "pending").length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">No pending service requests</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {requests
                    .filter(req => req.status === "pending")
                    .map(request => (
                      <Card key={request.id} className="overflow-hidden">
                        <CardHeader className="bg-blue-50 pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">{request.title}</CardTitle>
                            <Badge variant="secondary">
                              New
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <p className="line-clamp-2 text-sm mb-2">{request.describe_problem}</p>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <p className="font-medium text-xs text-muted-foreground">Vehicle</p>
                              <p>{request.vehical_info.type} - {request.vehical_info.name}</p>
                            </div>
                            <div>
                              <p className="font-medium text-xs text-muted-foreground">Location</p>
                              <p>{request.user.location.city}</p>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="border-t pt-3">
                          <Button 
                            className="w-full"
                            variant="outline"
                            onClick={() => {
                              setSelectedRequest(request);
                              setSelectedEmergency(null);
                            }}
                          >
                            View Details
                          </Button>
                        </CardFooter>
                      </Card>
                    ))
                  }
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="active" className="space-y-4">
              {acceptedRequests.length === 0 && acceptedEmergencies.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">No active requests</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Active emergency requests */}
                  {acceptedEmergencies.map(request => (
                    <Card key={request.id} className="overflow-hidden border-emergency">
                      <CardHeader className="bg-red-50 pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg text-emergency flex items-center">
                            <AlertTriangle className="w-4 h-4 mr-1" />
                            Emergency
                          </CardTitle>
                          <Badge className="bg-green-500">
                            Active
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                          <div>
                            <p className="font-medium text-xs text-muted-foreground">User</p>
                            <p>{request.user.name}</p>
                          </div>
                          <div>
                            <p className="font-medium text-xs text-muted-foreground">Contact</p>
                            <p>{request.user.mobile}</p>
                          </div>
                          <div>
                            <p className="font-medium text-xs text-muted-foreground">Location</p>
                            <p>{request.user.location.city}</p>
                          </div>
                          <div>
                            <p className="font-medium text-xs text-muted-foreground">Accepted</p>
                            <p>{new Date(request.created_at).toLocaleTimeString()}</p>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="border-t pt-3 flex gap-2">
                        <Button 
                          className="flex-1"
                          variant="outline"
                          onClick={() => {
                            setSelectedEmergency(request);
                            setSelectedRequest(null);
                          }}
                        >
                          Details
                        </Button>
                        <Button 
                          className="flex-1"
                          variant="destructive"
                          onClick={() => handleCloseRequest(request.id, true)}
                        >
                          Complete
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                  
                  {/* Active service requests */}
                  {acceptedRequests.map(request => (
                    <Card key={request.id} className="overflow-hidden">
                      <CardHeader className="bg-blue-50 pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{request.title}</CardTitle>
                          <Badge className="bg-green-500">
                            Active
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <p className="line-clamp-2 text-sm mb-2">{request.describe_problem}</p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="font-medium text-xs text-muted-foreground">Vehicle</p>
                            <p>{request.vehical_info.type} - {request.vehical_info.name}</p>
                          </div>
                          <div>
                            <p className="font-medium text-xs text-muted-foreground">Number</p>
                            <p>{request.vehical_info.number}</p>
                          </div>
                          <div>
                            <p className="font-medium text-xs text-muted-foreground">User</p>
                            <p>{request.user.name}</p>
                          </div>
                          <div>
                            <p className="font-medium text-xs text-muted-foreground">Contact</p>
                            <p>{request.user.mobile}</p>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="border-t pt-3 flex gap-2">
                        <Button 
                          className="flex-1"
                          variant="outline"
                          onClick={() => {
                            setSelectedRequest(request);
                            setSelectedEmergency(null);
                          }}
                        >
                          Details
                        </Button>
                        <Button 
                          className="flex-1"
                          variant="default"
                          onClick={() => handleCloseRequest(request.id, false)}
                        >
                          Complete
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="completed" className="space-y-4">
              {closedRequests.length === 0 && closedEmergencies.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">No completed requests</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Completed requests */}
                  {[...closedRequests, ...closedEmergencies.map(er => ({
                    ...er,
                    title: "Emergency Request",
                    describe_problem: "Emergency assistance",
                    vehical_info: { type: "car", name: "N/A", number: "N/A" },
                    isEmergency: true
                  } as any))].map((request, index) => (
                    <Card key={index} className="overflow-hidden opacity-80">
                      <CardHeader className={`pb-2 ${request.isEmergency ? 'bg-red-50' : 'bg-gray-50'}`}>
                        <div className="flex justify-between items-start">
                          <CardTitle className={`text-lg ${request.isEmergency ? 'text-emergency' : ''}`}>
                            {request.title}
                          </CardTitle>
                          <Badge variant="outline">
                            Completed
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <p className="line-clamp-2 text-sm mb-2">{request.describe_problem}</p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="font-medium text-xs text-muted-foreground">User</p>
                            <p>{request.user.name}</p>
                          </div>
                          <div>
                            <p className="font-medium text-xs text-muted-foreground">Location</p>
                            <p>{request.user.location.city}</p>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="border-t pt-3">
                        <Button 
                          className="w-full"
                          variant="outline"
                          onClick={() => {
                            if (request.isEmergency) {
                              setSelectedEmergency(request as EmergencyRequest);
                              setSelectedRequest(null);
                            } else {
                              setSelectedRequest(request as ServiceRequest);
                              setSelectedEmergency(null);
                            }
                          }}
                        >
                          View Details
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          {/* Request Detail Dialog */}
          {selectedRequest && (
            <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Request Details</DialogTitle>
                </DialogHeader>
                <RequestDetailsCard 
                  request={selectedRequest} 
                  isEmergency={false}
                  onClose={() => handleCloseRequest(selectedRequest.id, false)}
                />
              </DialogContent>
            </Dialog>
          )}
          
          {/* Emergency Detail Dialog */}
          {selectedEmergency && (
            <Dialog open={!!selectedEmergency} onOpenChange={() => setSelectedEmergency(null)}>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle className="text-emergency">Emergency Request Details</DialogTitle>
                </DialogHeader>
                <RequestDetailsCard 
                  request={selectedEmergency} 
                  isEmergency={true}
                  onClose={() => handleCloseRequest(selectedEmergency.id, true)}
                />
              </DialogContent>
            </Dialog>
          )}
        </>
      )}
    </div>
  );
};

export default ServiceProviderDashboard;
