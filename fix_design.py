import sys

with open('src/pages/ProducerFanPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Background Glassmorphism
# Replace the current neon background div with a glassmorphism overlay
old_bg = '''      {/* Neon Ink Background */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none opacity-60 mix-blend-screen"
        style={{ 
          backgroundImage: 'url("/background site.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      />'''
new_bg = '''      {/* Neon Ink Background with Glassmorphism Overlay */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none mix-blend-screen opacity-70"
        style={{ 
          backgroundImage: 'url("/background site.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      />
      <div className="fixed inset-0 z-0 pointer-events-none bg-zinc-950/40 backdrop-blur-[50px]" />'''
content = content.replace(old_bg, new_bg)

# 2. Hero Banner (50px spacing on sides + 50% transparency overlay)
old_hero = '''      {/* ─── HERO & BRANDING ─── */}
      <div id="home" className={`max-w-[1400px] mx-auto relative overflow-hidden ${heroRounding} shadow-2xl bg-black ${isMinimal ? 'mt-8' : ''}`}>
        <img 
          src={producerData.banner_url || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80"} 
          className="w-full h-auto block" 
          alt="Cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      </div>'''

new_hero = '''      {/* ─── HERO & BRANDING ─── */}
      <div id="home" className={`max-w-[1400px] mx-auto px-[50px] relative z-10 ${isMinimal ? 'mt-8' : 'mt-6'}`}>
        <div className={`relative overflow-hidden ${heroRounding} shadow-[0_0_40px_rgba(0,0,0,0.5)] bg-black group`}>
          <img 
            src={producerData.banner_url || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80"} 
            className="w-full h-auto block transition-transform duration-1000 group-hover:scale-105" 
            alt="Cover" 
          />
          {/* 50% transparency overlay */}
          <div className="absolute inset-0 bg-black/50 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent pointer-events-none opacity-80" />
        </div>
      </div>'''
content = content.replace(old_hero, new_hero)

# 3. Sobre a Marca (Quem somos) Tab
# "aba quem somos estava dentro de um quadrad com bordas arredondads de 3px com preenchimento da bosrda em degradê seguindo a cor que o produtor escolheu. Tinha efeitos neon no hover"
old_sobre = '''          {/* SEÇÃO 3: SOBRE A MARCA */}
          <section id="sobre" className="grid grid-cols-1 md:grid-cols-12 gap-16 items-center">
            <div className="md:col-span-5 relative">
              <div className={`aspect-square ${buttonStyle} overflow-hidden shadow-2xl relative border-8 border-white`}>
                <img 
                  src={producerData.settings?.about_image || producerData.logo_url} 
                  className="w-full h-full object-cover" 
                  alt="Sobre"
                />
                <div className="absolute inset-0 bg-primary/5 mix-blend-overlay" style={{ backgroundColor: primaryColor }} />
              </div>
            </div>
            <div className="md:col-span-7 space-y-8 text-left">
              <div className="space-y-4">
                <Badge variant="outline" className="px-4 py-1.5 border-white/5 text-zinc-500 font-black uppercase tracking-widest text-[10px]">Nossa Identidade</Badge>
                <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white leading-tight">{producerData.settings?.titles?.about || 'A história por trás da produtora'}</h3>
              </div>
              <div 
                className="text-zinc-300 text-lg md:text-xl leading-relaxed font-medium prose prose-slate max-w-none prose-p:leading-relaxed prose-strong:text-white"
                dangerouslySetInnerHTML={{ 
                  __html: producerData.bio || "Esta produtora ainda não definiu sua biografia oficial, mas sua paixão por criar momentos inesquecíveis é o que nos move todos os dias." 
                }}
              />
              <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/10">
                <div className="space-y-1">
                  <p className="text-3xl font-black text-white">{producerEvents.length}+</p>
                  <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Eventos Realizados</p>
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-black text-white">100%</p>
                  <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Satisfação Garantida</p>
                </div>
              </div>
            </div>
          </section>'''

new_sobre = '''          {/* SEÇÃO 3: SOBRE A MARCA */}
          <section id="sobre" className="relative group transition-all duration-500 rounded-[3px] p-[1px] mx-4 md:mx-0">
            {/* Gradient Border matched to producer primary color */}
            <div className="absolute inset-0 rounded-[3px] bg-gradient-to-br opacity-50 group-hover:opacity-100 transition-opacity duration-500" style={{ backgroundImage: `linear-gradient(to bottom right, ${primaryColor}, transparent, ${primaryColor}40)` }} />
            
            {/* Inner Content with Glassmorphism and Neon Hover */}
            <div 
              className="relative rounded-[2px] bg-zinc-950/80 backdrop-blur-xl p-8 md:p-12 transition-all duration-500"
              style={{ boxShadow: `0 0 0 rgba(0,0,0,0)` }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = `0 0 30px ${primaryColor}40`}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = `0 0 0 rgba(0,0,0,0)`}
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-16 items-center">
                <div className="md:col-span-5 relative">
                  <div className={`aspect-square rounded-[3px] overflow-hidden shadow-2xl relative border-2 border-white/5`}>
                    <img 
                      src={producerData.settings?.about_image || producerData.logo_url} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                      alt="Sobre"
                    />
                    <div className="absolute inset-0 mix-blend-overlay opacity-30" style={{ backgroundColor: primaryColor }} />
                  </div>
                </div>
                <div className="md:col-span-7 space-y-8 text-left">
                  <div className="space-y-4">
                    <Badge variant="outline" className="px-4 py-1.5 border-white/5 text-zinc-400 font-black uppercase tracking-widest text-[10px] bg-zinc-900/50 backdrop-blur-sm">Quem Somos</Badge>
                    <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white leading-tight">{producerData.settings?.titles?.about || 'A história por trás da produtora'}</h3>
                  </div>
                  <div 
                    className="text-zinc-300 text-lg leading-relaxed font-medium prose prose-slate max-w-none prose-p:leading-relaxed prose-strong:text-white"
                    dangerouslySetInnerHTML={{ 
                      __html: producerData.bio || "Esta produtora ainda não definiu sua biografia oficial, mas sua paixão por criar momentos inesquecíveis é o que nos move todos os dias." 
                    }}
                  />
                  <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/10">
                    <div className="space-y-1">
                      <p className="text-3xl font-black text-white">{producerEvents.length}+</p>
                      <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Eventos Realizados</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-3xl font-black text-white">100%</p>
                      <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Satisfação Garantida</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>'''
content = content.replace(old_sobre, new_sobre)

# Make sure to replace any leftover "bg-white" in About section border that might have survived the global replace
content = content.replace('border-8 border-white', 'border-4 border-white/10')


with open('src/pages/ProducerFanPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Applied exact design requested by user.")
