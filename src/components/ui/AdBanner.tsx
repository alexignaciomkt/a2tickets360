
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface AdBannerProps {
  imageUrl: string;
  title: string;
  subtitle: string;
  badge: string;
  cta: string;
  link?: string;
  variant?: 'premium' | 'dark' | 'glass';
}

const AdBanner = ({ imageUrl, title, subtitle, badge, cta, link, variant = 'premium' }: AdBannerProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="max-w-7xl mx-auto px-4 py-8"
    >
      <div className={`relative h-32 md:h-44 rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden group cursor-pointer shadow-2xl transition-all duration-700 border-4 border-white ${
        variant === 'dark' ? 'bg-slate-900' : 'bg-white'
      }`}>
        <img
          src={imageUrl}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110 opacity-40 grayscale-[0.5] group-hover:grayscale-0"
          alt={title}
        />
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-600/10 to-transparent pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-600/10 blur-[80px] rounded-full group-hover:bg-indigo-600/20 transition-all duration-1000" />

        <div className="absolute inset-0 flex items-center justify-between p-8 md:p-12">
          <div className="space-y-2 md:space-y-3 relative z-10">
            <div className="flex items-center gap-3">
              <span className={`text-[9px] font-black uppercase tracking-[0.3em] px-4 py-1.5 rounded-full shadow-lg ${
                variant === 'dark' ? 'bg-white/10 text-white' : 'bg-indigo-600 text-white'
              }`}>
                {badge}
              </span>
              <div className="w-8 h-px bg-current opacity-20" />
            </div>
            <h3 className={`text-xl md:text-3xl font-black tracking-tighter uppercase leading-none ${
              variant === 'dark' ? 'text-white' : 'text-slate-900'
            }`}>
              {title}
            </h3>
            <p className={`text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] opacity-60 ${
              variant === 'dark' ? 'text-slate-300' : 'text-slate-500'
            }`}>
              {subtitle}
            </p>
          </div>
          
          <Link 
            to={link || '#'} 
            className={`hidden sm:flex items-center justify-center px-10 py-4 rounded-full font-black text-[11px] uppercase tracking-[0.3em] transition-all duration-500 hover:scale-110 active:scale-95 shadow-2xl relative z-10 border-4 ${
              variant === 'dark' 
                ? 'bg-white text-slate-900 border-white/20' 
                : 'bg-slate-900 text-white border-slate-800'
            }`}
          >
            {cta}
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default AdBanner;
