import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 p-4">
      <div className="w-full max-w-md text-center">
        <h1 className="text-9xl font-bold text-indigo-600">404</h1>
        <div className="w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 my-6 rounded-full"></div>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist or you don't have permission
          to access it.
        </p>

        <Link to="/">
          <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-8 py-3 rounded-lg">
            Go back home
          </button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
