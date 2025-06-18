import React, { useState, useEffect } from 'react';

const PrescriptionPopup = ({ isOpen, onClose, petId }) => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  useEffect(() => {
    if (isOpen && petId) {
      fetchPrescriptions();
    }
  }, [isOpen, petId]);

  const fetchPrescriptions = async () => {
    setLoading(true);
    setError(null);
    
    try {
        
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/prescription/getprescription/${petId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        //   'Authorization': `Bearer ${localStorage.getItem('authtoken')}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      console.log(result.data);
      
      if (result.success) {
        setPrescriptions(result.data); 
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
    setPrescriptions([]);
    setError(null);
    setLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#123524]/60 backdrop-blur-sm z-50">
      <div className="bg-white/95 backdrop-blur-lg max-h-[80%] overflow-scroll p-8 rounded-2xl shadow-2xl max-w-lg w-full mx-4 relative border border-[#85A947]/20">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-gradient-to-r from-[#3E7B27] to-[#85A947] rounded-full"></div>
            <h2 className="text-2xl font-bold text-[#123524]">
              Prescription Details
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
              Loading prescriptions...
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
              Error Loading Prescription
            </p>
            <p className="text-[#123524]/60 text-sm mb-4">
              {error}
            </p>
            <button
              onClick={fetchPrescriptions}
              className="px-4 py-2 bg-[#85A947] text-white rounded-lg hover:bg-[#3E7B27] transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-4 mb-6">
            {prescriptions?.map((prescription, index) => (
              <div
                key={prescription._id || index}
                className="p-4 bg-gradient-to-r from-[#EFE3C2]/30 to-[#85A947]/10 rounded-xl border border-[#85A947]/20 hover:border-[#3E7B27]/40 transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-3">
                  
                  <div className="flex items-center gap-2">
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      prescription.customerType === 'NGO' 
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-[#85A947]/20 text-[#3E7B27]'
                    }`}>
                      {prescription.customerType === 'NGO' ? 'NGO' : 'Pvt Ltd'}
                    </div>
                    <div className="px-2 py-1 bg-[#EFE3C2] text-[#123524] text-xs rounded-md font-medium">
                      ₹{prescription?.price || 0}
                    </div>
                  </div>
                </div>

                {/* Prescription Details */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-[#123524]/60 font-medium">Created Date:</span>
                    <p className="text-[#123524] font-semibold">
                      {prescription.createdAt 
                        ? new Date(prescription.createdAt).toLocaleDateString()
                        : 'N/A'
                      }
                    </p>
                  </div>
                 
                  <div>
                    <span className="text-[#123524]/60 font-medium">Total Items:</span>
                    <p className="text-[#123524] font-semibold">
                      {(prescription.items?.length || 0) + 
                       (prescription.tablets?.length || 0) + 
                       (prescription.mg?.length || 0) + 
                       (prescription.ml?.length || 0)} items
                    </p>
                  </div>
                </div>

                {/* Medication Breakdown */}
                <div className="mt-3 pt-3 border-t border-[#85A947]/20">
                  <span className="text-[#123524]/60 font-medium text-sm">Medication Breakdown:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                   {prescription.items && prescription.items.length > 0 && (
                        prescription?.items.map((itemObj, index) => (
                          
                            <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded mr-2"
                            >
                            {itemObj?.id?.itemName} - {itemObj?.quantity}
                            </span>
                           
                            
                        ))
                     )}

                  {prescription.tablets && prescription.tablets.length > 0 && (
                        prescription.tablets.map((itemObj, index) => (
                            <span
                            key={`tablet-${index}`}
                            className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded mr-2"
                            >
                            {itemObj?.id?.itemName} - {itemObj?.quantity}
                            </span>
                        ))
                        )}

                        {prescription.mg && prescription.mg.length > 0 && (
                        prescription.mg.map((itemObj, index) => (
                            <span
                            key={`mg-${index}`}
                            className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded mr-2"
                            >
                            {itemObj?.id?.itemName} - {itemObj?.quantity}
                            </span>
                        ))
                        )}

                        {prescription.ml && prescription.ml.length > 0 && (
                        prescription.ml.map((itemObj, index) => (
                            <span
                            key={`ml-${index}`}
                            className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded mr-2"
                            >
                            {itemObj?.id?.itemName} - {itemObj?.quantity}
                            </span>
                        ))
                        )}

                  </div>
                </div>

            
                {(prescription.nextFollowUp || prescription.followUpTime || prescription.followUpPurpose) && (
                  <div className="mt-3 pt-3 border-t border-[#85A947]/20">
                    <span className="text-[#123524]/60 font-medium text-sm">Follow-up Details:</span>
                    <div className="mt-1 space-y-1">
                      {prescription.nextFollowUp && (
                        <p className="text-[#3E7B27] text-xs">
                          <span className="font-medium">Next Visit:</span> {new Date(prescription.nextFollowUp).toLocaleDateString()}
                        </p>
                      )}
                      {prescription.followUpTime && (
                        <p className="text-[#3E7B27] text-xs">
                          <span className="font-medium">Time:</span> {prescription.followUpTime}
                        </p>
                      )}
                      {prescription.followUpPurpose && (
                        <p className="text-[#3E7B27] text-xs">
                          <span className="font-medium">Purpose:</span> {prescription.followUpPurpose}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {(!prescriptions || prescriptions.length === 0) && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-[#EFE3C2] rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-8 h-8 bg-[#85A947]/60 rounded-full"></div>
                </div>
                <p className="text-[#3E7B27] font-medium text-lg">
                  No prescriptions found
                </p>
                <p className="text-[#123524]/60 text-sm mt-1">
                  This pet doesn't have any prescriptions yet
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

export default PrescriptionPopup;

// Usage Example:
/*
import React, { useState } from 'react';
import SubscriptionPopup from './SubscriptionPopup';

const ParentComponent = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState(null);

  const handleOpenPopup = (petId) => {
    setSelectedPetId(petId);
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setSelectedPetId(null);
  };

  return (
    <div>
      <button onClick={() => handleOpenPopup('pet123')}>
        View Pet Subscriptions
      </button>
      
      <SubscriptionPopup
        isOpen={isPopupOpen}
        onClose={handleClosePopup}
        petId={selectedPetId}
      />
    </div>
  );
};

export default ParentComponent;
*/