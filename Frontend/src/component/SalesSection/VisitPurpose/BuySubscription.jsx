import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";

import {
  buySubscription,
  getAllSubscription,
} from "../../../store/slices/subscriptionSlice";
import { useDispatch, useSelector } from "react-redux";

const BuySubscription = ({ _id, visitPurposeDetails }) => {
  const { subscriptions } = useSelector((state) => state.subscription);
  const { petDetails } = useSelector((state) => state.pets);
  const [isLoading,setIsLoading]=useState(false)
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState(null);

  const [selectedPayment, setSelectedPayment] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [planId,setPlanId]=useState("")
  const [price,setPrice]=useState(0);


  const getTotalPrice = () => {
    return totalPrice(planId);
  };
  
  const closepopup=()=>{
   setShowPopup(false)
   setPlanId("")
  }

  useEffect(()=>{
     if(planId)
     setPrice(getTotalPrice());
  },[planId])

  const onSubmit = (data) => {
    console.log("Submitting subscription with pet ID:", _id);
    console.log("Visit purpose details ID:", visitPurposeDetails._id);

    if (!_id || _id.trim() === "") {
      console.error("Missing pet ID");
      alert("A pet must be selected. Please select a pet before proceeding.");
      return;
    }

    if (
      !visitPurposeDetails ||
      !visitPurposeDetails._id ||
      visitPurposeDetails._id.trim() === ""
    ) {
      console.error("Missing visit type ID");
      alert("Visit type is missing. Please try again.");
      return;
    }

    if (!planId || planId.trim() === "") {
      alert("Please select a subscription plan.");
      return;
    }

    const details={};
    details.selectedPayment=selectedPayment
    details.price=totalPrice(planId)

    const formattedData = {
      petId: _id,
      visitType: visitPurposeDetails._id,
      planId,
      details,
      totalPrice: totalPrice(data.planId),
    };

    console.log("Form data prepared:", formattedData);
    setFormData(formattedData);

    setIsLoading(true)
    dispatch(buySubscription(formData))
    .then((result) => {
      if (result?.payload?.success) {
        alert("Payment successful and subscription purchased!");
        navigate("/staff/dashboard");
      } else {
        alert(
          result?.payload?.message || "Failed to purchase subscription"
        );
      }
      setIsLoading(false);
    })
    .catch((error) => {
      console.error("Error purchasing subscription:", error);
      alert("An error occurred: " + error.message);
      setIsLoading(false);
    }).finally(()=>{
      setIsLoading(false)
    });
   
  };

  const totalPrice = (id) => {
    if (id) {
      const plan = subscriptions.find((item) => item._id === id);
      return plan?.price;
    }
    return 0;
  };

  const handlePaymentSelect = (method) => {
    setSelectedPayment(method);
  };

  useEffect(() => {
    dispatch(getAllSubscription()).then((data) => {
      if (data?.payload?.success) setPlanId(subscriptions[0]?._id);
    });
  }, [dispatch]);

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );


  if (showPopup)
    return (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4 relative">
        <button
          onClick={closepopup}
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
              { `I confirm that the payment of ₹ ${price} has been completed` }
            </span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={closepopup}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={isLoading}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${selectedPayment && isConfirmed
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
          >
            Submit
          </button>
        </div>
      </div>
    </div>)
  else
    return (
      <div className="flex items-center justify-center p-4  bg-gray-50">
        <form
          className="p-6 rounded-lg shadow-lg w-full max-w-md space-y-5 bg-white"
        >
          {/* Header */}
          <div className="text-center mb-5">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Choose Your Plan
            </h2>
            <div className="w-12 h-1 mx-auto rounded bg-green-500"></div>
          </div>

          {/* Plan Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Subscription Plan
            </label>
            <div className="relative">
              <select
                onChange={(e)=>setPlanId(e.target.value)}
                defaultValue=""
                value={planId}
                className="w-full p-3 rounded-lg border-2 border-gray-300 focus:border-green-500 focus:outline-none bg-white text-gray-800"
              >
                <option value="" disabled className="text-gray-400">
                  Select your preferred plan
                </option>
                {subscriptions?.map((item, idx) => {
                  return item?.duration ? (
                    <option key={idx} value={item?._id} className="text-gray-800">
                      {`${item.subscriptionType?.purpose} - ${item.duration} days`}
                    </option>
                  ) : (
                    <option key={idx} value={item?._id} className="text-gray-800">
                      {`${item.subscriptionType?.purpose} - ${item.numberOfGroomings} groomings`}
                    </option>
                  );
                })}
              </select>
            </div>
            
          </div>

          {/* Price Details */}
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">
                Total Amount:
              </span>
              <span className="text-xl font-bold text-gray-800">
                ₹{totalPrice(planId)}
              </span>
            </div>
            {totalPrice(planId) > 0 && (
              <div className="mt-2 text-xs text-gray-500">
                * Secure payment processing
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button 
            disabled={totalPrice(planId)===0}
            onClick={() => setShowPopup(true)}
            className="w-full p-3 rounded-lg font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isLoading ? (
              <span>Processing...</span>
            ) : totalPrice(planId) === 0 ? (
              <span>Get Subscription</span>
            ) : (
              <span>Proceed to Payment</span>
            )}
          </button>
        </form>
      </div>

    );
};

export default BuySubscription;


