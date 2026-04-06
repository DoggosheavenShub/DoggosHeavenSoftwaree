import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getVisitList, getAllVisitType } from "../../store/slices/visitSlice";
import { filterPetsByNameAndPhone } from "../../store/slices/petSlice";
import VisitHistoryDetails from "./VisitHistoryDetails";
import Inquiry from "./VisitPurpose/Inquiry";
import DogPark from "./VisitPurpose/DogPark";
import Hostel from "./VisitPurpose/Hostel";
import Grooming from "./VisitPurpose/Grooming";
import DayCare from "./VisitPurpose/DayCare";
import DaySchool from "./VisitPurpose/DaySchool";
import PlaySchool from "./VisitPurpose/PlaySchool";
import Shop from "./VisitPurpose/Shop";
import Veterinary from "./VisitPurpose/Veterinary";
import BuySubscription from "./VisitPurpose/BuySubscription";
import Navbar from "../navbar";

const TotalVisits = () => {
  const dispatch = useDispatch();

  // Visit list state
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [name, setName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [list, setList] = useState([]);
  const [visitdetails, setVisitdetails] = useState(null);

  // Add Visit Modal state
  const [showModal, setShowModal] = useState(false);
  const [visitTypes, setVisitTypes] = useState([]);
  const [selectedPurpose, setSelectedPurpose] = useState("");
  const [petSearch, setPetSearch] = useState("");
  const [petResults, setPetResults] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [petSearchLoading, setPetSearchLoading] = useState(false);

  // Fetch visit list
  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams();
      params.append("name", name.trim());
      params.append("purpose", purpose.trim());
      params.append("date", date.trim());
      setIsLoading(true);
      dispatch(getVisitList(params.toString()))
        .then((data) => {
          if (data?.payload?.success) setList(data?.payload?.List);
          else setList([]);
        })
        .finally(() => setIsLoading(false));
    }, 800);
    return () => clearTimeout(timeout);
  }, [name, purpose, date, dispatch]);

  // Fetch visit types for modal
  useEffect(() => {
    if (showModal && visitTypes.length === 0) {
      dispatch(getAllVisitType()).then((data) => {
        if (data?.payload?.success) {
          setVisitTypes(data.payload.visitTypes);
          setSelectedPurpose(data.payload.visitTypes[0]?.purpose || "");
        }
      });
    }
  }, [showModal]);

  // Pet search with debounce
  useEffect(() => {
    if (!petSearch.trim()) { setPetResults([]); return; }
    const timeout = setTimeout(() => {
      setPetSearchLoading(true);
      const params = new URLSearchParams();
      // Try as name first, also pass as phone in case user types phone number
      params.append("name", petSearch.trim());
      params.append("phone", petSearch.trim());
      dispatch(filterPetsByNameAndPhone(params.toString()))
        .then((data) => {
          setPetResults(data?.payload?.list || []);
        })
        .finally(() => setPetSearchLoading(false));
    }, 600);
    return () => clearTimeout(timeout);
  }, [petSearch, dispatch]);

  const openModal = () => {
    setShowModal(true);
    setSelectedPet(null);
    setPetSearch("");
    setPetResults([]);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPet(null);
    setPetSearch("");
    setPetResults([]);
  };

  const visitPurposeDetails = visitTypes.find((v) => v.purpose === selectedPurpose) || null;

  const renderVisitForm = () => {
    if (!selectedPet) return null;
    const _id = selectedPet._id;
    switch (selectedPurpose) {
      case "Inquiry": return <Inquiry _id={_id} visitPurposeDetails={visitPurposeDetails} />;
      case "Dog Park": return <DogPark _id={_id} visitPurposeDetails={visitPurposeDetails} />;
      case "Veterinary": return <Veterinary _id={_id} visitPurposeDetails={visitPurposeDetails} />;
      case "Hostel": return <Hostel _id={_id} visitPurposeDetails={visitPurposeDetails} />;
      case "Day Care": return <DayCare _id={_id} visitPurposeDetails={visitPurposeDetails} />;
      case "Day School": return <DaySchool _id={_id} visitPurposeDetails={visitPurposeDetails} />;
      case "Play School": return <PlaySchool _id={_id} visitPurposeDetails={visitPurposeDetails} />;
      case "Grooming": return <Grooming _id={_id} visitPurposeDetails={visitPurposeDetails} />;
      case "Shop": return <Shop _id={_id} visitPurposeDetails={visitPurposeDetails} />;
      case "Buy Subscription": return <BuySubscription _id={_id} visitPurposeDetails={visitPurposeDetails} />;
      default: return <div className="text-[#123524]">Select a purpose</div>;
    }
  };

  if (visitdetails) {
    return <VisitHistoryDetails visitdetails={visitdetails} onClose={() => setVisitdetails(null)} />;
  }

  return (
    <>
      <Navbar />
      <div className="w-screen min-h-screen bg-gradient-to-br from-[#EFE3C2] to-[#f5f0e8]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-8 pt-8 pb-4 gap-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-[#85A947]/30 px-8 py-4">
            <h2 className="text-3xl font-bold text-[#123524]">🏥 Total Visits</h2>
          </div>
          <button
            onClick={openModal}
            className="bg-[#123524] text-[#EFE3C2] font-semibold px-6 py-3 rounded-xl hover:bg-[#3E7B27] transition-colors shadow-lg"
          >
            + Add New Visit
          </button>
        </div>

        {/* Filters */}
        <div className="w-[90vw] mx-auto mb-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-[#85A947]/20 p-6">
            <div className="w-full flex flex-col sm:flex-row gap-4 mb-4">
              <input
                type="text"
                value={name}
                placeholder="🐾 Pet name"
                onChange={(e) => setName(e.target.value)}
                className="flex-1 p-4 border-2 border-[#85A947] rounded-xl focus:ring-2 focus:ring-[#3E7B27] focus:border-[#3E7B27] focus:outline-none bg-white text-[#123524] placeholder-[#85A947] font-medium"
              />
              <input
                type="text"
                placeholder="🎯 Purpose"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="flex-1 p-4 border-2 border-[#85A947] rounded-xl focus:ring-2 focus:ring-[#3E7B27] focus:border-[#3E7B27] focus:outline-none bg-white text-[#123524] placeholder-[#85A947] font-medium"
              />
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 bg-[#EFE3C2]/50 rounded-xl p-4">
              <span className="text-[#123524] font-semibold">📅 Choose Date</span>
              <input
                type="date"
                value={date}
                max={new Date().toISOString().split("T")[0]}
                onChange={(e) => setDate(e.target.value)}
                className="p-3 border-2 border-[#85A947] rounded-xl focus:ring-2 focus:ring-[#3E7B27] focus:outline-none bg-white text-[#123524] font-medium"
              />
            </div>
          </div>
        </div>

        {/* Visit List */}
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-14 w-14 border-4 border-[#85A947]/30 border-t-[#3E7B27]"></div>
          </div>
        ) : !list || list.length === 0 ? (
          <div className="w-[90%] mx-auto p-8 bg-gradient-to-r from-[#EFE3C2] to-[#f5f0e8] text-[#123524] rounded-2xl shadow-lg border border-[#85A947]/30 text-center">
            <p className="text-lg font-semibold text-[#3E7B27]">No visit was recorded on this date</p>
            <p className="text-sm text-[#123524]/70 mt-2">Try selecting a different date or adjusting your filters</p>
            <button
              onClick={openModal}
              className="mt-4 bg-[#123524] text-[#EFE3C2] font-semibold px-6 py-2 rounded-xl hover:bg-[#3E7B27] transition-colors"
            >
              + Add New Visit
            </button>
          </div>
        ) : (
          <div className="w-[95%] mx-auto pb-8">
            <div className="overflow-x-auto bg-white rounded-2xl shadow-xl border border-[#85A947]/20">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-gradient-to-r from-[#123524] to-[#3E7B27] text-white text-left">
                    <th className="px-6 py-4 text-center font-semibold">🐾 Pet Name</th>
                    <th className="px-6 py-4 text-center font-semibold">Date</th>
                    <th className="px-6 py-4 text-center font-semibold">👤 Owner</th>
                    <th className="px-6 py-4 text-center font-semibold">📞 Contact</th>
                    <th className="px-6 py-4 text-center font-semibold">🎯 Purpose</th>
                    <th className="px-6 py-4 text-center font-semibold">💰 Price</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((item, idx) => (
                    <tr
                      key={idx}
                      onClick={() => setVisitdetails(item)}
                      className={`${idx % 2 === 0 ? "bg-[#EFE3C2]/30" : "bg-white"} hover:bg-[#85A947]/20 transition-all cursor-pointer border-b border-[#85A947]/20`}
                    >
                      <td className="px-6 py-4 text-center font-semibold text-[#123524]">{item?.pet?.name}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="bg-[#85A947]/20 text-[#123524] px-3 py-1 rounded-full text-sm font-medium">
                          {item?.createdAt?.substr(0, 10)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-medium text-[#3E7B27]">{item?.pet?.owner?.name || "N/A"}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="bg-[#3E7B27]/10 text-[#123524] px-3 py-1 rounded-full text-sm font-medium">
                          {item?.pet?.owner?.phone || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="bg-[#123524]/10 text-[#123524] px-3 py-1 rounded-full text-sm font-medium">
                          {item?.visitType?.purpose}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-[#3E7B27]">₹{item?.details?.price || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add Visit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#85A947]/30 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b-2 border-[#85A947]/20 bg-gradient-to-r from-[#123524] to-[#3E7B27] rounded-t-2xl">
              <h2 className="text-2xl font-bold text-[#EFE3C2]">🏥 Add New Visit</h2>
              <button onClick={closeModal} className="text-[#EFE3C2] hover:text-white text-3xl font-light leading-none">×</button>
            </div>

            <div className="p-6 space-y-6">
              {/* Step 1: Search Pet */}
              <div>
                <label className="block text-sm font-semibold text-[#123524] mb-2">🐾 Search Pet (by name or phone)</label>
                <input
                  type="text"
                  value={petSearch}
                  onChange={(e) => { setPetSearch(e.target.value); setSelectedPet(null); }}
                  placeholder="Type pet name or owner phone..."
                  className="w-full p-3 border-2 border-[#85A947] rounded-xl focus:ring-2 focus:ring-[#3E7B27] focus:outline-none text-[#123524]"
                />
                {petSearchLoading && (
                  <p className="text-sm text-[#85A947] mt-1">Searching...</p>
                )}
                {petResults.length > 0 && !selectedPet && (
                  <div className="mt-2 border-2 border-[#85A947]/30 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                    {petResults.map((pet) => (
                      <button
                        key={pet._id}
                        onClick={() => { setSelectedPet(pet); setPetResults([]); }}
                        className="w-full text-left px-4 py-3 hover:bg-[#EFE3C2] border-b border-[#85A947]/20 last:border-0 transition-colors"
                      >
                        <span className="font-semibold text-[#123524]">{pet.name}</span>
                        <span className="text-sm text-[#3E7B27] ml-2">({pet.species} - {pet.breed})</span>
                        {pet.owner?.phone && <span className="text-sm text-gray-500 ml-2">📞 {pet.owner.phone}</span>}
                      </button>
                    ))}
                  </div>
                )}
                {petSearch && !petSearchLoading && petResults.length === 0 && !selectedPet && (
                  <p className="text-sm text-gray-500 mt-1">No pets found</p>
                )}
              </div>

              {/* Selected Pet Info */}
              {selectedPet && (
                <div className="bg-[#EFE3C2]/50 rounded-xl p-4 border border-[#85A947]/30 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-[#123524]">{selectedPet.name}</p>
                    <p className="text-sm text-[#3E7B27]">{selectedPet.species} · {selectedPet.breed}</p>
                    {selectedPet.owner && (
                      <p className="text-sm text-gray-600">Owner: {selectedPet.owner.name} · {selectedPet.owner.phone}</p>
                    )}
                  </div>
                  <button
                    onClick={() => { setSelectedPet(null); setPetSearch(""); }}
                    className="text-sm text-red-500 hover:text-red-700 font-medium"
                  >
                    Change
                  </button>
                </div>
              )}

              {/* Step 2: Purpose of Visit */}
              <div>
                <label className="block text-sm font-semibold text-[#123524] mb-2">🎯 Purpose of Visit</label>
                <div className="relative">
                  <select
                    value={selectedPurpose}
                    onChange={(e) => setSelectedPurpose(e.target.value)}
                    className="w-full p-3 border-2 border-[#85A947] rounded-xl bg-white text-[#123524] font-medium focus:ring-2 focus:ring-[#3E7B27] focus:outline-none appearance-none"
                  >
                    {visitTypes.map((vt, idx) => (
                      <option key={idx} value={vt.purpose}>{vt.purpose}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-[#3E7B27]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Step 3: Visit Form (only when pet selected) */}
              {selectedPet ? (
                <div className="rounded-xl border border-[#85A947]/20 overflow-hidden">
                  <div className="bg-gradient-to-r from-[#123524] to-[#3E7B27] px-4 py-3">
                    <h3 className="text-base font-semibold text-white">📝 Visit Details</h3>
                  </div>
                  <div className="p-4">{renderVisitForm()}</div>
                </div>
              ) : (
                <div className="text-center py-6 text-[#85A947] font-medium bg-[#EFE3C2]/30 rounded-xl border-2 border-dashed border-[#85A947]/40">
                  Search and select a pet to fill visit details
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TotalVisits;
