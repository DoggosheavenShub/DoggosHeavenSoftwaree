import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAlertListOfInventory } from "../../store/slices/inventorySlice";
import { useNavigate } from "react-router-dom";
import { logout } from "../../store/slices/authSlice";
import Navbar from "../navbar";

const AlertList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { inventoryList } = useSelector((state) => state.inventory);
  useEffect(() => {
    dispatch(getAlertListOfInventory());
  }, []);

  const handleRefill = (id) => {
    navigate("/staff/editInventory", { state: { id } });
  };

  return (
    <>     <Navbar />
      <div className="w-[90%] mx-auto mt-8 text-sm lg:text-base flex flex-col gap-y-6 items-center justify-center">
        <div className="flex items-center gap-4">
          <div className="w-5 h-5 bg-gradient-to-r from-[#3E7B27] to-[#85A947] rounded-full"></div>
          <h2 className="text-3xl tracking-widest font-bold text-[#123524]">
            ALERT LIST
          </h2>
          <div className="w-5 h-5 bg-gradient-to-r from-[#85A947] to-[#3E7B27] rounded-full"></div>
        </div>

        <div className="overflow-x-auto w-full mt-8">
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-[#85A947]/20 overflow-hidden">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gradient-to-r from-[#123524] to-[#3E7B27] text-white">
                  <th className="px-8 py-5 text-center font-bold text-lg">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                      No.
                    </div>
                  </th>
                  <th className="px-8 py-5 text-center font-bold text-lg">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                      Name
                    </div>
                  </th>
                  <th className="px-8 py-5 text-center font-bold text-lg">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                      Stock Unit
                    </div>
                  </th>
                  <th className="px-8 py-5 text-center font-bold text-lg">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                      Stock
                    </div>
                  </th>
                  <th className="px-8 py-5 text-center font-bold text-lg">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                      Action
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {inventoryList?.map((item, idx) => {
                  return (
                    <tr
                      key={idx}
                      className="bg-gradient-to-r from-white to-[#EFE3C2]/20 border-b-2 border-[#85A947]/20 hover:from-[#EFE3C2]/30 hover:to-[#85A947]/10 transition-all duration-300 hover:shadow-md"
                    >
                      <td className="px-8 py-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-3 h-3 bg-[#85A947] rounded-full"></div>
                          <span className="font-bold text-[#123524] text-lg">
                            {idx + 1}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className="font-semibold text-[#123524] text-lg">
                          {item?.itemName}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-2 h-2 bg-[#3E7B27] rounded-full"></div>
                          <span className="font-medium text-[#123524]">
                            {item?.stockUnit}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                          <span className="font-bold text-orange-600 text-lg">
                            {item?.stock}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <button
                          onClick={() => handleRefill(item?._id)}
                          className="bg-gradient-to-r from-[#123524] to-[#3E7B27] text-white px-6 py-3 rounded-xl font-bold hover:from-[#3E7B27] hover:to-[#85A947] transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-[#85A947]/30"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                            Refill
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>

  );
};

export default AlertList;
