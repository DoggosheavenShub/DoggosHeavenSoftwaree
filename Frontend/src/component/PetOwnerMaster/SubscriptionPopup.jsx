import React, { useState, useEffect } from 'react';

const SubscriptionPopup = ({ isOpen, onClose, petId }) => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  useEffect(() => {
    if (isOpen && petId) {
      fetchSubscriptions();
    }
  }, [isOpen, petId]);

  const fetchSubscriptions = async () => {
    setLoading(true);
    setError(null);
    
    try {
        
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/subscription/petssubscription/${petId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${localStorage.getItem('authtoken')}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      console.log(result.data);
      
      if (result.success) {
        setSubscriptions(result.data); 
      } else {
        setError(result.message || 'Failed to fetch subscriptions');
      }
    } catch (err) {
      console.error('Error fetching subscriptions:', err);
      setError('Failed to load subscription details');
    } finally {
      setLoading(false);
    }
  };

  
  const handleClose = () => {
    setSubscriptions([]);
    setError(null);
    setLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#123524]/60 backdrop-blur-sm z-50">
      <div className="bg-white/95 backdrop-blur-lg p-8 rounded-2xl shadow-2xl max-w-lg w-full mx-4 relative border border-[#85A947]/20">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-gradient-to-r from-[#3E7B27] to-[#85A947] rounded-full"></div>
            <h2 className="text-2xl font-bold text-[#123524]">
              Subscription Details
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[#EFE3C2]/50 hover:bg-[#85A947]/20 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-[#85A947]/30"
          >
            <div className="w-4 h-4 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-0.5 bg-[#123524] rotate-45 absolute"></div>
                <div className="w-4 h-0.5 bg-[#123524] -rotate-45 absolute"></div>
              </div>
            </div>
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-[#EFE3C2] rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <div className="w-8 h-8 bg-[#85A947]/60 rounded-full animate-spin">
                <div className="w-2 h-2 bg-white rounded-full ml-6 mt-1"></div>
              </div>
            </div>
            <p className="text-[#3E7B27] font-medium text-lg">
              Loading subscriptions...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-[#EFE3C2] rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 text-red-500 font-bold text-xl">!</div>
            </div>
            <p className="text-red-600 font-medium text-lg mb-2">
              Error Loading Subscriptions
            </p>
            <p className="text-[#123524]/60 text-sm mb-4">
              {error}
            </p>
            <button
              onClick={fetchSubscriptions}
              className="px-4 py-2 bg-[#85A947] text-white rounded-lg hover:bg-[#3E7B27] transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Subscription List */}
       {!loading && !error && (
  <div className="space-y-4 mb-6">
    {subscriptions?.map((subscription, index) => (
      <div
        key={subscription._id || index}
        className="p-4 bg-gradient-to-r from-[#EFE3C2]/30 to-[#85A947]/10 rounded-xl border border-[#85A947]/20 hover:border-[#3E7B27]/40 transition-all duration-200"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-[#3E7B27] rounded-full flex-shrink-0"></div>
            <div>
              <span className="font-bold text-[#123524] text-lg">
                {subscription?.planId?.subscriptionType?.purpose || 'Standard Plan'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
              subscription?.active === true 
                ? 'bg-[#85A947]/20 text-[#3E7B27]'
                : 'bg-red-100 text-red-600'
            }`}>
              {subscription?.active === true ? 'Active' : 'Inactive'}
            </div>
            {subscription?.daysLeft !== null && (
              <div className="px-2 py-1 bg-[#EFE3C2] text-[#123524] text-xs rounded-md font-medium">
                {subscription.daysLeft} days left
              </div>
            )}
          </div>
        </div>

        {/* Subscription Details */}
        <div className="grid grid-cols-2 gap-3 text-sm">
         
          <div>
            <span className="text-[#123524]/60 font-medium">First Payment:</span>
            <p className="text-[#123524] font-semibold">
              {subscription.firstPaymentDate 
                ? new Date(subscription.firstPaymentDate).toLocaleDateString()
                : 'N/A'
              }
            </p>
          </div>
          <div>
            <span className="text-[#123524]/60 font-medium">Price:</span>
            <p className="text-[#3E7B27] font-bold">
              ₹ {(subscription.planId?.price) || '0.00'}
            </p>
          </div>
        
          <div>
            <span className="text-[#123524]/60 font-medium">Last Payment:</span>
            <p className="text-[#123524] font-semibold">
              {subscription.lastPaymentDate 
                ? new Date(subscription.lastPaymentDate).toLocaleDateString()
                : 'N/A'
              }
            </p>
          </div>
           {subscription?.numberOfGroomings && (
          <div className="mt-3">
            <span className="text-[#123524]/60 font-medium text-sm">Left Grooming Sessions:</span>
            <p className="text-[#3E7B27] font-semibold">
              {subscription.planId.numberOfGroomings} Grooming left.
            </p>
          </div>
        )}
        </div>
       
      </div>
    ))}

    {/* No Subscriptions State */}
    {(!subscriptions || subscriptions.length === 0) && (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-[#EFE3C2] rounded-full flex items-center justify-center mx-auto mb-4">
          <div className="w-8 h-8 bg-[#85A947]/60 rounded-full"></div>
        </div>
        <p className="text-[#3E7B27] font-medium text-lg">
          No active subscriptions
        </p>
        <p className="text-[#123524]/60 text-sm mt-1">
          This pet doesn't have any subscription plans yet
        </p>
      </div>
    )}
  </div>
)}

        {/* Close Button */}
        <div className="flex justify-center">
          <button
            className="px-8 py-3 bg-gradient-to-r from-[#123524] to-[#3E7B27] text-white font-bold rounded-xl hover:from-[#3E7B27] hover:to-[#85A947] transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-[#85A947]/30"
            onClick={handleClose}
          >
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              Close Details
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPopup;

