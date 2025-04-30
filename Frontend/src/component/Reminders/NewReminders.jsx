import React, { useEffect, useState } from "react";
import "../../App.css";
import { getRemindersList } from "../../store/slices/remindersSlice";
import {useDispatch,useSelector} from "react-redux"

const NewReminders = () => {
  const {List}=useSelector((state)=>state.reminders)
  const [date, setdate] = useState(new Date().toISOString().split("T")[0]);
  const dispatch=useDispatch();

  useEffect(()=>{
    const timeout = setTimeout(() => {
      dispatch(getRemindersList(date)).then((data) => {
        console.log(data)
      }, 1000);
  
      return () => clearTimeout(timeout);
    });
  },[date,dispatch])
  return (
    <>
      <div className="mt-5 flex gap-5 justify-evenly">
        <div className="tracking-widest">Choose Date</div>
        <input
          type="date"
          value={date}
          onChange={(e) => setdate(e.target.value)}
        />
      </div>
      {!List || List?.length === 0 ? (
        <div className="w-[90%] p-6 mt-5  text-gray-800 rounded-lg shadow-md">
          <p className="text-center tracking-widest text-lg font-semibold">
            No Reminders for Choosen Date
          </p>
        </div>
      ) : (
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
              {List?.map((item, idx) => {
                return (
                  <tr className="bg-white" key={idx}>
                    <td className="px-6 py-4 text-center">{idx + 1}</td>
                    <td className="px-6 py-4 text-center">{item?.petName}</td>
                    <td className="px-6 py-4 text-center">{item?.ownerName}</td>
                    <td className="px-6 py-4 text-center">{item?.contact}</td>
                    <td className="px-6 py-4 text-center">{item?.purpose}</td>
                    <td className="px-6 py-4 text-center">
                      {item?.scheduledDate?.substring(0, 10) || "NA"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

export default NewReminders;
