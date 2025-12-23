import React, {useState} from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async() => {
        try{
            await api.post("/auth/register", {
                person_name : name,
                email_id : email,
                password
            });
        }catch(error: any){
            const data = error.response?.data;
            if (data?.password) {
                alert(`Password Error: ${data.password.join(" ")}`);
            }else if (data?.email_id) {
                alert(`Email Error: ${data.email_id.join(" ")}`);
            }else if (data?.person_name) {
                alert(`Name Error: ${data.person_name.join(" ")}`);
            }else{
                alert("Registration failed. Please try again.");
            }
            return;
        }
        navigate("/verify-email", {state: {email}});
    }

    return (
        <div className="flex flex-col justify-center items-center gap-4">
            <h2>Register</h2>
            <input type="text" placeholder="Name" value={name} className="text-[1rem] px-4 py-2 border border-black bg-grey-300 font-medium" onChange={(e) => setName(e.target.value)}/>
            <input type="email" placeholder="Email" value={email} className="text-[1rem] px-4 py-2 border border-black bg-grey-300 font-medium" onChange={(e) => setEmail(e.target.value)}/>
            <input type="password" placeholder="Password" value={password} className="text-[1rem] px-4 py-2 border border-black bg-grey-300 font-medium" onChange={(e) => setPassword(e.target.value)}/>
            <button className="text-[1rem] px-4 py-2 border border-black bg-grey-300 font-medium" onClick={handleSubmit}>Register</button>
        </div>
    )
};