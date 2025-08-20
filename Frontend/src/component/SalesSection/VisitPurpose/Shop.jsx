import React, { useState } from "react";
import { addShoppingVisit } from "../../../store/slices/visitSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { PaymentService } from "./PaymentComponents/PaymentService";
import { usePaymentFlow } from "./PaymentComponents/PaymentHooks";

const Shop = ({ _id, visitPurposeDetails }) => {
  const [items, setItems] = useState([{ name: "", price: 0 }]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [formData, setFormData] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading,setIsLoading]=useState(false)
  
    const [selectedPayment, setSelectedPayment] = useState('');
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [discount, setDiscount] = useState(0)

 

  const getTotalPrice = () => {
    return totalPrice;
  };



  const handleChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = field === "price" ? Number(value) : value;
    setItems(newItems);
    calculateTotal(newItems);
  };

  const calculateTotal = (items) => {
    const total = items.reduce(
      (acc, item) => acc + (Number(item.price) || 0),
      0
    );
    setTotalPrice(total);
  };

  const addItem = () => {
    setItems([...items, { name: "", price: 0 }]);
  };

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    calculateTotal(newItems);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Submitting shop visit with pet ID:", _id);
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

    const formattedData = {
      items: items,
      petId: _id,
      visitType: visitPurposeDetails._id,
      details: {
        totalCalculatedPrice: totalPrice,
        selectedPayment
      },
    };
    
     if(!isConfirmed) {
    alert("Please check the box")  
    return ;
    }

    if(!selectedPayment){
      alert("Please select payment method")  
    return ;
    }

    setIsLoading(true)
    dispatch(addShoppingVisit(formattedData))
      .then((result) => {
        if (result?.payload?.success) {
          alert("Payment successful and visit saved!");
          navigate("/staff/dashboard");
        } else {
          alert(result?.payload?.message || "Failed to save shop visit");
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error saving shop visit:", error);
        alert("An error occurred: " + error.message);
      
      }).finally(()=>{
        setIsLoading(false)
      });


  }
  
   const handlePaymentSelect = (method) => {
    setSelectedPayment(method);
  };
 
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#EFE3C2] to-[#f5f0e8] flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#85A947]/30 border-t-[#3E7B27]"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 bg-[#123524] rounded-full animate-pulse"></div>
          </div>
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
              {`I confirm that the payment of ₹ ${totalPrice} has been completed`}
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
            onClick={handleSubmit}
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
    <div className="min-h-screen bg-gradient-to-br from-[#EFE3C2] to-[#f5f0e8] p-6">
      <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-sm shadow-2xl rounded-2xl border border-[#85A947]/30 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#123524] to-[#3E7B27] p-6">
          <h2 className="text-2xl font-bold text-white text-center tracking-wide">
            🛒 Item Management
          </h2>
        </div>

        <div className="p-8">
          <form  className="space-y-6">
            {/* Items List */}
            <div className="space-y-4">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="group relative flex items-center space-x-4 p-4 bg-gradient-to-r from-[#EFE3C2]/50 to-white border-2 border-[#85A947]/30 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:border-[#3E7B27]/50"
                >
                  {/* Item Number Badge */}
                  <div className="flex-shrink-0">
                    <span className="w-8 h-8 bg-[#85A947] text-white rounded-full inline-flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                  </div>

                  {/* Item Name Input */}
                  <div className="flex-1">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) =>
                        handleChange(index, "name", e.target.value)
                      }
                      placeholder="🏷️ Item Name"
                      className="w-full p-3 border-2 border-[#85A947]/40 rounded-xl bg-white focus:ring-2 focus:ring-[#3E7B27] focus:border-[#3E7B27] focus:outline-none transition-all duration-200 text-[#123524] placeholder-[#85A947] font-medium"
                    />
                  </div>

                  {/* Price Input */}
                  <div className="w-32">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#3E7B27] font-bold">
                        ₹
                      </span>
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) =>
                          handleChange(index, "price", e.target.value)
                        }
                        placeholder="0"
                        className="w-full pl-8 pr-3 py-3 border-2 border-[#85A947]/40 rounded-xl bg-white focus:ring-2 focus:ring-[#3E7B27] focus:border-[#3E7B27] focus:outline-none transition-all duration-200 text-[#123524] font-medium"
                      />
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="flex-shrink-0 w-10 h-10 bg-red-500/10 hover:bg-red-500 text-red-600 hover:text-white rounded-xl transition-all duration-200 flex items-center justify-center group-hover:scale-110 font-bold"
                  >
                    ✖
                  </button>
                </div>
              ))}
            </div>

            {/* Add Item Button */}
            <button
              type="button"
              onClick={addItem}
              className="w-full py-4 bg-gradient-to-r from-[#85A947] to-[#3E7B27] hover:from-[#3E7B27] hover:to-[#123524] text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 active:scale-95"
            >
              ➕ Add New Item
            </button>

            {/* Total Price Display */}
            <div className="bg-gradient-to-r from-[#123524]/10 to-[#3E7B27]/10 p-6 rounded-xl border-2 border-[#85A947]/30">
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-[#123524]">
                  Total Amount:
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-3xl font-bold text-[#3E7B27]">
                    ₹{totalPrice}
                  </span>
                  {totalPrice > 0 && (
                    <span className="text-sm bg-[#85A947] text-white px-3 py-1 rounded-full">
                      {items.filter((item) => item.price > 0).length} items
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={()=>setShowPopup(true)}
              disabled={isLoading}
              className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all duration-200 ${totalPrice === 0
                  ? "bg-gradient-to-r from-[#123524] to-[#3E7B27] hover:from-[#3E7B27] hover:to-[#85A947] text-white hover:shadow-xl transform hover:scale-[1.02] active:scale-95"
                  : "bg-gradient-to-r from-[#3E7B27] to-[#85A947] hover:from-[#85A947] hover:to-[#3E7B27] text-white hover:shadow-xl transform hover:scale-[1.02] active:scale-95"
                } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                <>{totalPrice === 0 ? "📋 Submit" : "💳 Proceed to Payment"}</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Shop;
