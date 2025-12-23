import React, { useEffect } from 'react';
import api from "../../services/api";
import { useNavigate, useLocation } from 'react-router-dom';

export default function VerifyEmailForm() {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || "";
    const [otp, setOtp] = React.useState("");
    const [error, setError] = React.useState("");

    const handleSubmit = async() => {
        try{
            await api.post("/auth/verify-email", {
                email_id : email,
                otp
            });
            alert("Email verified successfully");
            navigate("/login");
        } catch (err: any){
            setError(err.response?.data?.message || "Verification failed");    
        }
    };

    return(
        <div className="flex flex-col justify-center items-center gap-4 w-[50vw] h-[50vh] border border-black rounded-lg shadow-lg p-8">
            <h2 className='text-[1.2rem] font-bold'>Verify Email</h2>
            <input className='w-[30vw] px-4 py-2 border text-[1rem] bg-gray-300 border-black rounded-lg shadow-lg' type="text" placeholder="OTP" value={otp} onChange={(e) => setOtp(e.target.value)}/>
            <button className='w-[30vw] px-4 py-2 border text-[1rem] bg-gray-300 border-black rounded-lg shadow-lg' onClick={handleSubmit}>Verify</button>
            {error && <p className="text-red-500 text-[0.8rem] ">{error}</p>}
        </div>
    );
}
