import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '@/services/api';
import { MapPin, User, AlertCircle, FileText, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface StaffProfileData {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  city: string | null;
  state: string | null;
  bio: string | null;
  functions: { id: string; name: string }[];
  events: {
    eventId: string;
    title: string;
    bannerUrl: string | null;
    startDate: string | null;
    city: string | null;
    state: string | null;
  }[];
}

const PublicStaffProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<StaffProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/api/public/staff-profiles/${id}`);
        setProfile(data);
      } catch (err: any) {
        if (err.response?.status === 404) {
          setError('Perfil indisponível ou não encontrado.');
        } else {
          setError('Erro ao carregar o perfil.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex justify-center">
        <div className="max-w-2xl w-full space-y-6">
          <Skeleton className="h-48 w-full rounded-3xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-center text-center">
        <AlertCircle className="w-16 h-16 text-slate-400 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Perfil Indisponível</h2>
        <p className="text-slate-500 max-w-md">
          {error || 'Não foi possível carregar as informações deste perfil.'}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 md:py-12 py-6 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header / Hero */}
        <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden">
          {/* Decorative background blob */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
          
          <div className="relative z-10 shrink-0">
            {profile.avatarUrl ? (
              <img 
                src={profile.avatarUrl} 
                alt={profile.fullName} 
                className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-slate-100 border-4 border-white shadow-lg flex items-center justify-center text-slate-400">
                <User className="w-12 h-12" />
              </div>
            )}
          </div>
          
          <div className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left flex-1 space-y-4">
            <div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-tight">
                {profile.fullName}
              </h1>
              {(profile.city || profile.state) && (
                <div className="flex items-center justify-center md:justify-start gap-1 text-slate-500 mt-2">
                  <MapPin className="w-4 h-4" />
                  <span className="font-medium text-sm">
                    {[profile.city, profile.state].filter(Boolean).join(' - ')}
                  </span>
                </div>
              )}
            </div>
            
            {profile.functions && profile.functions.length > 0 && (
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-2">
                {profile.functions.map(f => (
                  <Badge key={f.id} variant="secondary" className="px-3 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-full font-bold uppercase tracking-wider text-[10px]">
                    {f.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Sobre */}
        {profile.bio && (
          <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-500" />
              Sobre mim
            </h2>
            <div className="text-slate-600 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
              {profile.bio}
            </div>
          </section>
        )}

        {/* Experiência */}
        {profile.events && profile.events.length > 0 && (
          <section>
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest mb-6 px-2 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-500" />
              Experiência em Eventos
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {profile.events.map(event => (
                <div key={event.eventId} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 group hover:shadow-md transition-all">
                  <div className="h-32 bg-slate-200 relative">
                    {event.bannerUrl ? (
                      <img src={event.bannerUrl} alt={event.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300">
                        <Calendar className="w-8 h-8" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-3 left-4 right-4">
                      <h3 className="text-white font-bold text-lg leading-tight line-clamp-1">{event.title}</h3>
                    </div>
                  </div>
                  <div className="p-4 bg-white space-y-2">
                    {event.startDate && (
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(event.startDate).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                    {(event.city || event.state) && (
                      <p className="text-xs text-slate-400 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        {[event.city, event.state].filter(Boolean).join(' - ')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
        
      </div>
    </div>
  );
};

export default PublicStaffProfile;
