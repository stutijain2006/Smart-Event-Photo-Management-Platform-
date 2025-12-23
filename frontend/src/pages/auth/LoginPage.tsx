import LoginForm from "../../components/auth/LoginForm";
import OmniportButton from "../../components/auth/OmniportButton";
import {useState} from "react";
import { useNavigate } from "react-router-dom";
import AppImage from "../../assets/app_image.png";
import Modal from "../../components/common/Modal";

export default function LoginPage(){
    const [showEmailLogin, setShowEmailLogin] = useState(false);
    const navigate = useNavigate();

    return(
        <div className="flex flex-col items-center justify-center gap-4 h-screen">
            <img src={AppImage} alt="App Image" className="w-[40vw] h-[60vh] m-8"/>
            <div className = "w-[30vw] px-4 py-2 border text-[1.2rem] bg-gray-300 border-black rounded-lg shadow-lg"> <OmniportButton /> </div>
            <button className = "w-[30vw] px-4 py-2 border text-[1.2rem] bg-gray-300 border-black rounded-lg shadow-lg" onClick={() => setShowEmailLogin(true)} > Login Via Email </button>

            <div className="text-[1rem] w-[30vw] px-4 py-2 border bg-gray-300 border-black rounded-lg shadow-lg mt-4" onClick={() => navigate("/register")}>New here ? Register </div>

            <Modal isOpen = {showEmailLogin} onClose = {() => setShowEmailLogin(false)}>
                <LoginForm />
            </Modal>
        </div>
    );
}