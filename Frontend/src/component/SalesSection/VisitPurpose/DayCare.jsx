import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import "../../../App.css";
import { addDayCareVisit } from "../../../store/slices/visitSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";


const DayCare = ({ _id, visitPurposeDetails }) => {

  const navigate = useNavigate();
  const dispatch=useDispatch()

  const [formData, setFormData] = useState(null);
  const [boardingDetails, setBoadringDetails] = useState(null);
  const [showPaymentOption, setShowPaymentOption] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPaymentType, setSelectedPaymentType] = useState('');
  const [price, setPrice] = useState(0);

  const handlePaymentSelect = (method) => {
    setSelectedPayment(method);
  };

  const handlePaymentTypeSelect = (type) => {
    setSelectedPaymentType(type);
  }

  const { register, handleSubmit, watch } = useForm({
    defaultValues: {
      discount: 0,
    },
  });

  const discount = watch("discount");

  const getTotalPrice = () => {

    return visitPurposeDetails.price - discount > 0
      ? visitPurposeDetails.price - discount
      : 0;
  };


  const onSubmit = () => {
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

     
    if(!isConfirmed) {
    alert("Please check the box")  
    return ;
    }

    if(!selectedPayment){
      alert("Please select payment method")  
    return ;
    }


    const formData = {
      petId: _id,
      visitType: visitPurposeDetails._id,
      details: {
        selectedPaymentType,
        selectedPayment,
        discount,
        paymentLeft:selectedPaymentType==="advance_payment"?0:selectedPaymentType==="partial_payment"?getTotalPrice()-price:getTotalPrice(),
        price: visitPurposeDetails.price,
        finalPrice: getTotalPrice(),
      },
    };


    setIsLoading(true)
    dispatch(addDayCareVisit(formData)).then((data) => {
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

  const checkBoarding = async () => {
    const token = localStorage.getItem("authtoken") || "";
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/v1/boarding/checkboarding`,
      {
        method: "POST",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ _id }),
      }
    );

    const data = await response.json();
    console.log(data);

    if (data?.success) {
      setBoadringDetails(data?.boardingDetails);
    } else {
      alert("Error in fetching boarding details");
      navigate("/staff/history");
    }
  };

  useEffect(() => {
    if (_id) {
      checkBoarding();
    }
  }, [_id]);

 
  if (boardingDetails)
    return (
      <div className="flex flex-col items-center space-y-4">
        <svg
          className="w-16 h-16"
          fill="currentColor"
          viewBox="0 0 20 20"
          style={{ color: "#85A947" }}
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>

        <p className="text-sm" style={{ color: "#85A947" }}>
          The pet is already boarded in {boardingDetails?.boardingType?.purpose}
        </p>
      </div>
    );

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

          {selectedPaymentType === "partial_payment" && (
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="space-y-4">
                <div className="text-lg font-medium text-gray-800">
                  Total Amount: {getTotalPrice()}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Amount Paid Right Now
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => {
                      const inputValue = Number(e.target.value);
                      const maxValue = getTotalPrice()

                      if (inputValue > maxValue) return; // ignore input

                      setPrice(inputValue);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter amount"
                  />
                </div>
              </div>
            </div>
          )}

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
              min={0}
              onChange={(e) => setIsConfirmed(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-3 text-gray-700">
              {`I confirm that the payment of ₹  ${selectedPaymentType === "partial_payment" ? price : selectedPaymentType === "payment_after_service" ? 0 : getTotalPrice()} has been completed`}
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
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors bg-blue-500 text-white hover:bg-blue-600
              `}
          >
            Submit
          </button>
        </div>
      </div>
    </div>)

  if (showPaymentOption)
    return (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4 relative">
        <button
          onClick={() => setShowPaymentOption(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Payment Options
        </h2>

        {/* Payment Type Selection */}
        <div className="mb-6">
          <p className="text-gray-700 mb-4 font-medium">Select Payment Type:</p>

          <div className="space-y-3">
            <button
              onClick={() => handlePaymentTypeSelect('partial_payment')}
              className={`w-full p-4 border-2 rounded-lg text-left transition-colors ${selectedPaymentType === 'partial_payment'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 hover:border-gray-400'
                }`}
            >
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded-full border-2 mr-3 ${selectedPaymentType === 'partial_payment'
                  ? 'border-blue-500 bg-blue-500'
                  : 'border-gray-300'
                  }`}>
                  {selectedPaymentType === 'partial_payment' && (
                    <div className="w-full h-full rounded-full bg-white scale-50"></div>
                  )}
                </div>
                <span className="font-medium">Partial Payment</span>
              </div>
            </button>

            <button
              onClick={() => handlePaymentTypeSelect('advance_payment')}
              className={`w-full p-4 border-2 rounded-lg text-left transition-colors ${selectedPaymentType === 'advance_payment'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 hover:border-gray-400'
                }`}
            >
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded-full border-2 mr-3 ${selectedPaymentType === 'advance_payment'
                  ? 'border-blue-500 bg-blue-500'
                  : 'border-gray-300'
                  }`}>
                  {selectedPaymentType === 'advance_payment' && (
                    <div className="w-full h-full rounded-full bg-white scale-50"></div>
                  )}
                </div>
                <span className="font-medium">Advance Payment</span>
              </div>
            </button>

            <button
              onClick={() => handlePaymentTypeSelect('payment_after_service')}
              className={`w-full p-4 border-2 rounded-lg text-left transition-colors ${selectedPaymentType === 'payment_after_service'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 hover:border-gray-400'
                }`}
            >
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded-full border-2 mr-3 ${selectedPaymentType === 'payment_after_service'
                  ? 'border-blue-500 bg-blue-500'
                  : 'border-gray-300'
                  }`}>
                  {selectedPaymentType === 'payment_after_service' && (
                    <div className="w-full h-full rounded-full bg-white scale-50"></div>
                  )}
                </div>
                <span className="font-medium">Payment After Service</span>
              </div>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={() => setShowPaymentOption(false)}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => setShowPopup(true)}
            disabled={!selectedPaymentType}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${selectedPaymentType
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
          >
            Submit
          </button>
        </div>
      </div>
    </div>)

  return (
    <div className="hidescroller">

      <div className="max-w-full flex justify-center p-4">
        <form

          className="p-8 rounded-2xl shadow-2xl w-full space-y-6 backdrop-blur-sm"
          style={{
            background:
              "linear-gradient(145deg, #EFE3C2 0%, rgba(239, 227, 194, 0.95) 100%)",
            border: "1px solid rgba(133, 169, 71, 0.3)",
            maxWidth: "600px",
          }}
        >
          {/* Header */}
          <div className="text-center mb-6">
            <h2
              className="text-2xl font-bold mb-2"
              style={{ color: "#123524" }}
            >
              Payment Details
            </h2>
            <div
              className="w-16 h-1 mx-auto rounded-full"
              style={{ backgroundColor: "#85A947" }}
            ></div>
          </div>

          {/* Price and Discount Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Original Price */}
            <div className="space-y-2">
              <label
                className="block text-sm font-medium"
                style={{ color: "#3E7B27" }}
              >
                Original Price
              </label>
              <div
                className="p-4 rounded-xl text-center"
                style={{
                  backgroundColor: "rgba(133, 169, 71, 0.1)",
                  border: "2px solid rgba(133, 169, 71, 0.3)",
                }}
              >
                <div className="flex items-center justify-center space-x-1">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    style={{ color: "#85A947" }}
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span
                    className="text-lg font-bold"
                    style={{ color: "#123524" }}
                  >
                    ₹{visitPurposeDetails?.price}
                  </span>
                </div>
              </div>
            </div>

            {/* Discount Input */}
            <div className="space-y-2">
              <label
                className="block text-sm font-medium"
                style={{ color: "#3E7B27" }}
              >
                Apply Discount
              </label>
              <div className="relative">
                <span
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lg font-medium"
                  style={{ color: "#85A947" }}
                >
                  ₹
                </span>
                <input
                  type="number"
                  {...register("discount", {
                    min: 0,
                    valueAsNumber: true,
                  })}
                  className="w-full pl-8 pr-4 py-4 rounded-xl transition-all duration-300 focus:outline-none focus:ring-0"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    border: "2px solid #85A947",
                    color: "#123524",
                  }}
                  placeholder="Enter discount amount"
                  onFocus={(e) => {
                    e.target.style.borderColor = "#3E7B27";
                    e.target.style.boxShadow =
                      "0 0 0 3px rgba(62, 123, 39, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#85A947";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>
          </div>

          {/* Total Price Display */}
          <div
            className="p-6 rounded-xl"
            style={{
              background:
                "linear-gradient(135deg, rgba(18, 53, 36, 0.05) 0%, rgba(133, 169, 71, 0.05) 100%)",
              border: "2px solid rgba(133, 169, 71, 0.3)",
            }}
          >
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <span
                  className="text-sm font-medium"
                  style={{ color: "#3E7B27" }}
                >
                  Total Amount to Pay:
                </span>
                {register("discount").value > 0 && (
                  <div className="text-xs" style={{ color: "#85A947" }}>
                    Discount Applied: ₹{register("discount").value || 0}
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-1">
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    style={{ color: "#123524" }}
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span
                    className="text-3xl font-bold"
                    style={{ color: "#123524" }}
                  >
                    ₹{getTotalPrice()}
                  </span>
                </div>
                {getTotalPrice() !== visitPurposeDetails?.price && (
                  <div className="text-sm mt-1" style={{ color: "#85A947" }}>
                    You save: ₹
                    {(visitPurposeDetails?.price || 0) - getTotalPrice()}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment Button */}
          <button
            onClick={() => setShowPaymentOption(true)}
            disabled={isLoading}
            className="w-full p-4 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            style={{
              background: isLoading
                ? "linear-gradient(135deg, #85A947 0%, #3E7B27 100%)"
                : "linear-gradient(135deg, #3E7B27 0%, #123524 100%)",
              boxShadow: "0 4px 15px rgba(18, 53, 36, 0.3)",
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.target.style.background =
                  "linear-gradient(135deg, #123524 0%, #3E7B27 100%)";
                e.target.style.boxShadow = "0 6px 20px rgba(18, 53, 36, 0.4)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.target.style.background =
                  "linear-gradient(135deg, #3E7B27 0%, #123524 100%)";
                e.target.style.boxShadow = "0 4px 15px rgba(18, 53, 36, 0.3)";
              }
            }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <svg
                  className="animate-spin w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
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
                <span>Processing Payment...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <span>Proceed to Payment</span>
              </div>
            )}
          </button>

        </form>
      </div>


    </div>
  );
};

export default DayCare;