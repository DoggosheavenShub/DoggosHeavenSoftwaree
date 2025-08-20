import React, { useState } from "react";
import { useForm } from "react-hook-form";
import "../../../App.css";
import { addDogParkVisit } from "../../../store/slices/visitSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loadRazorpayScript } from "./../../../utils/loadRazorpayScript"

const DogPark = ({ _id, visitPurposeDetails }) => {

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);

  const [selectedPayment, setSelectedPayment] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [discount, setDiscount] = useState(0)

  const validateForm = () => {

    if (discount < 0) {
      alert("Discount cannot be negative");
      return false;
    }

    if (discount >= visitPurposeDetails?.price) {
      alert(`Discount cannot exceed service price of ₹${visitPurposeDetails?.price}`);
      return false;
    }

    return true;
  };

  const handlePaymentSelect = (method) => {
    setSelectedPayment(method);
  };

  const onSubmit = () => {
    console.log("Submitting form with pet ID:", _id);
    console.log("Visit purpose details ID:", visitPurposeDetails._id);


    if (!_id || _id.trim() === "") {
      alert("A pet must be selected. Please select a pet before proceeding.");
      return;
    }

    if (!visitPurposeDetails || !visitPurposeDetails._id || visitPurposeDetails._id.trim() === "") {
      alert("Visit type is missing. Please try again.");
      return;
    }


    if (!validateForm()) {
      return;
    }
    
    if(!isConfirmed) {
    alert("Please check the box")  
    return ;
    }

    if(!selectedPayment){
      alert("Please select payment method")  
    return ;
    }


    const formattedData = {
      petId: _id,
      visitType: visitPurposeDetails._id,
      details: {
        initialPrice: visitPurposeDetails?.price,
        discount,
        price: visitPurposeDetails?.price - discount,
        selectedPayment,
      },
    };

    setIsLoading(true)
    dispatch(addDogParkVisit(formattedData)).then((data) => {
      if (data?.payload?.success) {
        alert("Dog boarded successfully");
        navigate("/staff/dashboard")
      }
      else
      alert(data?.payload?.message);

    }).finally(() => {
      setIsLoading(false)
    })
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Processing...</p>
        </div>
      </div>
    );
  }

  if (showPopup)
    return (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4 relative">
        <button
          onClick={() => setShowPopup(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Payment Options
        </h2>

        {/* Payment Method Selection */}
        <div className="mb-6">
          <p className="text-gray-700 mb-4 font-medium">Select Payment Method:</p>

          <div className="space-y-3">
            <button
              onClick={() => handlePaymentSelect('cash')}
              className={`w-full p-4 border-2 rounded-lg text-left transition-colors ${selectedPayment === 'cash'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 hover:border-gray-400'
                }`}
            >
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded-full border-2 mr-3 ${selectedPayment === 'cash'
                  ? 'border-blue-500 bg-blue-500'
                  : 'border-gray-300'
                  }`}>
                  {selectedPayment === 'cash' && (
                    <div className="w-full h-full rounded-full bg-white scale-50"></div>
                  )}
                </div>
                <span className="font-medium">Cash Payment</span>
              </div>
            </button>

            <button
              onClick={() => handlePaymentSelect('payment_link')}
              className={`w-full p-4 border-2 rounded-lg text-left transition-colors ${selectedPayment === 'payment_link'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 hover:border-gray-400'
                }`}
            >
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded-full border-2 mr-3 ${selectedPayment === 'payment_link'
                  ? 'border-blue-500 bg-blue-500'
                  : 'border-gray-300'
                  }`}>
                  {selectedPayment === 'payment_link' && (
                    <div className="w-full h-full rounded-full bg-white scale-50"></div>
                  )}
                </div>
                <span className="font-medium">Payment Link</span>
              </div>
            </button>
          </div>
        </div>

        {/* Confirmation Checkbox */}
        <div className="mb-6">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isConfirmed}
              onChange={(e) => setIsConfirmed(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-3 text-gray-700">
              {`I confirm that the payment of ₹ ${visitPurposeDetails?.price - discount} has been completed`}
            </span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={() => setShowPopup(false)}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={isLoading}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-color  bg-blue-500 text-white hover:bg-blue-600
              }`}
          >
            Submit
          </button>
        </div>
      </div>
    </div>)
  else
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-md mx-auto">
          <form
            className="bg-white p-6 rounded-lg shadow-md space-y-6"
          >
            {/* Header */}
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Service Payment
              </h2>
              <div className="w-12 h-1 bg-blue-500 mx-auto rounded"></div>
            </div>

            {/* Price Section */}
            <div className="space-y-4">
              {/* Service Price */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Service Price
                </label>
                <div className="bg-gray-100 p-3 rounded-lg text-center">
                  <span className="text-lg font-bold text-gray-800">
                    ₹{visitPurposeDetails?.price}
                  </span>
                </div>
              </div>

              {/* Discount Input */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Apply Discount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    ₹
                  </span>
                  <input
                    type="number"
                    max={visitPurposeDetails?.price}
                    min={0}
                    step="0.01"
                    value={discount}
                    onChange={(e) => {
                      const inputValue = Number(e.target.value);
                      const maxValue = visitPurposeDetails?.price ?? Infinity;

                      if (inputValue > maxValue) return; // ignore input

                      setDiscount(inputValue);
                    }}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Enter discount amount"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Maximum discount: ₹{visitPurposeDetails?.price}
                </p>
              </div>
            </div>

            {/* Total Price */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-sm font-medium text-gray-600">
                    Final Amount:
                  </span>
                  {discount > 0 && (
                    <p className="text-xs text-blue-600">
                      Discount Applied: ₹{discount || 0}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-gray-800">
                    ₹{visitPurposeDetails?.price - discount}
                  </span>

                </div>
              </div>
            </div>


            <button
              onClick={() => setShowPopup(true)}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Processing...</span>
                </div>
              ) : (
                <span>
                  {visitPurposeDetails?.price - discount === 0 ? "Complete Service" : "Proceed to Payment"}
                </span>
              )}
            </button>


          </form>
        </div>
      </div>
    );
};

export default DogPark;