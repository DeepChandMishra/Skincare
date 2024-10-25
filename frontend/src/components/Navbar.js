import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ token, setToken, role }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('patientId');
        localStorage.removeItem('role'); 
        setToken(null);
        navigate('/login'); 
    };

    return (
        <nav className="flex items-center justify-between bg-white p-4 shadow mb-4">
            <div className="flex items-center space-x-4">
                <Link to="/" className="text-blue-500 hover:text-blue-700 font-bold">Home</Link>
                {token ? (
                    <>
                        {role === 'patient' && (
                            <>
                                <Link to="/doctors" className="text-blue-500 hover:text-blue-700">Find Doctors</Link>
                                <Link to="/status" className="text-blue-500 hover:text-blue-700">Consultation Status</Link>
                            </>
                        )}
                        {role === 'doctor' && (
                            <>
                                <Link to="/doctor-requests" className="text-blue-500 hover:text-blue-700">Consultation Requests</Link>
                            </>
                        )}
                        <button 
                            onClick={handleLogout} 
                            className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition duration-200"
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="text-blue-500 hover:text-blue-700">Login</Link>
                        <Link to="/register" className="text-blue-500 hover:text-blue-700">Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
