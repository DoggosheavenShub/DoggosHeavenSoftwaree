import React, { useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import VisitHistoryDetails from "./VisitHistoryDetails";

import { getVisitList } from "../../store/slices/visitSlice";

const SalesHistory = () => {
  const [date, setdate] = useState(new Date().toISOString().split("T")[0]);
  const [name, setName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [visitdetails, setvisitdetails] = useState(null);
  const [list, setList] = useState([]);



  const onClose = () => {
    setvisitdetails(null);
  };

  const dispatch = useDispatch();

  useEffect(() => {
    let timeout = setTimeout(() => {
      const params = new URLSearchParams();
      params.append("name", name.trim());
      params.append("purpose", purpose.trim());
      params.append("date", date.trim());
      const queryString = params.toString();

      setIsLoading(true);
      dispatch(getVisitList(queryString))
        .then((data) => {
          if (data?.payload?.success) {
            setList(data?.payload?.List);
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    }, 1000);
    return () => clearTimeout(timeout);
  }, [name, purpose, date, dispatch]);

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
      <div className="w-[90vw] mx-auto">
        <div className="w-full flex justify-between">
          <input
            type="text"
            value={name}
            placeholder="Pet name"
            onChange={(e) => setName(e.target.value)}
            className="w-[50%] p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
          />
          <input
            type="text"
            placeholder="Purpose"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="w-[49%] p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
          />
        </div>
        <div className="mt-5 w-[50%] mx-auto flex gap-5 justify-evenly">
          <div className="tracking-widest">Choose Date</div>
          <input
            type="date"
            value={date}
            onChange={(e) => setdate(e.target.value)}
          />
        </div>
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="w-full">
          {!list || list?.length === 0 ? (
            <div className="w-[90%] p-6 mt-5 mx-auto  text-gray-800 rounded-lg shadow-md">
              <p className="text-center tracking-widest text-lg font-semibold">
                No visit was recorded on this date
              </p>
            </div>
          ) : (
            <div className="w-[95%] mx-auto mt-6 text-sm lg:text-base flex flex-col gap-y-4 items-center justify-center">
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
                          <td className="px-6 py-4 text-center">
                            {item?.visitType?.purpose}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {item?.details?.price || 0}
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
      )}
    </div>
  );
};

export default SalesHistory;
