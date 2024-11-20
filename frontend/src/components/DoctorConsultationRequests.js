import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DoctorConsultationStatus from './ConsultationStatusDoctor';

const DoctorConsultationRequests = () => {
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const fetchRequests = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await axios.get('http://localhost:5000/api/doctors/requests', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                if (response.data && response.data.length === 0) {
                    setError('No consultation requests available.');
                }
                setRequests(response.data);
            } catch (error) {
                console.error('Error fetching consultation requests:', error);
                setError('Failed to load consultation requests.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchRequests();
    }, []);

    // Filter out completed requests
    const activeRequests = requests.filter(request => request.status !== 'Completed');

    const formatTime = (timeString) => {
        const date = new Date(`1970-01-01T${timeString}Z`); 
        const hours = date.getUTCHours();
        const minutes = date.getUTCMinutes().toString().padStart(2, '0');
        const period = hours >= 12 ? 'PM' : 'AM';
        const formattedHour = hours % 12 || 12; 
        return `${formattedHour}:${minutes} ${period}`;
    };

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold text-teal-600 mb-4">Consultation Requests</h2>

            {isLoading ? (
                <p>Loading consultation requests...</p>
            ) : error ? (
                <p className="text-red-500">{error}</p>
            ) : activeRequests.length === 0 ? (
                <p>No consultation requests available.</p>
            ) : (
                <ul className="space-y-4">
                    {activeRequests.map((request) => {
                        let images = [];
                        try {
                            images = JSON.parse(request.imageUrl); 
                        } catch (error) {
                            console.error("Error parsing imageUrl:", error);
                            images = [];  
                        }

                        const handleNextImage = () => {
                            if (images.length > 1) {
                                setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
                            }
                        };

                        const handlePreviousImage = () => {
                            if (images.length > 1) {
                                setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
                            }
                        };

                        return (
                            <li key={request.id} className="flex bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden">
                                <div className="flex-1 p-4 flex flex-col justify-between">
                                    <h3 className="text-2xl font-semibold">{request.patientUsername}</h3>

                                    <p className="text-gray-600">
                                        <strong>Selected Date:</strong> {new Date(request.doctorAvailability.date).toLocaleDateString()} 
                                    </p>

                                    <p className="text-gray-600">
                                        <strong>Requested Time:</strong> {formatTime(request.selectedTimeSlot.startTime)} - {formatTime(request.selectedTimeSlot.endTime)}
                                    </p>

                                    <p className="text-gray-600"><strong>Status:</strong> {request.status}</p>
                                    <p className="text-gray-600"><strong>Reason:</strong> {request.reason}</p>
                                    <p className="text-gray-600"><strong>Description:</strong> {request.description}</p>

                                    <DoctorConsultationStatus
                                        status={request.status}
                                        requestId={request.id}
                                        setRequests={setRequests}
                                    />
                                </div>

                                {/* Right side: Image */}
                                {images.length > 0 && (
                                    <div className="relative w-1/3 flex items-center justify-center p-2">
                                        <img
                                            src={`http://localhost:5000/${images[currentImageIndex]}`}  
                                            alt="Consultation"
                                            className="w-full h-48 object-cover rounded-lg"     
                                        />
                                        {images.length > 1 && (
                                            <>
                                                <button 
                                                    onClick={handlePreviousImage}
                                                    className="absolute top-1/2 left-0 transform -translate-y-1/2 text-white text-3xl bg-black bg-opacity-50 p-2 rounded-full cursor-pointer"
                                                >
                                                    &lt;
                                                </button>
                                                <button 
                                                    onClick={handleNextImage}
                                                    className="absolute top-1/2 right-0 transform -translate-y-1/2 text-white text-3xl bg-black bg-opacity-50 p-2 rounded-full cursor-pointer"
                                                >
                                                    &gt;
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

export default DoctorConsultationRequests;
