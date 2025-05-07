import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { daySchoolDeboarding, getBoardingDetails } from "../../store/slices/deboardSlice";

const PlaySchoolDebaord = ({ _id, setboardingid }) => {

  const dispatch = useDispatch();
  const { boardingDetails } = useSelector((state) => state.deboard);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleDeboard = () => {
    setLoading(true);
    dispatch(daySchoolDeboarding(boardingDetails?._id))
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
    dispatch(getBoardingDetails(_id))
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
          <span className="text-gray-600 font-medium">Entry Date:</span>
          <span className="text-gray-800">
            {boardingDetails?.entryTime.substring(0, 10)}
          </span>
        </div>
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
      </div>
    </div>
  );
};

export default PlaySchoolDebaord;
