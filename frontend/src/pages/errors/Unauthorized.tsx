import { useNavigate } from "react-router-dom";

export default function Unauthorized() {
    const navigate = useNavigate();

    return(
        <div className="h-screen flex flex-col items-center justify-center gap-4">
            <h1 className="text-4xl font-bold">403 - Unauthorized</h1>
            <p className="text-lg">You do not have permission to access this page.</p>
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg" onClick={() => navigate(-1)}>Go Back</button>
        </div>
    );
}