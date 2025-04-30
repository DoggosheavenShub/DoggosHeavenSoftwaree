import React from "react";

const VaccinationPopup = ({ isOpen, onClose, vaccinations }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full relative">
        <h2 className="text-lg font-semibold text-gray-800">Vaccination Details</h2>

        <ul className="mt-4 list-disc pl-5 text-gray-600">
          {vaccinations?.map((vaccine, index) => (
            <li key={index}>
              <span className="font-medium">{vaccine.name}</span> -  
              {vaccine.numberOfDose} dose
            </li>
          ))}
        </ul>

     
        <button
          className="mt-4 w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default VaccinationPopup;
