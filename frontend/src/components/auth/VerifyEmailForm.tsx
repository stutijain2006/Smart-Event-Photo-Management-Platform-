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
            await api.post("auth/verify-email", {
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
        <div className="flex flex-col justify-center items-center gap-4">
            <h2>Verify Email</h2>
            <input type="text" placeholder="OTP" value={otp} onChange={(e) => setOtp(e.target.value)}/>
            <button onClick={handleSubmit}>Verify</button>
            {error && <p className="text-red-500">{error}</p>}
        </div>
    );
}
