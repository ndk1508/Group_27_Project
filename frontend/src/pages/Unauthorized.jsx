import React from 'react';
import { Link } from 'react-router-dom';

export default function Unauthorized() {
  return (
    <div className="container mt-5">
      <div className="text-center">
        <h1>403 - Unauthorized</h1>
        <p>Sorry, you don't have permission to access this page.</p>
        <Link to="/" className="btn btn-primary">
          Return to Home
        </Link>
      </div>
    </div>
  );
}