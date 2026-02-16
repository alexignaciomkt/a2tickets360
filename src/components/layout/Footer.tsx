
import { Link } from 'react-router-dom';
import { Ticket, Facebook, Share2, Instagram, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-950 text-white py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-20">
          <div className="md:col-span-5 space-y-8">
            <Link to="/" className="flex items-center gap-2 text-indigo-500 font-black text-4xl tracking-tighter">
              <Ticket className="w-10 h-10" />
              <span>A2 Tickets 360</span>
            </Link>
            <p className="text-gray-400 text-xl font-medium leading-relaxed max-w-md">
              A revolução na gestão de eventos. Criamos tecnologia para que produtores foquem no que importa: a experiência do público.
            </p>
            <div className="flex gap-4">
              {[Facebook, Instagram, Twitter, Share2].map((Icon, i) => (
                <a key={i} href="#" className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-indigo-600 transition-all duration-300 group shadow-xl">
                  <Icon className="w-6 h-6 text-gray-400 group-hover:text-white" />
                </a>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            <h4 className="font-black uppercase tracking-widest text-sm text-indigo-500">Para Produtores</h4>
            <ul className="space-y-4 text-gray-400 font-bold">
              <li><Link to="/register?type=organizer" className="hover:text-white transition">Como começar</Link></li>
              <li><Link to="/organizer" className="hover:text-white transition">Painel ERP</Link></li>
              <li><Link to="/validador" className="text-indigo-400 hover:text-indigo-300 font-black flex items-center gap-2">
                Validador Pro <span className="text-[8px] bg-indigo-500/20 px-1 rounded">WEB</span>
              </Link></li>
              <li><a href="#" className="hover:text-white transition">Taxas e Repasses</a></li>
              <li><a href="#" className="hover:text-white transition">Central de Suporte</a></li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-6">
            <h4 className="font-black uppercase tracking-widest text-sm text-indigo-500">Legal</h4>
            <ul className="space-y-4 text-gray-400 font-bold">
              <li><a href="#" className="hover:text-white transition">Termos de Uso</a></li>
              <li><a href="#" className="hover:text-white transition">Privacidade</a></li>
              <li><a href="#" className="hover:text-white transition">Cookies</a></li>
              <li><a href="#" className="hover:text-white transition">Regulamentos</a></li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-6">
            <h4 className="font-black uppercase tracking-widest text-sm text-indigo-500">Instale o App</h4>
            <div className="space-y-4">
              <div className="bg-white/5 p-4 rounded-3xl border border-white/10 hover:border-white/20 transition cursor-pointer flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                  <Ticket className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-500">Disponível na</p>
                  <p className="font-black text-lg tracking-tight leading-none">App Store</p>
                </div>
              </div>
              <div className="bg-white/5 p-4 rounded-3xl border border-white/10 hover:border-white/20 transition cursor-pointer flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                  <Ticket className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-500">Disponível no</p>
                  <p className="font-black text-lg tracking-tight leading-none">Google Play</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-black uppercase tracking-widest text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} A2 Tickets 360. Todos os direitos reservados.
          </p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition">Status do Sistema</a>
            <a href="#" className="hover:text-white transition">Políticas Asaas</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
