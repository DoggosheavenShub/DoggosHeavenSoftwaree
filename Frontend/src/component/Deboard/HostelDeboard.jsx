import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getBoardingDetails,
  updateHostelVisit,
  hostelDeboarding,
} from "../../store/slices/deboardSlice";
import { useNavigate } from "react-router-dom";

const HostelDeboard = ({ _id, setboardingid }) => {
  const dispatch = useDispatch();
  const { boardingDetails } = useSelector((state) => state.deboard);
  const [loading, setLoading] = useState(false);
  const [discount, setdiscount] = useState(0);
  const [actualnumberofdays, setactualnumberofdays] = useState(null);
  const navigate = useNavigate();

  const handleVisitUpdate = () => {
    const data = {};
    data.visitId = boardingDetails?.visitId;
    data.discount = discount;
    data.days = Math.abs(actualnumberofdays - boardingDetails?.numberOfDays);

    setLoading(true);

    dispatch(updateHostelVisit(data))
      .then((data) => {
        if (data?.payload?.success) {
          alert("Visit Updated now you can deboard");
        } else alert(data?.payload?.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleDeboard = () => {
    setLoading(true);
    dispatch(hostelDeboarding(boardingDetails?._id))
      .then((data) => {
        if (data?.payload?.success) {
          alert("Pet deboarded successfully");
          navigate("/dashboard");
        } else {
          alert("There was an error in deboarding pet");
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    dispatch(getBoardingDetails(_id)).then((data) => {
      if (data?.payload?.success) {
        setactualnumberofdays(data?.payload?.actualnumberOfDays);
      }
    });
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-lg w-11/12 sm:w-1/2 max-w-lg   flex flex-col p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Boarding Details
        </h2>
        <button
          onClick={() => setboardingid("")}
          className="text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center space-y-4">
        <div className="flex justify-between items-center p-3 bg-gray-100 rounded-md">
          <span className="text-gray-600 font-medium">
            Initial Number of Days:
          </span>
          <span className="text-gray-800">{boardingDetails?.numberOfDays}</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-gray-100 rounded-md">
          <span className="text-gray-600 font-medium">
            Actual Number of Days:
          </span>
          <span className="text-gray-800">{actualnumberofdays}</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-gray-100 rounded-md">
          <span className="text-gray-600 font-medium">Entry Date:</span>
          <span className="text-gray-800">
            {boardingDetails?.entryTime.substring(0, 10)}
          </span>
        </div>
        {actualnumberofdays <= boardingDetails?.numberOfDays ? (
          <div className="flex justify-between items-center p-3 bg-gray-100 rounded-md">
            <button
              disabled={loading}
              onClick={handleDeboard}
              className={`ml-4 px-4 py-1.5 text-sm ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-red-500 hover:bg-red-600"
              } text-white rounded-md transition`}
            >
              {loading ? "Processing..." : "Deboard"}
            </button>
          </div>
        ) : boardingDetails?.visitId?.details?.extradaysprice ? (
          <div className="flex justify-between items-center p-3 bg-gray-100 rounded-md">
            <button
              onClick={handleDeboard}
              disabled={loading}
              className={`ml-4 px-4 py-1.5 text-sm ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-red-500 hover:bg-red-600"
              } text-white rounded-md transition`}
            >
              {loading ? "Processing..." : "Deboard"}
            </button>
          </div>
        ) : (
          <div>
            {" "}
            <div className="flex w-full items-center justify-between px-5">
              <div>
                <label className="block text-gray-600 mb-1">Price</label>
                <div>{boardingDetails?.boardingType.price}</div>
              </div>
              <div>
                <label className="block text-gray-600 mb-1">Discount</label>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setdiscount(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Enter discount"
                />
              </div>
            </div>
            <div className="flex mt-3 items-center space-x-4">
              <label className="text-gray-600">Total Price:</label>
              <div className="text-lg font-semibold">
                {boardingDetails?.boardingType?.price - discount
                  ? (boardingDetails?.boardingType?.price - discount) *
                    Math.abs(actualnumberofdays - boardingDetails?.numberOfDays)
                  : 0}
              </div>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-100 rounded-md">
              <button
                disabled={loading}
                onClick={handleVisitUpdate}
                className={`ml-4 px-4 py-1.5 text-sm ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-500 hover:bg-red-600"
                } text-white rounded-md transition`}
              >
                {loading ? "Processing..." : "Pay Overdue Amount"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HostelDeboard;
