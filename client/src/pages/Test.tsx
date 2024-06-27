import React, { useState } from 'react';

const Test: React.FC = () => {
    const backendSocialUrl = import.meta.env.VITE_BACKEND_SOCIAL_URL;

    // Log the environment variable
    console.log('VITE_BACKEND_SOCIAL_URL:', backendSocialUrl);
    return (
        <div>

        </div>
    );
};

export default Test;
