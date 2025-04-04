import React, { useState, useEffect } from "react";
import { useData } from "@/contexts/DataContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ServiceRequest, EmergencyRequest } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import RequestDetailsCard from "@/components/RequestDetailsCard";
import { MapPin, AlertTriangle, CheckCircle2, X } from "lucide-react";
import axios from "axios";

const ServiceProviderDashboard = () => {
  const { 
    getServiceProviderRequests,
    getServiceProviderEmergencyRequests,
    updateServiceRequestStatus,
    updateEmergencyRequestStatus
  } = useData();
  
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [selectedEmergency, setSelectedEmergency] = useState<EmergencyRequest | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const requests = getServiceProviderRequests();
  const emergencyRequests = getServiceProviderEmergencyRequests();
  
  // Group requests by status
  const acceptedRequests = requests.filter(req => req.status === "accepted");
  const closedRequests = requests.filter(req => req.status === "closed");
  
  const acceptedEmergencyRequests = emergencyRequests.filter(req => req.status === "accepted");
  const closedEmergencyRequests = emergencyRequests.filter(req => req.status === "closed");

  const [pendingRequests, setPendingRequests] = useState<any[]>([]);

  const fetchPendingRequests = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get('http://localhost:8080/request/provider/requests', {
        withCredentials: true
      });
      console.log(response);
      
      if (response.data.success) {
        setPendingRequests(response.data.data.requests);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || 'Failed to fetch pending requests');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabClick = (value: string) => {
    if (value === 'pending') {
      fetchPendingRequests();
    }
  };
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };
  
  const handleCloseRequest = async (id: string, isEmergency: boolean) => {
    try {
      if (isEmergency) {
        await updateEmergencyRequestStatus(id, "closed");
      } else {
        await updateServiceRequestStatus(id, "closed");
      }
    } catch (error) {
      console.error("Error closing request:", error);
    }
  };
  
  return (
    <>
    <div className="space-y-8">
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
                <p className="text-2xl font-bold">{acceptedRequests.length + acceptedEmergencyRequests.length}</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
              <div className="bg-secondary/40 p-3 rounded-lg text-center">
                <p className="text-2xl font-bold">{closedRequests.length + closedEmergencyRequests.length}</p>
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
            {emergencyRequests.filter(req => req.status === "pending").length === 0 ? (
              <div className="text-center text-muted-foreground p-4">
                No emergency alerts at this time
              </div>
            ) : (
              <div className="space-y-3">
                {emergencyRequests
                  .filter(req => req.status === "pending")
                  .map(request => (
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
                        <Badge className="bg-emergency">
                          {new Date(request.created_at).toLocaleTimeString()}
                        </Badge>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="active" className="w-full" onValueChange={handleTabClick}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="pending" className="cursor-pointer">
            {isLoading ? "Loading..." : "Pending Requests"}
            {error && <span className="text-red-500 ml-2">!</span>}
          </TabsTrigger>
          <TabsTrigger value="active">Active Requests</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">Loading pending requests...</p>
              </CardContent>
            </Card>
          ) : error ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-red-500">{error}</p>
              </CardContent>
            </Card>
          ) : pendingRequests.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No pending service requests</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingRequests.map((request) => (
                <Card key={request.id} className="overflow-hidden">
                  <CardHeader className="bg-blue-50 pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{request.title}</CardTitle>
                      <Badge variant="secondary">New</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    {/* Problem Description */}
                    <div>
                      <h4 className="font-medium text-sm mb-1">Problem Description</h4>
                      <p className="text-sm text-muted-foreground">{request.describe_problem}</p>
                    </div>

                    {/* Vehicle Information */}
                    <div>
                      <h4 className="font-medium text-sm mb-1">Vehicle Information</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Type</p>
                          <p>{request.vehical_info.type}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Name</p>
                          <p>{request.vehical_info.name}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Number</p>
                          <p>{request.vehical_info.number}</p>
                        </div>
                      </div>
                    </div>

                    {/* User Information */}
                    <div>
                      <h4 className="font-medium text-sm mb-1">User Information</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Name</p>
                          <p>{request.user.name}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Email</p>
                          <p>{request.user.email}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Mobile</p>
                          <p>{request.user.mobile}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Location</p>
                          <p>{request.user.location.city}, {request.user.location.district}</p>
                        </div>
                      </div>
                    </div>

                    {/* Location Coordinates */}
                    <div>
                      <h4 className="font-medium text-sm mb-1">Location Coordinates</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Latitude</p>
                          <p>{request.latlon.coordinates[1]}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Longitude</p>
                          <p>{request.latlon.coordinates[0]}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-3">
                    <Button 
                      className="w-full"
                      onClick={async () => {
                        try {
                          console.log("Accepting request:", request.id);
                          
                          const response = await axios.post('http://localhost:8080/request/accept-request', {
                            requestId: request.id
                          }, {
                            withCredentials: true
                          });
                          
                          console.log("Response:", response.data);
                          if (response.data.success) {
                            // Refresh the pending requests
                            fetchPendingRequests();
                          } else {
                            console.error('Failed to accept request:', response.data.message);
                          }
                        } catch (error) {
                          console.error('Error accepting request:', error);
                        }
                      }}
                    >
                      Accept Request
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="active" className="space-y-4">
          {acceptedRequests.length === 0 && acceptedEmergencyRequests.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No active requests</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Active emergency requests */}
              {acceptedEmergencyRequests.map(request => (
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
          {closedRequests.length === 0 && closedEmergencyRequests.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No completed requests</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Completed requests */}
              {[...closedRequests, ...closedEmergencyRequests.map(er => ({
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
    </div>
    </>
  );
};

export default ServiceProviderDashboard;
