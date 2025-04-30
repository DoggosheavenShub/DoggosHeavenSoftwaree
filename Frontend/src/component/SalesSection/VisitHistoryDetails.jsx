import React, { useState, useEffect } from "react";
import { format } from "date-fns";
 
const VisitHistoryDetails = ({onClose }) => {
 
  const visitdetails = {
    name: "Bruno",
    species: "Dog",
    owner: "John Doe",
    phone: "9876543210",
    purpose: "veterinary",
    price: 750,
    vaccines: [
      {
        name: "Anti-Rabies",
        doseNumber: 1,
        volumeUsed: 2,
        stockUsed: 1,
      },
      {
        name: "DHPPiL",
        doseNumber: 2,
        volumeUsed: 1.5,
        stockUsed: 1,
      },
    ],
    medicines: [
      {
        name: "Amoxicillin",
        stockUsed: 2,
        unit: "tabs",
      },
      {
        name: "Metronidazole",
        stockUsed: 1,
        unit: "bottle",
      },
    ],
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 overflow-y-scroll max-w-2xl w-full max-h-[90vh]">
        <div className="flex justify-between  items-center mb-4 ">
          <h2 className="text-xl font-bold">{"5 Feb 2025"}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>
 
        {visitdetails?.purpose === "veterinary" ? (
          <div className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4 text-gray-700 text-sm">
              <div><span className="font-semibold">Name:</span> {visitdetails?.name || ""}</div>
              <div><span className="font-semibold">Species:</span> {visitdetails?.species || ""}</div>
              <div><span className="font-semibold">Owner:</span> {visitdetails?.owner || ""}</div>
              <div><span className="font-semibold">Phone:</span> {visitdetails?.phone || ""}</div>
              <div><span className="font-semibold">Price:</span> ₹{visitdetails?.price || "0"}</div>
            </div>
 
            {/* Vaccines */}
            {visitdetails?.vaccines?.length > 0 && (
              <div className="mt-4">
                <h3 className="text-base font-bold text-gray-800 mb-2">🧬 Vaccines</h3>
                <div className="space-y-2">
                  {visitdetails.vaccines.map((vaccine, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg px-4 py-2 text-sm bg-gray-50"
                    >
                      <div><span className="font-medium">Vaccine Name:</span> {vaccine.name}</div>
                      <div><span className="font-medium">Dose Number:</span> {vaccine.doseNumber}</div>
                      <div><span className="font-medium">Volume Used:</span> {vaccine.volumeUsed} ml</div>
                      <div><span className="font-medium">Stock Used:</span> {vaccine.stockUsed}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
 
            {/* Medicines */}
            {visitdetails?.medicines?.length > 0 && (
              <div className="mt-4">
                <h3 className="text-base font-bold text-gray-800 mb-2">💊 Medicines</h3>
                <div className="space-y-2">
                  {visitdetails.medicines.map((med, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg px-4 py-2 text-sm bg-gray-50"
                    >
                      <div><span className="font-medium">Medicine Name:</span> {med.name}</div>
                      <div><span className="font-medium">Stock Used:</span> {med.stockUsed} {med.unit || 'tabs'}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          // Default Layout
          <div className="space-y-4">
            <div className="space-y-2 text-gray-700">
              <p><span className="font-semibold">Name:</span> {visitdetails?.name || ""}</p>
              <p><span className="font-semibold">Species:</span> {visitdetails?.species || ""}</p>
              <p><span className="font-semibold">Owner:</span> {visitdetails?.owner || ""}</p>
              <p><span className="font-semibold">Phone:</span> {visitdetails?.phone || ""}</p>
              <p><span className="font-semibold">Purpose:</span> {visitdetails?.purpose || ""}</p>
              <p><span className="font-semibold">Price:</span> ₹{visitdetails?.price || "0"}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
 
 
};
 
export default VisitHistoryDetails;