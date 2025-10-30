import React from 'react';

export function TopBar() {
  return (
    <header className="flex items-center justify-end bg-white shadow px-0 py-4 mx-6">
      <button className="mx-2 text-gray-500 hover:text-blue-600"><span role="img" aria-label="bell">🔔</span></button>
      <select className="mx-2 bg-gray-100 rounded px-2 py-1 text-gray-700">
        <option>EN</option>
        <option>FR</option>
      </select>
      <img src="./avatar.jpg" alt="AD" className="w-8 h-8 rounded-full ml-4 border" />
    </header>
  );
}
