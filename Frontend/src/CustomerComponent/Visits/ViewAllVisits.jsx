import { useState, useEffect } from "react";
import { X, Calendar, DollarSign } from "lucide-react";
import { useDispatch } from "react-redux";
import { getParticularPetVisit } from "../../store/slices/visitSlice";
import { useParams } from "react-router-dom";
import CustomerNavbar from "../../component/CustomerNavbar";


const ViewAllVisits = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [visits, setVisits] = useState([]);
    const dispatch = useDispatch();
    const { petId } = useParams();
    useEffect(() => {

        const params = new URLSearchParams();
        params.append("petId", petId.trim());
        const queryString = params.toString();
        setIsLoading(true);
        console.log(petId);

        dispatch(getParticularPetVisit(queryString)).then((data) => {
            if (data?.payload?.success) {
                console.log(data?.payload?.List)
                setVisits(data?.payload?.List)
            } else {
                alert(data?.payload?.message)
            }
            setIsLoading(false)
        });

    }, []);


    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const formatPrice = (price) => {
        return `₹ ${price.toFixed(2)}`;
    };

    return (
        <>
            <CustomerNavbar />
            <div className="flex items-center justify-center ">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-full h-full max-h-full flex flex-col">
                    {/* Header */}
                    <div className="flex  items-center justify-between p-4 border-b">
                        <h2 className="text-xl font-semibold text-black">
                            Pet Visits
                        </h2>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-hidden">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center p-8 space-y-4">
                                <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent" style={{ borderColor: '#3E7B27', borderTopColor: 'transparent' }}></div>
                                <p className="text-sm" style={{ color: '#123524' }}>Loading visits...</p>
                            </div>
                        ) : (
                            <div className="p-4 overflow-y-auto h-full">
                                {visits.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p style={{ color: '#3E7B27' }}>No visits found</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {visits?.map((visit) => (
                                            <div
                                                key={visit?._id}
                                                className="rounded-lg p-4 border hover:shadow-md transition-shadow duration-200"
                                                style={{ backgroundColor: 'white', borderColor: '#85A947' }}
                                            >
                                                {/* Pet Name and Date - Top Row */}
                                                <div className="flex items-center justify-between mb-2">
                                                    <h3 className="font-semibold text-lg" style={{ color: '#123524' }}>
                                                        {visit?.pet?.name}
                                                    </h3>
                                                    <div className="flex items-center text-sm" style={{ color: '#3E7B27' }}>
                                                        <Calendar className="w-4 h-4 mr-1" />
                                                        {formatDate(visit?.createdAt)}
                                                    </div>
                                                </div>

                                                {/* Purpose and Price - Bottom Row */}
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm flex-1 mr-2" style={{ color: '#3E7B27' }}>
                                                        {visit?.visitType?.purpose}
                                                    </p>
                                                    <div className="flex items-center font-semibold" style={{ color: '#85A947' }}>
                                                        {formatPrice(visit?.details?.payment?.amount||0)}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default ViewAllVisits