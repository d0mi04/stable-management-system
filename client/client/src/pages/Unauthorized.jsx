import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
    return (
        <div style={{
            padding: '40px',
            textAlign: 'center'
        }}>
            <h2>No access! 🔒</h2>
            <p>You have no permission to access this resource.</p>
            <Link to="/login">Back to the home page.</Link>
        </div>
    );
};

export default Unauthorized;