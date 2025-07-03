import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const CustomerSubscriptions = () => {
  const { user } = useSelector((state) => state.auth);
  const [subscriptions, setSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPet, setSelectedPet] = useState(null);

  const fetchCustomerSubscriptions = async () => {
    try {
      const token = localStorage?.getItem("authtoken") || "";
      const encodedEmail = encodeURIComponent(user.email);
      
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/subscription/customer-subscriptions?email=${encodedEmail}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token,
          }
        }
      );

      const data = await response.json();
      
      if (data.success) {
        setSubscriptions(data.subscriptions || []);
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email) {
      fetchCustomerSubscriptions();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  if (isLoading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  // Group subscriptions by pet
  const subscriptionsByPet = subscriptions.reduce((acc, subscription) => {
    const petId = subscription.petId._id;
    if (!acc[petId]) {
      acc[petId] = {
        pet: subscription.petId,
        subscriptions: []
      };
    }
    acc[petId].subscriptions.push(subscription);
    return acc;
  }, {});

  const pets = Object.values(subscriptionsByPet);

  if (!selectedPet) {
    return (
      <div className="w-full min-h-screen p-6 bg-white">
        <h1 className="text-3xl font-bold mb-8 text-[#123524]">My Pets</h1>
        
        {pets.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[#3E7B27] text-lg">No pets found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {pets.map((petGroup) => (
              <div 
                key={petGroup.pet._id} 
                className="border border-[#85A947] rounded-xl p-8 bg-white shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer hover:bg-gray-50 hover:border-[#3E7B27] transform hover:scale-105"
                onClick={() => setSelectedPet(petGroup)}
              >
                {/* Pet Card */}
                
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-[#85A947] rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-3xl font-bold text-white">
                      {petGroup.pet.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-[#123524] mb-3">
                    {petGroup.pet.name}
                  </h2>
                  
                  <p className="text-[#3E7B27] mb-2 text-lg">{petGroup.pet.breed}</p>
                  <p className="text-sm text-[#85A947] mb-6">{petGroup.pet.email}</p>
                  
                  {/* Subscription Summary */}
                  <div className="bg-gray-50 rounded-lg">
                    <p className="text-sm text-[#3E7B27] font-medium">Subscriptions</p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="font-bold text-[#123524] text-lg">{petGroup.subscriptions.length}</p>
                        <p className="text-[#3E7B27]">Total</p>
                      </div>
                      <div>
                        <p className="font-bold text-[#85A947] text-lg">{petGroup.subscriptions.filter(sub => sub.active).length}</p>
                        <p className="text-[#3E7B27]">Active</p>
                      </div>
                    </div>
                    
                    {petGroup.subscriptions.filter(sub => sub.daysLeft <= 7 && sub.active).length > 0 && (
                      <div className=" bg-red-100 text-red-600 text-xs rounded-lg font-medium">
                        {petGroup.subscriptions.filter(sub => sub.daysLeft <= 7 && sub.active).length} expiring soon
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6 text-sm text-[#3E7B27] font-medium">
                    Click to view subscriptions
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Overall Summary */}
        {/* {pets.length > 0 && (
          <div className="mt-12 bg-gray-50 border border-[#85A947] rounded-xl p-6">
            <h3 className="font-bold text-[#123524] mb-4 text-xl">Overall Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
              <div className="text-center">
                <p className="text-[#3E7B27] mb-1">Total Pets</p>
                <p className="font-bold text-[#123524] text-2xl">{pets.length}</p>
              </div>
              <div className="text-center">
                <p className="text-[#3E7B27] mb-1">Total Subscriptions</p>
                <p className="font-bold text-[#123524] text-2xl">{subscriptions.length}</p>
              </div>
              <div className="text-center">
                <p className="text-[#3E7B27] mb-1">Active Subscriptions</p>
                <p className="font-bold text-[#123524] text-2xl">{subscriptions.filter(sub => sub.active).length}</p>
              </div>
              <div className="text-center">
                <p className="text-[#3E7B27] mb-1">Expiring Soon (≤7 days)</p>
                <p className="font-bold text-red-600 text-2xl">{subscriptions.filter(sub => sub.daysLeft <= 7 && sub.active).length}</p>
              </div>
            </div>
          </div>
        )} */}
      </div>
    );
  }

  // If a pet is selected, show its subscriptions
  return (
    <div className="w-full min-h-screen p-6 bg-white">
      {/* Back Button */}
      <button 
        onClick={() => setSelectedPet(null)}
        className="mb-6 flex items-center text-[#3E7B27] hover:text-[#123524] transition-colors px-4 py-2 rounded-lg bg-gray-50 hover:bg-gray-100"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Pets
      </button>
      
      <div className="border border-[#85A947] rounded-xl p-8 bg-white shadow-lg max-w-full">
        {/* Pet Header */}
        <div className="border-b border-gray-200 pb-6 mb-8">
          <div className="flex items-center">
            <div className="w-20 h-20 bg-[#85A947] rounded-full flex items-center justify-center mr-6 shadow-lg">
              <span className="text-2xl font-bold text-white">
                {selectedPet.pet.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-[#123524] mb-2">
                {selectedPet.pet.name}
              </h2>
              <p className="text-[#3E7B27] text-lg mb-1">{selectedPet.pet.breed}</p>
              <p className="text-sm text-[#85A947]">{selectedPet.pet.email}</p>
            </div>
          </div>
        </div>
        
        {/* Pet's Subscriptions */}
        <div className="space-y-6">
          <h3 className="font-bold text-[#3E7B27] mb-6 text-xl">
            Subscriptions ({selectedPet.subscriptions.length})
          </h3>
          
          {selectedPet.subscriptions.map((subscription) => (
            <div key={subscription._id} className="border border-gray-200 rounded-xl p-6 bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <div>
                  <p className="text-sm text-[#3E7B27] font-medium mb-2">Subscription Type</p>
                  <p className="font-semibold text-[#123524] text-lg">{subscription.planId?.subscriptionType?.purpose || 'N/A'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-[#3E7B27] font-medium mb-2">Days Left</p>
                  <p className={`font-bold text-xl ${subscription.daysLeft <= 7 ? 'text-red-600' : subscription.daysLeft <= 30 ? 'text-yellow-600' : 'text-[#85A947]'}`}>
                    {subscription.daysLeft}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-[#3E7B27] font-medium mb-2">Status</p>
                  <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                    subscription.active ? 'bg-[#85A947] text-white' : 'bg-red-100 text-red-800'
                  }`}>
                    {subscription.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                {subscription.numberOfGroomings && (
                  <div>
                    <p className="text-sm text-[#3E7B27] font-medium mb-2">Grooming Sessions</p>
                    <p className="font-semibold text-[#123524] text-lg">{subscription.numberOfGroomings}</p>
                  </div>
                )}
                
                <div>
                  <p className="text-sm text-[#3E7B27] font-medium mb-2">Duration</p>
                  <p className="font-semibold text-[#123524] text-lg">{subscription.planId?.duration || 'N/A'} days</p>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-300 flex flex-wrap justify-between items-center text-sm text-[#3E7B27] gap-4">
                <span className="bg-white px-3 py-1 rounded-lg">Started: {new Date(subscription.firstPaymentDate).toLocaleDateString()}</span>
                <span className="bg-white px-3 py-1 rounded-lg">Last Payment: {new Date(subscription.lastPaymentDate).toLocaleDateString()}</span>
                {subscription.planId?.price && (
                  <span className="font-bold text-[#85A947] text-lg bg-white px-3 py-1 rounded-lg">${subscription.planId.price}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

};

export default CustomerSubscriptions;