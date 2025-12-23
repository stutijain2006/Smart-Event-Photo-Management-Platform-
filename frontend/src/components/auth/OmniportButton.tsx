import api from '../../services/api';
import React from 'react';

export default function OmniportButton() {
    const handleOmniportLogin = async () => {
        try {
            const response = await api.get('/auth/omniport-login-url');
            window.location.href = response.data.authorize_url;
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