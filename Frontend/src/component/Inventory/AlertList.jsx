import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAlertListOfInventory } from "../../store/slices/inventorySlice";
import { useNavigate } from "react-router-dom";
import { logout } from "../../store/slices/authSlice";

const AlertList = () => {
  const dispatch = useDispatch();
  const navigate=useNavigate();
  const { inventoryList } = useSelector((state) => state.inventory);
  useEffect(() => {
    dispatch(getAlertListOfInventory());
  }, []);

  const handleRefill=(id)=>{
    navigate("/editInventory", {state:{id}})
  }

  return (
    // <div className="mt-5 text-[12px] lg:text-[15px] flex flex-col gap-y-4 items-center justify-center">
    //   <h2 className="text-2xl">Alert List</h2>
    //   <table className="mt-5 w-[90%] sm:w-[85%] rounded-lg">
    //     <thead>
    //       <tr className="bg-[#D0DFF2] min-h-[40px] grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-x-4">
    //         <th className="hidden col-span-1 lg:flex justify-center items-center">
    //           No.
    //         </th>
    //         <th className="flex col-span-2 justify-center items-center">
    //           Name{" "}
    //         </th>
    //         <th className="flex col-span-2 justify-center items-center">
    //           Stock Unit
    //         </th>
    //         <th className="flex col-span-2 justify-center items-center">
    //           Total Volume
    //         </th>
    //       </tr>
    //     </thead>
    //     <tbody>
    //       {inventoryList?.map((item, idx) => {
    //         return (
    //           <tr
    //             className={`${
    //               idx % 2 == 1 ? "bg-[white]" : "bg-[#F3F8FE]"
    //             }min-h-[40px] grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-x-4`}
    //             key={idx}
    //           >
    //             <td className="hidden col-span-1 lg:flex justify-center items-center">
    //               {idx + 1}
    //             </td>
    //             <td className="flex col-span-2 justify-center items-center">
    //               {item?.itemName}
    //             </td>
    //             <td className="flex col-span-2 justify-center items-center">
    //               {item?.stockUnit}
    //             </td>
    //             <td className="flex col-span-2 justify-center items-center">
    //               {item?.totalVolume}
    //             </td>
    //           </tr>
    //         );
    //       })}
    //     </tbody>
    //   </table>
    // </div>
    <div className="w-[90%] mx-auto mt-5 text-sm lg:text-base flex flex-col gap-y-4 items-center justify-center">
  <h2 className="text-2xl tracking-widest font-semibold">ALERT LIST</h2>
  <div className="overflow-x-auto w-full mt-5">
    <table className="min-w-full table-auto rounded-lg shadow-md">
      <thead>
        <tr className="bg-[#172554] text-white text-left">
          <th className="px-6 py-3 text-center">No.</th>
          <th className="px-6 py-3 text-center">Name</th>
          <th className="px-6 py-3 text-center">Stock Unit</th>
          <th className="px-6 py-3 text-center">Total Volume</th>
          <th className="px-6 py-3 text-center">Refill</th>
        </tr>
      </thead>
      <tbody>
        {inventoryList?.map((item, idx) => {
          return (
            <tr
              key={idx}
              className= "bg-white border-b border-[#E0E0E0]"
            >
              <td className="px-6 py-4 text-center">{idx + 1}</td>
              <td className="px-6 py-4 text-center">{item?.itemName}</td>
              <td className="px-6 py-4 text-center">{item?.stockUnit}</td>
              <td className="px-6 py-4 text-center">{item?.totalVolume}</td>
              <td className="px-6 py-4 text-center">
                <button
                  onClick={()=>handleRefill(item?._id)}
                  className="bg-[#172554] text-white px-4 py-2 rounded-md hover:bg-[#0b1d3d] transition-colors duration-300"
                >
                  Refill
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
</div>


  );
};

export default AlertList;
