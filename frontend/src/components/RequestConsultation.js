import React, { useState } from 'react';
import axios from 'axios';

const RequestConsultation = ({ patientId, doctorId, onClose }) => {
    const [dateTime, setDateTime] = useState('');
    const [image, setImage] = useState(null);
    const [imageUrl, setImageUrl] = useState(null);
    const [reason, setReason] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('patientId', patientId);
        formData.append('doctorId', doctorId);
        formData.append('dateTime', dateTime);
        formData.append('reason', reason);
        formData.append('description', description);
        formData.append('image', image);

        try {
            await axios.post('http://localhost:5000/api/consultations/request', formData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            alert('Consultation requested successfully!');
            onClose();
        } catch (error) {
            console.error('Error requesting consultation:', error);
            alert('Failed to request consultation. Please try again.');
        }
    };

    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
        setImageUrl(URL.createObjectURL(e.target.files[0])); 
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-700 bg-opacity-50">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-lg font-semibold mb-4">Request a Consultation</h2>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1" htmlFor="dateTime">Date & Time:</label>
                    <input
                        id="dateTime"
                        type="datetime-local"
                        value={dateTime}
                        onChange={(e) => setDateTime(e.target.value)}
                        required
                        className="p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 w-full" 
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1" htmlFor="reason">Reason for Consultation:</label>
                    <input
                        id="reason"
                        type="text"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        required
                        className="p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 w-full" 
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1" htmlFor="description">Description:</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        className="p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 w-full" 
                        rows="4"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1" htmlFor="image">Upload Image:</label>
                    <input
                        id="image"
                        type="file"
                        onChange={handleImageChange}
                        required
                        className="w-full text-gray-500"
                    />
                    {imageUrl && <img src={imageUrl} alt="Preview" className="mt-2 w-full h-48 object-cover rounded" />}
                </div>
                <button 
                    type="submit" 
                    className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200"
                >
                    Request Consultation
                </button>
                <button 
                    type="button" 
                    onClick={onClose}
                    className="mt-4 w-full p-2 bg-red-500 text-white rounded hover:bg-red-600 transition duration-200"
                >
                    Cancel
                </button>
            </form>
        </div>
    );
};

export default RequestConsultation;
