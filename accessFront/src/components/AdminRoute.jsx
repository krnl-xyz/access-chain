import React from 'react';

const AdminRoute = ({ children }) => {
    console.log("AdminRoute - Always allowing access");
    return children;
};

export default AdminRoute; 