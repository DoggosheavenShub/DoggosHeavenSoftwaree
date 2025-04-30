import React, { useEffect, useState } from "react";
import {
  getAttendance,
  updateAttendance,
} from "../../store/slices/attendanceSlice";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/slices/authSlice";

const Attendance = () => {
  const [date, setdate] = useState(new Date().toISOString().split("T")[0]);
  const { attendanceListLoading } = useSelector((state) => state.attendance);
  const [presentIds, setPresentIds] = useState([]);
  const [absentIds, setAbsentIds] = useState([]);
  const [list, setList] = useState();
  const dispatch = useDispatch();

  const handleupdateAttendance = async (date) => {
    dispatch(updateAttendance({ date, presentIds,absentIds }))
      .then((data) => {
        if (data?.payload?.success) {
          setList(data?.payload?.List);
        } else alert(data?.payload?.message);
      })
      .catch((data) => {
        alert(data?.payload?.message);
      });
  };

  const remindAll = async () => {
    const res = confirm("Reminders will be send to absentees ");

    if (!res) return;

    const List = list
      .map((item, idx) => {
        if (!item?.present) {
          return {
            name: item?.petId?.name,
            breed: item?.petId?.breed,
            species: item?.petId?.species,
            ownerName: item?.petId?.owner?.name,
            ownerEmail: item?.petId?.owner?.email,
            date: date,
            purpose: item?.purpose,
          };
        }
      })
      .filter((item) => item !== undefined);

    const token = localStorage.getItem("authtoken");
    const response = await fetch(
      `${
        import.meta.env.VITE_BACKEND_URL
      }/api/v1/reminders/sendoverduereminders`,
      {
        method: "POST",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
          "Accept-Type": "application/json",
        },
        body: JSON.stringify({ List }),
      }
    );

    if (response.data === 401) return dispatch(logout());

    const data = await response.json();
  };

  // const handleCheckboxChange = (petId) => {
  //   const attendanceList = [...list];
  //   const updatedList = attendanceList.map((item) => {
  //     if (item.petId._id === petId) {
  //       return { ...item, present: !item.present }; // Toggle the present field
  //     }
  //     return item;
  //   });

  //   setList(updatedList);
  // };



  const handleCheckboxChange = (petId) => {

    const updatedList = list.map((item) => {
      console.log(petId , item?.petId?._id)
      if (item.petId?._id === petId) {
        const updatedPresent = !item.present;
        // Update present and absent lists
        if (updatedPresent) {
          setPresentIds((prev) => [...prev, petId]);
          setAbsentIds((prev) => prev.filter((id) => id !== petId));
        } else {
          setAbsentIds((prev) => [...prev, petId]);
          setPresentIds((prev) => prev.filter((id) => id !== petId));
        }

        return { ...item, present: updatedPresent };
      }
      return item;
    });
    setList(updatedList);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      dispatch(getAttendance(date)).then((data) => {
        if (data?.payload?.success) {
          setList(data?.payload?.List);
        } else setList([]);
      }, 1000);

      return () => clearTimeout(timeout);
    });
  }, [date, dispatch]);

  if (attendanceListLoading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  return (
    <div className="w-screen flex flex-col mt-10 justify-center items-center">
      <h2 className="text-4xl sm:text-3xl tracking-widest md:text-4xl font-semibold text-black text-center py-4">
        ATTENDANCE LIST
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
            No followup was scheduled for the chosen date.
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
                  <th className="px-6 py-3 text-center">Present</th>
                </tr>
              </thead>
              <tbody>
                {list?.map((item, idx) => {
                  return (
                    <tr key={idx} className="bg-white border-b border-[#E0E0E0">
                      <td className="px-6 py-4 text-center">
                        {item?.petId?.name}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {item?.petId?.species}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {item?.petId?.owner?.name}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {item?.petId?.owner?.phone}
                      </td>
                      <td className="px-6 py-4 text-center">{item?.purpose}</td>
                      <td className="px-6 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={item?.present}
                          onChange={() =>
                            handleCheckboxChange(item?.petId?._id)
                          }
                          className="h-5 w-5 text-[#172554] focus:bg-[#172544] peer-checked:bg-[#172554] border-gray-300 rounded"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-5 flex flex-col gap-y-5 items-center">
            <button
              className="bg-[#172554] px-5 py-2 rounded-md text-white hover:bg-[#172554] transition-colors duration-300"
              onClick={() => handleupdateAttendance(date, list)}
            >
              Save Changes
            </button>
            <button
              className="bg-[#172554] px-5 py-2 rounded-md text-white hover:bg-[#172554] transition-colors duration-300"
              onClick={remindAll}
            >
              Remind Absentees
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
