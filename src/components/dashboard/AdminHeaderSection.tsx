
import React from 'react';

interface AdminHeaderSectionProps {
  title: string;
  subtitle: string;
  photoUrl?: string;
  userName?: string;
}

const AdminHeaderSection = ({ 
  title, 
  subtitle, 
  photoUrl, 
  userName 
}: AdminHeaderSectionProps) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-gray-600 mt-1">
          {subtitle} {userName || ''}
        </p>
      </div>
      {photoUrl && (
        <img 
          src={photoUrl} 
          alt={userName || 'Admin'}
          className="w-16 h-16 rounded-full border-4 border-primary"
        />
      )}
    </div>
  );
};

export default AdminHeaderSection;
