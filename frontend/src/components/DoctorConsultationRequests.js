import React, { useEffect, useState } from 'react';
import axios from 'axios';

const DoctorConsultationRequests = () => {
    const [requests, setRequests] = useState([]);
    const [newDateTime, setNewDateTime] = useState(null); 
    const [updatingId, setUpdatingId] = useState(null); 

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/doctors/requests', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setRequests(response.data);
            } catch (error) {
                console.error('Error fetching consultation requests:', error);
            }
        };

        fetchRequests();
    }, []);

    const updateStatus = async (requestId, newStatus, newDateTime) => {
        console.log('Updating status for ID:', requestId, 'New Status:', newStatus, 'New DateTime:', newDateTime);

        try {
            await axios.put(`http://localhost:5000/api/doctors/requests/${requestId}/status`, { status: newStatus, newDateTime }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            setRequests((prevRequests) =>
                prevRequests.map((req) => 
                    req.id === requestId ? { ...req, status: newStatus, dateTime: newDateTime || req.dateTime } : req
                )
            );
            alert('Status updated successfully!');
            setUpdatingId(null); 
            setNewDateTime(null); 
        } catch (error) {
            console.error('Error updating status:', error);
            alert(`Failed to update status: ${error.response ? error.response.data.error : error.message}`);
        }
    };

    const handleChangeTime = (requestId) => {
        setUpdatingId(requestId); 
    };

    const handleDateChange = (event) => {
        setNewDateTime(event.target.value); 
    };

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Consultation Requests</h2>
            {requests.length === 0 ? (
                <p>No consultation requests available.</p>
            ) : (
                <ul className="space-y-4">
                    {requests.map(request => (
                        <li key={request.id} className="flex bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden">
                            {request.imageUrl && (
                                <img 
                                    src={request.imageUrl} 
                                    alt="Consultation"
                                    className="w-1/3 h-auto object-cover" 
                                />
                            )}
                            <div className="flex-1 p-4">
                                <h3 className="text-lg font-semibold">{request.patientUsername}</h3>
                                <p className="text-gray-600">Requested Time: {request.dateTime ? new Date(request.dateTime).toLocaleString() : 'N/A'}</p>
                                <p className="text-gray-600">Status: {request.status}</p>

                                {/* Display reason and description */}
                                <p className="text-gray-600 mt-2"><strong>Reason:</strong> {request.reason}</p>
                                <p className="text-gray-600"><strong>Description:</strong> {request.description}</p>
                                
                                {request.status === 'Accepted' && updatingId === request.id && (
                                    <div className="mt-2">
                                        <input 
                                            type="datetime-local" 
                                            value={newDateTime || ''}
                                            onChange={handleDateChange}
                                            className="border rounded p-1"
                                        />
                                        <button 
                                            onClick={() => updateStatus(request.id, 'Accepted', newDateTime)}
                                            className="ml-2 p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                        >
                                            Save Time
                                        </button>
                                    </div>
                                )}
                                
                                <div className="mt-4">
                                    {request.status === 'pending' && (
                                        <>
                                            <button 
                                                onClick={() => updateStatus(request.id, 'Accepted')}
                                                className="mr-2 p-2 bg-green-500 text-white rounded hover:bg-green-600"
                                            >
                                                Accept
                                            </button>
                                            <button 
                                                onClick={() => updateStatus(request.id, 'Rejected')}
                                                className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
                                            >
                                                Reject
                                            </button>
                                        </>
                                    )}
                                    {request.status === 'Accepted' && (
                                        <>
                                            <button 
                                                onClick={() => handleChangeTime(request.id)}
                                                className="mr-2 p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                                            >
                                                Change Time
                                            </button>
                                            <button 
                                                onClick={() => updateStatus(request.id, 'Confirmed')}
                                                className="mr-2 p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                            >
                                                Confirm
                                            </button>
                                        </>
                                    )}
                                    {request.status === 'Confirmed' && (
                                        <button 
                                            onClick={() => updateStatus(request.id, 'Completed')}
                                            className="p-2 bg-blue-700 text-white rounded hover:bg-blue-800"
                                        >
                                            Complete
                                        </button>
                                    )}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default DoctorConsultationRequests;
