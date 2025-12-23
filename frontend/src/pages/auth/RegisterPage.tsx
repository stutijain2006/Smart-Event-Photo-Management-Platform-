import Register from "../../components/auth/RegisterEmailForm";
import OmniportButton from "../../components/auth/OmniportButton";
import Modal from "../../components/common/Modal";
import AppImage from "../../assets/app_image.png";
import {useState} from "react";
import { useNavigate } from "react-router-dom";

export default function RegisterPage(){
    const [showEmailForm, setShowEmailForm] = useState(false);
    const navigate = useNavigate();

    return(
        <div className="flex flex-col items-center justify-center gap-4 h-screen">
            <img src={AppImage} alt="App Image" className="w-[40vw] h-[60vh] m-8"/>
            <div  className = "w-[30vw] px-4 py-2 border text-[1.2rem] bg-gray-300 border-black rounded-lg shadow-lg"> <OmniportButton /> </div>
            <button className = "w-[30vw] px-4 py-2 border text-[1.2rem] bg-gray-300 border-black rounded-lg shadow-lg" onClick={() => setShowEmailForm(true)}> Register Via Email </button>
            <button className = "w-[30vw] px-4 py-2 border text-[1rem] bg-gray-300 border-black rounded-lg shadow-lg mt-4" onClick={ () => navigate('/login')}> Already an user, Login here </button>

            <Modal isOpen = {showEmailForm} onClose = {() => setShowEmailForm(false)}>
                <Register />
            </Modal>
        </div>
    )
}