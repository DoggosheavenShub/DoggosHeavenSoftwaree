import React, { useState } from 'react';
import { Calendar, Clock, CreditCard, Heart } from 'lucide-react';

export default function DayCareBookingForm() {
  const [selectedDate, setSelectedDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Service details
  const serviceName = "Day Care";
  const servicePrice = 1200;

  const handlePayment = async () => {
    if (!selectedDate) return;
    
    setIsLoading(true);
    
    // Simulate payment processing
    setTimeout(() => {
      console.log('Payment processed:', {
        service: serviceName,
        selectedDate,
        price: servicePrice
      });
      setIsLoading(false);
      alert('Payment successful! Day care service booked.');
    }, 2000);
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="max-w-full flex justify-center p-4">
      <div
        className="p-8 rounded-2xl shadow-2xl w-full space-y-6 backdrop-blur-sm"
        style={{
          background: "linear-gradient(145deg, #EFE3C2 0%, rgba(239, 227, 194, 0.95) 100%)",
          border: "1px solid rgba(133, 169, 71, 0.3)",
          maxWidth: "500px",
        }}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <Heart
              className="w-8 h-8"
              style={{ color: "#85A947" }}
            />
            <h1
              className="text-3xl font-bold"
              style={{ color: "#123524" }}
            >
              {serviceName}
            </h1>
            <Heart
              className="w-8 h-8"
              style={{ color: "#85A947" }}
            />
          </div>
          <div
            className="w-20 h-1 mx-auto rounded-full"
            style={{ backgroundColor: "#85A947" }}
          ></div>
          <p
            className="text-sm mt-2"
            style={{ color: "#3E7B27" }}
          >
            Premium pet care service for your beloved companion
          </p>
        </div>

        {/* Date Selection */}
        <div className="space-y-3">
          <label
            className="block text-lg font-semibold"
            style={{ color: "#3E7B27" }}
          >
            Select Date
          </label>
          <div className="relative">
            <Calendar
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5"
              style={{ color: "#85A947" }}
            />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={getTodayDate()}
              required
              className="w-full pl-12 pr-4 py-4 rounded-xl text-lg transition-all duration-300 focus:outline-none focus:ring-0"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                border: "2px solid #85A947",
                color: "#123524",
              }}
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

        {/* Price Display */}
        <div
          className="p-6 rounded-xl"
          style={{
            background: "linear-gradient(135deg, rgba(18, 53, 36, 0.05) 0%, rgba(133, 169, 71, 0.05) 100%)",
            border: "2px solid rgba(133, 169, 71, 0.3)",
          }}
        >
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <span
                className="text-sm font-medium"
                style={{ color: "#3E7B27" }}
              >
                Service Price:
              </span>
              <div className="flex items-center space-x-2">
                <Clock
                  className="w-4 h-4"
                  style={{ color: "#85A947" }}
                />
                <span
                  className="text-xs"
                  style={{ color: "#85A947" }}
                >
                  Full day care (8AM - 6PM)
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2">
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
                  ₹{servicePrice}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Date Preview */}
        {selectedDate && (
          <div
            className="p-4 rounded-xl"
            style={{
              backgroundColor: "rgba(133, 169, 71, 0.1)",
              border: "2px solid rgba(133, 169, 71, 0.3)",
            }}
          >
            <div className="flex items-center justify-center space-x-2">
              <Calendar
                className="w-5 h-5"
                style={{ color: "#85A947" }}
              />
              <span
                className="text-lg font-semibold"
                style={{ color: "#123524" }}
              >
                {new Date(selectedDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        )}

        {/* Payment Button */}
        <button
          onClick={handlePayment}
          disabled={isLoading || !selectedDate}
          className="w-full p-5 rounded-xl font-semibold text-white text-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          style={{
            background: isLoading
              ? "linear-gradient(135deg, #85A947 0%, #3E7B27 100%)"
              : "linear-gradient(135deg, #3E7B27 0%, #123524 100%)",
            boxShadow: "0 4px 15px rgba(18, 53, 36, 0.3)",
          }}
          onMouseEnter={(e) => {
            if (!isLoading && selectedDate) {
              e.target.style.background = "linear-gradient(135deg, #123524 0%, #3E7B27 100%)";
              e.target.style.boxShadow = "0 6px 20px rgba(18, 53, 36, 0.4)";
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading && selectedDate) {
              e.target.style.background = "linear-gradient(135deg, #3E7B27 0%, #123524 100%)";
              e.target.style.boxShadow = "0 4px 15px rgba(18, 53, 36, 0.3)";
            }
          }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <svg
                className="animate-spin w-6 h-6"
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
              <CreditCard className="w-6 h-6" />
              <span>Pay ₹{servicePrice} & Book Service</span>
            </div>
          )}
        </button>

      </div>
    </div>
  );
}