import sys
import re

with open('src/pages/ProducerFanPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Dark Mode Colors
content = re.sub(r'bg-\\[#F8F9FA\\]', 'bg-zinc-950', content)
content = re.sub(r'text-gray-900', 'text-white', content)
content = re.sub(r'text-gray-600', 'text-zinc-300', content)
content = re.sub(r'text-gray-500', 'text-zinc-400', content)
content = re.sub(r'text-gray-400', 'text-zinc-500', content)
content = re.sub(r'border-gray-100', 'border-white/10', content)
content = re.sub(r'border-gray-200', 'border-white/5', content)
content = re.sub(r'bg-gray-100', 'bg-white/10', content)
content = re.sub(r'bg-gray-50', 'bg-white/5', content)
content = re.sub(r'bg-white', 'bg-zinc-900', content)

# 2. Add Imports
content = content.replace("Star\n} from 'lucide-react';", "Star,\n  Users,\n  Briefcase\n} from 'lucide-react';")

# 3. Add State
content = content.replace('const [loading, setLoading] = useState(true);', 'const [loading, setLoading] = useState(true);\n  const [showWorkModal, setShowWorkModal] = useState(false);')

# 4. Update Button (Trabalhe Conosco)
old_button = '''          <Button 
            variant="ghost" 
            size="sm" 
            className={`hidden md:flex font-black uppercase text-[10px] tracking-widest ${buttonStyle}`}
          >
            Trabalhe Conosco
          </Button>'''
new_button = '''          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowWorkModal(true)}
            className={`hidden md:flex font-black uppercase text-[10px] tracking-widest ${buttonStyle}`}
          >
            Trabalhe Conosco
          </Button>'''
content = content.replace(old_button, new_button)

# 5. Add Background Image to root
old_root = '<div className="bg-zinc-950 min-h-screen font-sans pt-16">'
new_root = '''<div className="bg-zinc-950 min-h-screen font-sans pt-16 relative">
      {/* Neon Ink Background */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none opacity-60 mix-blend-screen"
        style={{ 
          backgroundImage: 'url("/background site.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      />
      <div className="relative z-10">'''
content = content.replace(old_root, new_root)

# 6. Add Modal at the end
old_end = '''           </footer>
        </div>
      </div>
    </div>
  );
};'''
new_end = '''           </footer>
        </div>
      </div>

      {/* Work With Us Modal */}
      {showWorkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowWorkModal(false)} />
          <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8 max-w-2xl w-full relative z-10 animate-fade-in shadow-2xl">
            <button 
              onClick={() => setShowWorkModal(false)}
              className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
            
            <div className="text-center mb-8">
              <h3 className="text-2xl font-black uppercase tracking-tight text-white mb-2">Junte-se à nossa equipe</h3>
              <p className="text-zinc-400 font-medium text-sm">Escolha como você quer colaborar com nossos eventos.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link to="/promoter/about" className="group relative overflow-hidden rounded-2xl border-2 border-white/10 bg-zinc-900/5 hover:border-indigo-500 hover:bg-indigo-50 transition-all p-6 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-black uppercase tracking-widest text-white mb-2">Promoter</h4>
                <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">Seja recompensado por divulgar</p>
                <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs text-indigo-600 font-black uppercase tracking-widest flex items-center gap-1">Conheça o Programa <ChevronRight className="w-4 h-4" /></span>
                </div>
              </Link>

              <Link to="/work-with-us?role=staff" className="group relative overflow-hidden rounded-2xl border-2 border-white/10 bg-zinc-900/5 hover:border-purple-500 hover:bg-purple-50 transition-all p-6 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Briefcase className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-black uppercase tracking-widest text-white mb-2">Staff</h4>
                <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">Trabalhe na operação do evento</p>
                <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs text-purple-600 font-black uppercase tracking-widest flex items-center gap-1">Quero me Inscrever <ChevronRight className="w-4 h-4" /></span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};'''
content = content.replace(old_end, new_end)

with open('src/pages/ProducerFanPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Finished updates.")
