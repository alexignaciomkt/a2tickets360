import React from 'react';
import { Palette, QrCode, Layout, Type, Image as ImageIcon } from 'lucide-react';

const OrganizerTicketDesignerTab = ({ eventId }: { eventId: string }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Designer do Ingresso</h3>
            <p className="text-sm text-gray-500 font-medium">Personalize a experiência visual que seu cliente terá ao abrir o ingresso.</p>
          </div>
          <button className="bg-gray-900 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary transition-all">
            Salvar Layout
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Editor Sidebar */}
          <div className="space-y-6">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Cores do Layout</label>
              <div className="flex gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gray-900 border-2 border-primary cursor-pointer shadow-lg"></div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 cursor-pointer hover:scale-105 transition-transform"></div>
                <div className="w-12 h-12 rounded-2xl bg-rose-500 cursor-pointer hover:scale-105 transition-transform"></div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 cursor-pointer hover:scale-105 transition-transform"></div>
                <div className="w-12 h-12 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-50">
                  <Plus className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <button className="flex flex-col items-center justify-center gap-3 p-6 rounded-3xl border-2 border-gray-100 hover:border-primary hover:bg-primary/5 transition-all group">
                  <ImageIcon className="w-6 h-6 text-gray-400 group-hover:text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-900">Background</span>
               </button>
               <button className="flex flex-col items-center justify-center gap-3 p-6 rounded-3xl border-2 border-gray-100 hover:border-primary hover:bg-primary/5 transition-all group">
                  <Type className="w-6 h-6 text-gray-400 group-hover:text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-900">Tipografia</span>
               </button>
               <button className="flex flex-col items-center justify-center gap-3 p-6 rounded-3xl border-2 border-gray-100 hover:border-primary hover:bg-primary/5 transition-all group">
                  <QrCode className="w-6 h-6 text-gray-400 group-hover:text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-900">QR Code Style</span>
               </button>
               <button className="flex flex-col items-center justify-center gap-3 p-6 rounded-3xl border-2 border-gray-100 hover:border-primary hover:bg-primary/5 transition-all group">
                  <Layout className="h-6 w-6 text-gray-400 group-hover:text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-900">Campos Extra</span>
               </button>
            </div>
          </div>

          {/* Ticket Preview */}
          <div className="flex justify-center items-center bg-gray-50 rounded-[40px] p-12 border border-gray-100">
             <div className="w-[320px] bg-white rounded-[32px] shadow-2xl overflow-hidden border border-gray-100 transform rotate-1 hover:rotate-0 transition-transform duration-500">
                <div className="h-48 bg-gray-900 relative">
                   <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
                   <div className="absolute bottom-6 left-6">
                      <h4 className="text-white text-xl font-black uppercase tracking-tighter leading-none">Simpósio de Fotografia</h4>
                      <p className="text-primary text-[10px] font-black uppercase tracking-widest mt-1">Ingresso VIP</p>
                   </div>
                </div>
                <div className="p-8 space-y-6">
                   <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Participante</p>
                      <p className="text-sm font-bold text-gray-900 uppercase">Kathy Rodrigues</p>
                   </div>
                   <div className="flex justify-between items-end border-t border-dashed border-gray-200 pt-6">
                      <div className="space-y-1">
                         <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Data e Hora</p>
                         <p className="text-xs font-bold text-gray-900">20 de ABR, 2026</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-2xl">
                         <QrCode className="w-12 h-12 text-gray-900" />
                      </div>
                   </div>
                </div>
                <div className="bg-gray-900 py-3 text-center">
                   <p className="text-white/30 text-[8px] font-black uppercase tracking-[0.4em]">A2 TICKETS PLATFORM</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizerTicketDesignerTab;

import { Plus } from 'lucide-react';
