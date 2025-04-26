import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Landing = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-extrabold text-gray-900">
          Welcome to NotesHelp
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Your one-stop platform for study notes and exam papers
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {user ? (
            <div className="space-y-4">
              <p className="text-center text-gray-700">
                Welcome back, {user.name}!
              </p>
              <div className="flex flex-col space-y-2">
                <Link
                  to="/dashboard"
                  className="btn-primary text-center"
                >
                  Go to Dashboard
                </Link>
                <Link
                  to="/upload"
                  className="btn-secondary text-center"
                >
                  Upload New Document
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-center text-gray-700">
                Get started by creating an account or signing in
              </p>
              <div className="flex flex-col space-y-2">
                <Link
                  to="/register"
                  className="btn-primary text-center"
                >
                  Sign Up
                </Link>
                <Link
                  to="/login"
                  className="btn-secondary text-center"
                >
                  Sign In
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Landing; 