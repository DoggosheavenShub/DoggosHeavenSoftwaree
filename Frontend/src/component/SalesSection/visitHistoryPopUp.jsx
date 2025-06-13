import React, { useState, useEffect } from "react";
import { format } from "date-fns";

const VisitHistoryPopup = ({ visits, onClose }) => {
  // return (
  //   <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
  //     <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
  //       <div className="flex justify-between items-center mb-4">
  //         <h2 className="text-xl font-bold">Visit History</h2>
  //         <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
  //           ×
  //         </button>
  //       </div>
  //       <div className="space-y-4">
  //         {visits?.map((visit) => (
  //           <div key={visit._id} className="border-b pb-4">
  //             <div className="text-sm text-gray-500">
  //               {format(new Date(visit.createdAt), "PPp")}
  //             </div>
  //             <div className="font-medium">{visit.purpose}</div>
  //             {visit?.itemDetails.length >0 && (
  //               <div className="text-sm">
  //               Items:{" "}
  //               {visit.itemDetails
  //                 ?.map((item) => `${item.item.itemName} (${item.dose})`)
  //                 .join(", ")}
  //             </div>
  //             )}

  //             <div className="text-sm">Price: ${visit.price}</div>
  //           </div>
  //         ))}
  //       </div>
  //     </div>
  //   </div>
  // );
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-[#85A947]/30 max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#123524] to-[#3E7B27] p-6 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-white text-xl">📋</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Visit History</h2>
              <p className="text-white/80 text-sm">Complete medical record</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center text-2xl font-bold transition-all duration-200 hover:scale-110"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] bg-gradient-to-br from-[#EFE3C2]/20 to-white">
          {visits && visits.length > 0 ? (
            <div className="space-y-6">
              {visits?.map((visit, index) => (
                <div
                  key={visit._id}
                  className="bg-white/80 backdrop-blur-sm rounded-xl border border-[#85A947]/30 p-6 shadow-lg hover:shadow-xl transition-all duration-200 hover:border-[#3E7B27]/50"
                >
                  {/* Visit Header */}
                  <div className="flex items-start justify-between mb-4 pb-4 border-b border-[#85A947]/20">
                    <div className="flex items-center space-x-3">
                      <span className="w-8 h-8 bg-[#85A947] text-white rounded-full inline-flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                      <div>
                        <div className="text-sm text-[#85A947] font-medium">
                          📅 {format(new Date(visit.createdAt), "PPp")}
                        </div>
                        <div className="font-semibold text-[#123524] text-lg mt-1">
                          🎯 {visit.purpose}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[#3E7B27]">
                        ₹{visit.price}
                      </div>
                      <div className="text-sm text-[#85A947]">Total Cost</div>
                    </div>
                  </div>

                  {/* Items Section */}
                  {visit?.itemDetails && visit.itemDetails.length > 0 && (
                    <div className="bg-gradient-to-r from-[#EFE3C2]/30 to-white rounded-lg p-4 border border-[#85A947]/20">
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="text-[#123524] font-semibold">
                          💊 Items & Medications:
                        </span>
                        <span className="bg-[#85A947] text-white text-xs px-2 py-1 rounded-full font-medium">
                          {visit.itemDetails.length} items
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {visit.itemDetails?.map((item, itemIndex) => (
                          <div
                            key={itemIndex}
                            className="bg-white border border-[#85A947]/30 rounded-lg px-3 py-2 text-sm"
                          >
                            <div className="font-medium text-[#123524]">
                              {item.item.itemName}
                            </div>
                            <div className="text-[#3E7B27] text-xs">
                              Dose: {item.dose}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Additional Details */}
                  {(!visit?.itemDetails || visit.itemDetails.length === 0) && (
                    <div className="text-center py-4">
                      <div className="text-[#85A947] text-sm">
                        💡 No items or medications recorded for this visit
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mb-4">
                <svg
                  className="w-16 h-16 mx-auto text-[#85A947] opacity-60"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  ></path>
                </svg>
              </div>
              <p className="text-lg font-semibold text-[#3E7B27] mb-2">
                No Visit History Found
              </p>
              <p className="text-sm text-[#123524]/70">
                This patient hasn't had any recorded visits yet
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisitHistoryPopup;
