import React, { useState, useEffect } from "react";

import { useDispatch, useSelector } from "react-redux";
import { addVeterinaryVisit } from "../../../store/slices/visitSlice";
import { getAllInventory } from "../../../store/slices/inventorySlice";
import { useNavigate } from "react-router-dom";

import { PaymentService } from "./PaymentComponents/PaymentService";
import { usePaymentFlow } from "./PaymentComponents/PaymentHooks";

const Veterinary = ({ _id, visitPurposeDetails }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [customerType, setCustomerType] = useState("pvtltd");
  const [isLoading, setIsLoading] = useState(false);
  const [discount,setDiscount]=useState(0);
  const [price, setPrice] = useState(0);
  const backendURL = import.meta.env.VITE_BACKEND_URL;
  const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY;

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

  const getTotalPrice=()=>{
     return price-discount ;
  }

  useEffect(()=>{
    getTotalPrice();
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
        Veterinary Inquiry Form
      </h1>

      <form className="space-y-6">
        {/* Customer Type */}
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

        <div className="text-xl font-bold">Total Price: ₹ {getTotalPrice()}</div>

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

        <div className="text-xl font-bold">Total Price: ₹ 0</div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
        >
          price
        </button>
      </form>
    </div>
  );
};

export default Veterinary;
