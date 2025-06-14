import React from "react";

const UserHome = () => {
  const username = localStorage.getItem("userName");

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-blue-100 to-indigo-200 py-10">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-4xl">
        <h2 className="text-3xl font-bold text-center text-indigo-700 mb-8">
          Witaj, {username}!
        </h2>

        <p className="text-center text-gray-700 text-lg">
          To jest strona użytkownika.
        </p>
      </div>
    </div>
  );
};

export default UserHome;
