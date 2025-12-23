import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../app/hooks";
import api from "../../services/api";
import { fetchMe } from "../../features/auth/authslice";


export default function LoginForm() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const login = async () => {
        try{
            await api.post("/auth/login", { email_id : email, password });
            await dispatch(fetchMe());
            navigate("/dashboard");
        } catch (err: any) {
            const data = err.response?.data;
            if (data?.email_id) {
                alert(`Email Error: ${data.email_id.join(" ")}`);
            } else if (data?.password) {
                alert(`Password Error: ${data.password.join(" ")}`);
            } else {
                alert("Login failed. Please try again.");
            }
        }
    };

    return (
        <div className="flex flex-col justify-center items-center gap-4">
            <h2 className="text-[1.5rem] font-bold">Login</h2>
            <input type="email" placeholder="Email" value={email} className="text-[1rem] px-4 py-2 border border-black bg-grey-300 font-medium" onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Password" value={password} className="text-[1rem] px-4 py-2 border border-black bg-grey-300 font-medium" onChange={(e) => setPassword(e.target.value)} />
            <button onClick={login} className="text-[1rem] px-4 py-2 border border-black bg-grey-300 font-medium">Login</button>
        </div>
    );
}