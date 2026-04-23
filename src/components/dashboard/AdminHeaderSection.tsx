
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
    <div className="flex justify-between items-center py-6">
      <div className="space-y-1">
        <h1 className="text-lg md:text-xl font-black uppercase tracking-tighter text-slate-900 leading-none">{title}</h1>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
          {subtitle} <span className="text-indigo-600">{userName || ''}</span>
        </p>
      </div>
      {photoUrl && (
        <div className="relative group">
          <img 
            src={photoUrl} 
            alt={userName || 'Admin'}
            className="w-12 h-12 rounded-full border-2 border-indigo-600 object-cover shadow-xl shadow-indigo-100 group-hover:scale-105 transition-transform"
          />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
        </div>
      )}
    </div>
  );
};

export default AdminHeaderSection;
