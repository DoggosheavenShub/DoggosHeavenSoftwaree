import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { useSelector } from 'react-redux';

const VisitHistoryDetails = ({ visitdetails, onClose }) => {
  const [visitDetail, setVisitDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVisitDetail = async () => {
      if (!visitdetails || !visitdetails._id) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:5000/api/v1/visit/getvisitdetails/${visitdetails._id}`,
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch visit details');
        }
        
        const data = await response.json();
        console.log("Visit detail:", data);
        setVisitDetail(data.data || data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching visit details:", error);
        setVisitDetail(visitdetails);
        setLoading(false);
      }
    };
    
    fetchVisitDetail();
  }, [visitdetails]);

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "d MMM yyyy");
    } catch (error) {
      return "Unknown Date";
    }
  };

  const details = visitDetail || visitdetails;
  const visitDate = details?.createdAt ? formatDate(details.createdAt) : "Unknown Date";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 overflow-y-scroll max-w-2xl w-full max-h-[90vh]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{visitDate}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-pulse text-gray-600">Loading details...</div>
          </div>
        ) : (details?.visitType?.purpose === "Veterinary" || details?.visitType?.purpose === "veterinary") ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-gray-700 text-sm">
              <div><span className="font-semibold">Name:</span> {details?.pet?.name || ""}</div>
              <div><span className="font-semibold">Species:</span> {details?.pet?.species || ""}</div>
              <div><span className="font-semibold">Breed:</span> {details?.pet?.breed || ""}</div>
              <div><span className="font-semibold">Color:</span> {details?.pet?.color || ""}</div>
              <div><span className="font-semibold">Age:</span> {
                details?.pet?.dob ? 
                `${Math.floor((new Date() - new Date(details.pet.dob)) / (365.25 * 24 * 60 * 60 * 1000))} years` : 
                "Unknown"
              }</div>
              <div><span className="font-semibold">Owner:</span> {details?.pet?.owner?.name || ""}</div>
              <div><span className="font-semibold">Phone:</span> {details?.pet?.owner?.phone || ""}</div>
              <div><span className="font-semibold">Price:</span> ₹{details?.details?.price || "0"}</div>
              {details?.details?.customerType && (
                <div><span className="font-semibold">Customer Type:</span> {details.details.customerType}</div>
              )}
            </div>

            {details?.details?.vaccines && details.details.vaccines.length > 0 && (
              <div className="mt-4">
                <h3 className="text-base font-bold text-gray-800 mb-2">🧬 Vaccines</h3>
                <div className="space-y-2">
                  {details.details.vaccines.map((vaccine, index) => {
                    const vaccineId = vaccine.id || vaccine.vaccineId;
                    return (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg px-4 py-2 text-sm bg-gray-50"
                      >
                        <div><span className="font-medium">Vaccine Name:</span> {vaccine.name || "Unknown Vaccine"}</div>
                        <div><span className="font-medium">Dose Number:</span> {vaccine.doseNumber}</div>
                        <div><span className="font-medium">Volume Used:</span> {vaccine.volume || "0"} ml</div>
                     
                        {vaccine.type && (
                          <div><span className="font-medium">Type:</span> {vaccine.type}</div>
                        )}
                      
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {details?.details?.medicines && details.details.medicines.length > 0 && (
              <div className="mt-4">
                <h3 className="text-base font-bold text-gray-800 mb-2">💊 Medicines</h3>
                <div className="space-y-2">
                  {details.details.medicines.map((med, index) => {
                    const medicineId = med.id || med.medicineId;
                    return (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg px-4 py-2 text-sm bg-gray-50"
                      >
                        <div><span className="font-medium">Medicine Name:</span> {med.name || "Unknown Medicine"}</div>
                        <div><span className="font-medium">Quantity:</span> {med.quantity || "0"} {med.unit || 'units'}</div>
                        {med.category && (
                          <div><span className="font-medium">Category:</span> {med.category}</div>
                        )}
                     
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {details?.details?.nextFollowUp && (
              <div className="mt-4">
                <h3 className="text-base font-bold text-gray-800 mb-2">📅 Follow-up</h3>
                <div className="border border-gray-200 rounded-lg px-4 py-2 text-sm bg-gray-50">
                  <div><span className="font-medium">Next Follow-up Date:</span> {formatDate(details.details.nextFollowUp)}</div>
                  {details?.details?.followUpPurpose && (
                    <div><span className="font-medium">Purpose:</span> {details.details.followUpPurpose}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2 text-gray-700">
              <p><span className="font-semibold">Name:</span> {details?.pet?.name || ""}</p>
              <p><span className="font-semibold">Species:</span> {details?.pet?.species || ""}</p>
              <p><span className="font-semibold">Breed:</span> {details?.pet?.breed || ""}</p>
              <p><span className="font-semibold">Owner:</span> {details?.pet?.owner?.name || ""}</p>
              <p><span className="font-semibold">Phone:</span> {details?.pet?.owner?.phone || ""}</p>
              <p><span className="font-semibold">Purpose:</span> {details?.visitType?.purpose || ""}</p>
              <p><span className="font-semibold">Price:</span> ₹{details?.details?.price || "0"}</p>
              {details?.details?.customerType && (
                <p><span className="font-semibold">Customer Type:</span> {details.details.customerType}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VisitHistoryDetails;
