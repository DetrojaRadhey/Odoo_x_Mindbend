import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Car, Wrench, Truck, Battery, Disc2, Key, Fuel, Camera, MonitorPlay, Sofa, FileCheck } from "lucide-react";

const Index = () => {
  const { currentUser } = useAuth();
  
  const testimonials = [
    { name: "John Doe", comment: "Got my car fixed in no time. Great service!" },
    { name: "Jane Smith", comment: "Their bike repair service is top-notch. Highly recommended!" },
    { name: "Mike Johnson", comment: "Professional team, excellent service, fair pricing." }
  ];
  
  const stats = [
    { count: "3 Million+", label: "Happy Customers" },
    { count: "5000+", label: "Expert Technicians" },
    { count: "40+", label: "Cities" },
    { count: "4.8", label: "Rating" }
  ];
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-yellow-100 text-black">
        <div className="container mx-auto px-6 py-24 md:py-32 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Bike & Car <br />Repair Service
            </h1>
            <p className="text-lg mb-8 max-w-lg">
              Qualified technicians to get your vehicle back on the road. Fast, reliable service at your doorstep.
            </p>
            <div className="flex flex-wrap gap-4">
              {currentUser ? (
                <Link to="/dashboard">
                  <Button className="bg-black text-white hover:bg-gray-800" size="lg">Go to Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link to="/register">
                    <Button className="bg-black text-white hover:bg-gray-800" size="lg">Sign Up Now</Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="outline" className="border-black text-black hover:bg-black/5" size="lg">
                      Login
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="md:w-1/2">
            <img 
              src="/images/home_banner.png" 
              alt="Roadside Assistance" 
              className="w-[300px] max-w-md mx-auto rounded-lg"
            />
          </div>
        </div>
      </section>
      
      {/* Powering Future Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-2">Powering Future</h2>
          <p className="text-lg text-gray-600 mb-8">
            Our comprehensive auto service solutions keep you moving. We service all types of vehicles with trained technicians.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center">
              <img src="https://via.placeholder.com/200x150" alt="Car" className="h-32 object-contain" />
            </div>
            <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center">
              <img src="https://via.placeholder.com/200x150" alt="Bike" className="h-32 object-contain" />
            </div>
            <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center">
              <img src="https://via.placeholder.com/200x150" alt="Van" className="h-32 object-contain" />
            </div>
          </div>
          
          <div className="mt-6">
            <Button className="bg-green-600 hover:bg-green-700 text-white">Learn More</Button>
          </div>
        </div>
      </section>
      
      {/* Business Verticals */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-8 text-center">ReadyAssist Business Verticals</h2>
          
          <div className="flex flex-wrap justify-center gap-8">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-gray-200 mb-2 flex items-center justify-center">
                <Wrench className="w-8 h-8" />
              </div>
              <span className="text-sm">Roadside Assistance</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-gray-200 mb-2 flex items-center justify-center">
                <Car className="w-8 h-8" />
              </div>
              <span className="text-sm">Vehicle Service</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-gray-200 mb-2 flex items-center justify-center">
                <Truck className="w-8 h-8" />
              </div>
              <span className="text-sm">Service Truck</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-gray-200 mb-2 flex items-center justify-center">
                <Battery className="w-8 h-8" />
              </div>
              <span className="text-sm">Battery Service</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-gray-200 mb-2 flex items-center justify-center">
                <Disc2 className="w-8 h-8" />
              </div>
              <span className="text-sm">Tyre Service</span>
            </div>
          </div>
        </div>
      </section>
      
      {/* Car Inspection Card */}
      <section className="py-12 bg-blue-900 text-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center rounded-lg overflow-hidden">
            <div className="md:w-2/3 p-8">
              <h3 className="text-2xl font-bold mb-4">Car Inspection Services</h3>
              <ul className="mb-6 space-y-2">
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Full vehicle inspection
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  150+ check list items
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Fully vetted expert recommendations
                </li>
              </ul>
              <Button className="bg-yellow-500 text-black hover:bg-yellow-400">Book Now</Button>
            </div>
            <div className="md:w-1/3 p-4 flex justify-center">
              <div className="rounded-full bg-blue-800 p-6 relative">
                <img src="https://via.placeholder.com/150" alt="Service Person" className="rounded-full w-32 h-32 object-cover" />
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-white rounded-full flex items-center justify-center">
                  <FileCheck className="w-6 h-6 text-blue-900" />
                </div>
                <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-white rounded-full flex items-center justify-center">
                  <Wrench className="w-6 h-6 text-blue-900" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-8 text-center">Hear From our Clients</h2>
          
          <div className="flex justify-center gap-8 flex-wrap">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="w-full md:w-64 bg-white shadow-md rounded-lg p-6">
                <p className="text-gray-700 mb-4">"{testimonial.comment}"</p>
                <p className="font-medium">{testimonial.name}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-12 flex flex-wrap justify-center">
            <img src="https://via.placeholder.com/120x40" alt="Client Logo" className="h-8 mx-4 my-2" />
            <img src="https://via.placeholder.com/120x40" alt="Client Logo" className="h-8 mx-4 my-2" />
            <img src="https://via.placeholder.com/120x40" alt="Client Logo" className="h-8 mx-4 my-2" />
            <img src="https://via.placeholder.com/120x40" alt="Client Logo" className="h-8 mx-4 my-2" />
            <img src="https://via.placeholder.com/120x40" alt="Client Logo" className="h-8 mx-4 my-2" />
          </div>
        </div>
      </section>
      
      {/* Service at home */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0 md:pr-12">
              <h2 className="text-2xl font-bold mb-4">Get your bike serviced without leaving your home!</h2>
              <p className="text-gray-600 mb-6">
                ReadyAssist is proud to be able to offer the convenience of in-home bike servicing and repairs. 
                Our qualified technicians will come to your location with all the necessary tools and parts.
              </p>
              <Button className="bg-yellow-500 text-black hover:bg-yellow-400">Book Now</Button>
            </div>
            <div className="md:w-1/2">
              <img 
                src="https://via.placeholder.com/600x400" 
                alt="Bike Service" 
                className="rounded-lg shadow-md w-full" 
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Stats Section */}
      <section className="py-8">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <div key={index} className="bg-black text-white p-4 rounded-lg text-center">
                <p className="text-xl md:text-2xl font-bold">{stat.count}</p>
                <p className="text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Join Us Section */}
      <section className="py-16 bg-gradient-to-br from-orange-500 to-red-500 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-orange-400 clip-triangle"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="md:w-2/3">
            <h2 className="text-3xl font-bold mb-4">SERVE WITH US AND EARN MORE</h2>
            <p className="mb-8">
              Join us as a service partner and access a wide customer base. Be part of our network of trusted technicians and grow your business.
            </p>
            <Button className="bg-white text-black hover:bg-gray-100">Know More</Button>
          </div>
        </div>
      </section>
      
      {/* Why Choose Us */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-8">Why People choose Our Services?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="mb-6 text-gray-600">
                Our network of skilled professionals provides reliable and affordable service right at your doorstep. 
                We pride ourselves on prompt responses and quality workmanship that gets you back on the road quickly.
              </p>
              <div className="flex gap-4">
                <Button className="bg-black text-white hover:bg-gray-800">Learn More</Button>
                <Button variant="outline" className="border-black text-black hover:bg-black/5">Contact Us</Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img src="https://via.placeholder.com/300x200" alt="Service" className="rounded-lg shadow-md" />
              <img src="https://via.placeholder.com/300x200" alt="Service" className="rounded-lg shadow-md" />
            </div>
          </div>
        </div>
      </section>
      
      {/* Subscription CTA */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-6">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Get the chance to win a subscription package worth Rs. 1000!</h2>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="md:w-2/3">
                <input 
                  type="email" 
                  placeholder="Your Email" 
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="md:w-1/3">
                <Button className="w-full bg-green-600 hover:bg-green-700">Submit</Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-black text-white py-8">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <p className="text-lg font-bold mb-2">ReadyAssist</p>
            <p className="text-sm opacity-75">© {new Date().getFullYear()} All Rights Reserved</p>
          </div>
        </div>
      </footer>

      <style>{`
        .clip-triangle {
          clip-path: polygon(0 0, 100% 0, 100% 100%);
        }
      `}</style>
    </div>
  );
};

export default Index;
