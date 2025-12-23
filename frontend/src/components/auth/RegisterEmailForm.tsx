import React, {useState} from "react";
import api from "../../services/api";

export default function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async() => {
        await api.post("/auth/register", {
            person_name : name,
            email_id : email,
            password
        });
        alert ("OTP sent to your email");
    }

    return (
        <div className="flex flex-col justify-center items-center gap-4">
            <h2>Register</h2>
            <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)}/>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}/>
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}/>
            <button onClick={handleSubmit}>Register</button>
        </div>
    )
};