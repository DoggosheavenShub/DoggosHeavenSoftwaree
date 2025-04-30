import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { logout } from "../../store/slices/authSlice";

const BirthdayTable = () => {
  const [list, setList] = useState([]);
  const dispatch = useDispatch();

  const getBirthdayList = async (section) => {
    const token = localStorage.getItem("authtoken");
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/v1/pet/getpetsbybirthday`,
      {
        method: "GET",
        headers: {
          "Authorization": token,
          "Content-Type": "application/json",
        },
      }
    );

    if (response?.status === 401) dispatch(logout());

    const data = await response.json();

    setList(data?.List || []);
  };

  const remindAll = async () => {
    const res = confirm("Reminders will be send to following people ");

    if (!res) return;

    const token = localStorage.getItem("authtoken")||"";
    const response = await fetch(
      `${
        import.meta.env.VITE_BACKEND_URL
      }/api/v1/reminders/sendbirthdayreminders`,
      {
        method: "POST",
        headers: {
          "Authorization": token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ list }),
      }
    );

    if (response?.status===401) dispatch(logout());

    const data = await response.json();

   
  };



  useEffect(() => {
    getBirthdayList();
  }, []);

  if( !list || list?.length === 0){
     return ( <div className="w-[90%] p-6 mt-5  text-gray-800 rounded-lg shadow-md">
      <p className="text-center tracking-widest text-lg font-semibold">
          No pet has birthday today.
      </p>
    </div>)
  }
else
 return (
    <div className="mt-5 text-[12px] w-[90%] mx-auto lg:text-[15px] flex flex-col gap-y-4 items-center justify-center">
      <table className="min-w-full table-auto rounded-lg shadow-md">
        <thead>
          <tr className="bg-[#172554] text-white text-left">
            <th className="px-6 py-3 text-center">No.</th>
            <th className="px-6 py-3 text-center">Pet Name</th>
            <th className="px-6 py-3 text-center">Owner Name</th>
            <th className="px-6 py-3 text-center">Contact</th>
            <th className="px-6 py-3 text-center">Purpose</th>
            <th className="px-6 py-3 text-center">Date Of Birth</th>
          </tr>
        </thead>
        <tbody>
          {list?.map((item, idx) => {
            return (
              <tr className="bg-white" key={idx}>
                <td className="px-6 py-4 text-center">{idx + 1}</td>
                <td className="px-6 py-4 text-center">{item?.name}</td>
                <td className="px-6 py-4 text-center">{item?.owner?.name}</td>
                <td className="px-6 py-4 text-center">{item?.owner?.phone}</td>
                <td className="px-6 py-4 text-center">Birthday</td>
                <td className="px-6 py-4 text-center">
                  {item?.dob?.substring(0, 10)}
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

export default BirthdayTable;
