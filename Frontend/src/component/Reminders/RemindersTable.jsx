import React from "react";
import "../../App.css"

// const RemindersTable = ({ list, remindAll }) => {
//   return !list || list?.length === 0 ? (
//     <div className="w-[90%] p-6 mt-5  text-gray-800 rounded-lg shadow-md">
//         <p className="text-center tracking-widest text-lg font-semibold">
//           No Reminders for today.
//         </p>
//       </div>
//   ):(
//     <div className="w-[90%] overflow-x-scroll hidescroller  mx-auto mt-5 text-[12px] lg:text-[15px] flex flex-col gap-y-4 items-center justify-center">
//     <table className="min-w-full table-auto rounded-lg shadow-md">
//       <thead>
//         <tr className="bg-[#172554] text-white text-left">
//           <th className="px-6 py-3 text-center">No.</th>
//           <th className="px-6 py-3 text-center">Pet Name</th>
//           <th className="px-6 py-3 text-center">Owner Name</th>
//           <th className="px-6 py-3 text-center">Contact</th>
//           <th className="px-6 py-3 text-center">Purpose</th>
//           <th className="px-6 py-3 text-center">Scheduled Date</th>
//         </tr>
//       </thead>
//       <tbody>
//         {list?.map((item, idx) => {
//           return (
//             <tr
//               className="bg-white"
//               key={idx}
//             >
//               <td className="px-6 py-4 text-center">{idx + 1}</td>
//               <td className="px-6 py-4 text-center">{item?.pet?.name}</td>
//               <td className="px-6 py-4 text-center">
//                 {item?.pet?.owner?.name}
//               </td>
//               <td className="px-6 py-4 text-center">
//                 {item?.pet?.owner?.phone}
//               </td>
//               <td className="px-6 py-4 text-center">
//                 {item?.followUpPurpose || ""}
//               </td>
//               <td className="px-6 py-4 text-center">
//                 {item?.nextFollowUp?.substring(0, 10)}
//               </td>
//             </tr>
//           );
//         })}
//       </tbody>
//     </table>

//     <button
//       className="bg-[#172554] px-5 py-2 rounded-md text-white mt-4"
//       onClick={remindAll}
//     >
//       Remind All
//     </button>
//   </div>
//   );
    
// };

const RemindersTable = ({ list, remindAll }) => {
  return !list || list?.length === 0 ? (
    <div className="w-[90%] p-6 mt-5  text-gray-800 rounded-lg shadow-md">
        <p className="text-center tracking-widest text-lg font-semibold">
           No Reminders for Choosen Date
        </p>
      </div>
  ):(
    <div className="w-[90%] overflow-x-scroll hidescroller  mx-auto mt-5 text-[12px] lg:text-[15px] flex flex-col gap-y-4 items-center justify-center">
    <table className="min-w-full table-auto rounded-lg shadow-md">
      <thead>
        <tr className="bg-[#172554] text-white text-left">
          <th className="px-6 py-3 text-center">No.</th>
          <th className="px-6 py-3 text-center">Pet Name</th>
          <th className="px-6 py-3 text-center">Owner Name</th>
          <th className="px-6 py-3 text-center">Contact</th>
          <th className="px-6 py-3 text-center">Purpose</th>
          <th className="px-6 py-3 text-center">Scheduled Date</th>
        </tr>
      </thead>
      <tbody>
        {list?.map((item, idx) => {
          return (
            <tr
              className="bg-white"
              key={idx}
            >
              <td className="px-6 py-4 text-center">{idx + 1}</td>
              <td className="px-6 py-4 text-center">{item?.petName}</td>
              <td className="px-6 py-4 text-center">
                {item?.ownerName}
              </td>
              <td className="px-6 py-4 text-center">
                {item?.phone}
              </td>
              <td className="px-6 py-4 text-center">
                {item?.purpose}
              </td>
              <td className="px-6 py-4 text-center">
                {item?.scheduledDate?.substring(0, 10)||"NA"}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>

    <button
      className="bg-[#172554] px-5 py-2 rounded-md text-white mt-4"
      onClick={remindAll}
    >
      Remind All
    </button>
  </div>
  );
};
export default RemindersTable;
