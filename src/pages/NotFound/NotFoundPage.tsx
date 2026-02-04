import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="text-center p-8">
      <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
      <p className="mt-4">The page you are looking for does not exist.</p>
      <Link to="/" className="mt-8 inline-block bg-primary text-white px-6 py-2 rounded-lg">Go Home</Link>
    </div>
  );
};

export default NotFoundPage;
