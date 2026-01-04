import api from '../../services/api';
import React from 'react';

export default function OmniportButton() {
    const handleOmniportLogin = async () => {
        try {
            window.location.href = "http://127.0.0.1:8000/api/auth/omniport-login-url";
        } catch (error) {
            console.error('Error fetching Omniport login URL:', error);
        }
    };

    return(
        <button onClick={handleOmniportLogin}>
            Login with Omniport
        </button>
    )
}