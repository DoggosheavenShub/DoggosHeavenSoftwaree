import { Eye } from 'lucide-react';
import CustomerNavbar from '../../component/CustomerNavbar';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getPetByUserId } from '../../store/slices/petSlice';
import { useNavigate } from 'react-router-dom'

const PetVisitCard = ({
    petName = "Buddy",
    petBreed = "Golden Retriever",
    petId,
}) => {
    const navigate = useNavigate();
    return (
        <div
           
            className="border border-[#85A947] rounded-xl p-8 bg-white shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer hover:bg-gray-50 hover:border-[#3E7B27] transform hover:scale-105"
            onClick={()=>navigate(`/customer/viewpetvisit/${petId}`)}
        >
            {/* Pet Card */}

            <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-[#85A947] rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-3xl font-bold text-white">
                        {petName.charAt(0).toUpperCase()}
                    </span>
                </div>

                <h2 className="text-2xl font-bold text-[#123524] mb-3">
                    {petName}
                </h2>

                <p className="text-[#3E7B27] mb-2 text-lg">{petBreed}</p>

                {/* Subscription Summary */}
               
                <div className="mt-6 text-sm text-[#3E7B27] font-medium">
                    Click to view Visits
                </div>
            </div>
        </div>
    );
};


const PetVisitCardDemo = () => {

    const [pets, setPets] = useState([])

    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch()


    const handleViewAllVisits = (petName) => {
        alert(`Viewing all visits for ${petName}`);
    };

    useEffect(() => {
        console.log(user?.email)

        dispatch(getPetByUserId({ email: user?.email })).then((data) => {

            if (data?.payload?.success) {
                setPets(data?.payload?.pets)
            } else {
                console.log(data)
                alert("Failed to fetch pets")
            }
        })
    }, [])

    return (
        <>
            <CustomerNavbar />
            <div className="min-h-screen  p-4">
                <div className="container mx-auto">
                    <h1 className="text-4xl font-bold text-[#123524] text-center mb-8">
                        Choose Pet
                    </h1>

                    {/* Multiple cards responsive grid */}
                    <div className="mb-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {pets.map((pet, index) => (
                                <PetVisitCard
                                    key={index}
                                    petName={pet.name}
                                    petBreed={pet.breed}
                                    petId={pet._id}
                               
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PetVisitCardDemo;