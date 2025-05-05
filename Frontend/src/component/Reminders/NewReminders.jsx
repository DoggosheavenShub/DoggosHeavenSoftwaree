import React, { useEffect, useState } from "react";
import "../../App.css";
import {
  getRemindersList,
  sendReminders,
} from "../../store/slices/remindersSlice";
import { useDispatch, useSelector } from "react-redux";

const NewReminders = () => {
  const { List } = useSelector((state) => state.reminders);
  const [date, setdate] = useState(new Date().toISOString().split("T")[0]);
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const remindAll = () => {
    
    setIsLoading(true);
    dispatch(sendReminders(date))
      .then((data) => {
        if (data?.payload?.success) {
          alert("Reminders will be sent");
        } else alert("Error in sending reminders");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoading(true);
      dispatch(getRemindersList(date))
        .then((data) => {
          console.log(data);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }, 1000);

    return () => clearTimeout(timeout);
  }, [date, dispatch]);
  return (
    <>
      <h1 className="text-center font-bold mt-10 text-5xl">REMINDERS</h1>
      <div className="mt-10 flex gap-5 justify-evenly">
        <div className="tracking-widest">Choose Date</div>
        <input
          type="date"
          value={date}
          onChange={(e) => setdate(e.target.value)}
        />
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="w-[90%] mx-auto">
          {!List || List?.length === 0 ? (
            <div className="w-full p-6 mt-5 mx-auto text-gray-800 rounded-lg shadow-md">
              <p className="text-center tracking-widest text-lg font-semibold">
                No Reminders for Choosen Date
              </p>
            </div>
          ) : (
            <div className="w-full overflow-x-scroll hidescroller  mx-auto mt-5 text-[12px] lg:text-[15px] flex flex-col gap-y-4 items-center justify-center">
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
                        <td className="px-6 py-4 text-center">
                          {item?.petName}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {item?.ownerName}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {item?.contact}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {item?.purpose}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {item?.scheduledDate?.substring(0, 10) || "NA"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="w-full flex justify-center items-center">
                <button
                  onClick={remindAll}
                  disabled={isLoading}
                  className="bg-[#172554] px-5  py-2 rounded-md text-white mt-4"
                >
                  Remind All
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default NewReminders;
