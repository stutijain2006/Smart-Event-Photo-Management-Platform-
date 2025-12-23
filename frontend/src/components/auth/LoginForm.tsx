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
            setError(err.response?.data?.message || "Login failed");
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button onClick={login}>Login</button>
            {error && <p className="text-red-500">{error}</p>}
        </div>
    );
}