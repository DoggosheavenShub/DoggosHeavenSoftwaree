import { useState, useEffect } from "react";

import { useDispatch } from "react-redux";
import { addVeterinaryVisit } from "../../../store/slices/visitSlice";

import { useNavigate } from "react-router-dom";


const Veterinary = ({ _id, visitPurposeDetails }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [customerType, setCustomerType] = useState("pvtltd");
  const [isLoading, setIsLoading] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [price, setPrice] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  const [selectedPayment, setSelectedPayment] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const handlePaymentSelect = (method) => {
    setSelectedPayment(method);
  };

  useEffect(() => {
    if (customerType) {
      if (customerType === "pvtltd")
        setPrice(visitPurposeDetails?.consultationPricePvt);
      else if (customerType === "pvtltd Emergency")
        setPrice(visitPurposeDetails?.consultationPricePvtEmergency);
      else if (customerType === "NGO")
        setPrice(visitPurposeDetails?.consultationPriceNgo);
      else setPrice(visitPurposeDetails?.consultationPriceNgoEmergency);
    }
  }, [customerType]);

  useEffect(() => {
    setTotalPrice(price - discount < 0 ? 0 : price - discount);
  }, [price, discount]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const onSubmit = async () => {
    const data = {};
    data.petId = _id;
    data.visitType = visitPurposeDetails?._id;
    data.customerType = customerType;

    const details = {
      price,
      discount,
      selectedPayment,
      finalPrice: price - discount
    }

    if (!data.petId) {
      alert("No Pet Choosen")
      return;
    }

    if (!data.visitType) {
      alert("No Visit Choosen , First Choose a visit .")
      return;
    }

    if (!data.customerType) {
      alert("Customer Type Not Choosen")
      return;
    }

    data.details = details
    
       if(!isConfirmed) {
    alert("Please check the box")  
    return ;
    }

    if(!selectedPayment){
      alert("Please select payment method")  
    return ;
    }
    
    dispatch(addVeterinaryVisit(data)).then((data) => {
      console.log(data)
      if (data?.payload?.success) {
        alert("✅ Payment Done Successfully and visit saved");
        navigate("/staff/dashboard")
      } else
        alert(
          `${data?.payload?.message}`
        );
    });
  };

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
              {`I confirm that the payment of ₹ ${price - discount} has been completed`}
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
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors 
               bg-blue-500 text-white hover:bg-blue-600
              }`}
          >
            Submit
          </button>
        </div>
      </div>
    </div>)
  else
    return (
      <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Veterinary Form
        </h1>

        <form className="space-y-6">
         
          <div>
            <label className="block font-medium mb-1">Customer Type</label>
            <select
              value={customerType}
              onChange={(e) => setCustomerType(e.target.value)}
              required
              className="w-full mt-1 p-2 border rounded-md"
            >
              <option value="pvtltd">Pvt Ltd</option>
              <option value="pvtltd Emergency">Pvt Ltd Emergency</option>
              <option value="NGO">NGO</option>
              <option value="NGO Emergency">NGO Emergency</option>
            </select>
          </div>

          <div className="text-xl font-bold">Consultation Price: ₹ {price}</div>

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
                min={0}
                max={price}
                onWheel={(e) => e.target.blur()}
                onChange={(e) => {
                  const inputValue = Number(e.target.value);
                  const maxValue = price

                  if (inputValue > maxValue) return; // ignore input

                  setDiscount(inputValue);
                }}
                value={discount}
                className="w-full pl-8 pr-4 py-4 rounded-xl transition-all duration-300 focus:outline-none focus:ring-0"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  border: "2px solid #85A947",
                  color: "#123524",
                }}
                placeholder="Enter discount amount"
                onFocus={(e) => {
                  e.target.style.borderColor = "#3E7B27";
                  e.target.style.boxShadow = "0 0 0 3px rgba(62, 123, 39, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#85A947";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>
          </div>

          <div className="text-xl font-bold">Total Price: ₹ {totalPrice}</div>

          <button
            disabled={isLoading}
            onClick={() => setShowPopup(true)}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            Proceed To Payment
          </button>
        </form>
      </div>
    );
};

export default Veterinary;
