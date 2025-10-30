import React from 'react';

export function SideNav() {
  return (
    <nav className="w-64 bg-white shadow-lg flex flex-col py-6">
      <div className="px-6 mb-8 font-bold text-xl text-blue-600">TalentFlow</div>
      <ul className="space-y-2 px-6">
        {['Dashboard', 'Jobs', 'Candidates', 'Assessments', 'Reports', 'Settings'].map(item => (
          <li key={item} className="py-2 px-3 rounded hover:bg-blue-50 cursor-pointer font-medium text-gray-700">{item}</li>
        ))}
      </ul>
    </nav>
  );
}
