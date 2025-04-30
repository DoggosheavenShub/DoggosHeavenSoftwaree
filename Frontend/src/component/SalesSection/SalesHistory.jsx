import React, { useEffect, useState } from "react";
import {
  getAttendance,
  updateAttendance,
} from "../../store/slices/attendanceSlice";
import { useDispatch, useSelector } from "react-redux";
import VisitHistoryDetails from "./VisitHistoryDetails";

import { getVisitList } from "../../store/slices/visitSlice";

const SalesHistory = () => {
  const [date, setdate] = useState(new Date().toISOString().split("T")[0]);
  const { attendanceListLoading } = useSelector((state) => state.attendance);
  const [list, setList] = useState([
    {
      name: "Tommy",
      species: "dog",
      owner: "Nikhil",
      phone: "1122334455",
      purpose: "Vaccination",
      price: "800",
    },
    {
      name: "Simba",
      species: "cat",
      owner: "Anjali",
      phone: "3344556677",
      purpose: "Checkup",
      price: "1000",
    },
    {
      name: "Max",
      species: "dog",
      owner: "Priya",
      phone: "4455667788",
      purpose: "Day School",
      price: "600",
    },
    {
      name: "Luna",
      species: "cat",
      owner: "Amit",
      phone: "5566778899",
      purpose: "Play School",
      price: "800",
    },
  ]);

  const [visitdetails, setvisitdetails] = useState(null);

  const onClose = () => {
    setvisitdetails(null);
  };

  const dispatch = useDispatch();
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    console.log(date);
    const timeout = setTimeout(() => {
      dispatch(getVisitList(date)).then((data) => {
        if (data?.payload?.success) {
          setList(data?.payload?.List);
          console.log(list);
        } else setList([]);
      }, 300);

      return () => clearTimeout(timeout);
    });
  }, [date, dispatch]);

  if (attendanceListLoading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );

  if (visitdetails) {
    console.log(visitdetails);
    return (
      <VisitHistoryDetails visitdetails={visitdetails} onClose={onClose} />
    );
  }
  return (
    <div className="w-screen flex flex-col mt-10 justify-center items-center">
      <h2 className="text-4xl sm:text-3xl tracking-widest md:text-4xl font-semibold text-black text-center py-4">
        Visit History
      </h2>

      <div className="mt-5 flex gap-5 justify-evenly">
        <div className="tracking-widest">Choose Date</div>
        <input
          type="date"
          value={date}
          onChange={(e) => setdate(e.target.value)}
        />
      </div>
      {!list || list?.length === 0 ? (
        <div className="w-[90%] p-6 mt-5  text-gray-800 rounded-lg shadow-md">
          <p className="text-center tracking-widest text-lg font-semibold">
            No visit was recorded on this date
          </p>
        </div>
      ) : (
        <div className="w-[90%] mt-5 text-sm lg:text-base flex flex-col gap-y-4 items-center justify-center">
          <div className="overflow-x-auto w-full">
            <table className="min-w-full table-auto rounded-lg shadow-md">
              <thead>
                <tr className="bg-[#172554] text-white text-left">
                  <th className="px-6 py-3 text-center">Pet Name</th>
                  <th className="px-6 py-3 text-center">Species</th>
                  <th className="px-6 py-3 text-center">Owner Name</th>
                  <th className="px-6 py-3 text-center">Contact</th>
                  <th className="px-6 py-3 text-center">Purpose</th>
                  <th className="px-6 py-3 text-center">Price</th>
                </tr>
              </thead>
              <tbody>
                {list?.map((item, idx) => {
                  return (
                    <tr
                      onClick={() => setvisitdetails(item)}
                      key={idx}
                      className="bg-white border-b border-[#E0E0E0 cursor-pointer"
                    >
                      <td className="px-6 py-4 text-center">
                        {item?.pet?.name}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {item?.pet?.species}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {item?.pet?.owner?.name || ""}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {item?.pet?.owner?.phone || ""}
                      </td>
                      <td className="px-6 py-4 text-center">{item?.purpose}</td>
                      <td className="px-6 py-4 text-center">
                        {item?.price || 0}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesHistory;
