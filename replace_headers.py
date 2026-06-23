import sys

with open('src/pages/promoter/PromoterLP.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Hero Title
old_h1 = '''          <motion.h1 
            {...fadeIn}
            className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight max-w-5xl leading-[0.9]"
          >
            Transforme sua influência em <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">Dinheiro Vivo</span>
          </motion.h1>'''
new_h1 = '''          <motion.h1 
            {...fadeIn}
            className="flex flex-col items-center justify-center font-black uppercase max-w-5xl text-center"
          >
            <span className="text-2xl md:text-4xl text-zinc-300 tracking-widest mb-2">Transforme sua influência em</span>
            <span className="text-6xl md:text-8xl lg:text-[10rem] text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500 tracking-tight leading-none">Dinheiro Vivo</span>
          </motion.h1>'''
content = content.replace(old_h1, new_h1)

# 2. How it works
old_h2_1 = '''<h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-4">A Lógica é <span className="text-indigo-400">Simples</span></h2>'''
new_h2_1 = '''<h2 className="flex flex-col items-center mb-4 font-black uppercase">
                <span className="text-xl md:text-3xl text-zinc-400 tracking-widest mb-2">A Lógica é</span>
                <span className="text-5xl md:text-7xl text-indigo-400 tracking-tight leading-none">Simples</span>
              </h2>'''
content = content.replace(old_h2_1, new_h2_1)

# 3. The Dashboard
old_h2_2 = '''<h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight leading-[1.1]">
                O Controle <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">Na Palma da Mão</span>
              </h2>'''
new_h2_2 = '''<h2 className="flex flex-col items-start font-black uppercase mb-4">
                <span className="text-xl md:text-3xl text-zinc-400 tracking-widest mb-2">O Controle</span>
                <span className="text-5xl md:text-7xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400 tracking-tight leading-[1.1]">Na Palma da Mão</span>
              </h2>'''
content = content.replace(old_h2_2, new_h2_2)

# 4. Tips for success
old_h2_3 = '''<h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-4">Dicas de <span className="text-emerald-400">Sucesso</span></h2>'''
new_h2_3 = '''<h2 className="flex flex-col items-center mb-4 font-black uppercase">
                <span className="text-xl md:text-3xl text-zinc-400 tracking-widest mb-2">Dicas de</span>
                <span className="text-5xl md:text-7xl text-emerald-400 tracking-tight leading-none">Sucesso</span>
              </h2>'''
content = content.replace(old_h2_3, new_h2_3)

# 5. Final CTA
old_h2_4 = '''<h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-[0.9]">
              Pronto para fazer <br/> a festa e <span className="text-indigo-400">lucrar</span>?
            </h2>'''
new_h2_4 = '''<h2 className="flex flex-col items-center font-black uppercase">
              <span className="text-xl md:text-3xl text-zinc-400 tracking-widest mb-2 text-center">Pronto para fazer a festa e</span>
              <span className="text-6xl md:text-8xl lg:text-9xl text-indigo-400 tracking-tight leading-none">Lucrar?</span>
            </h2>'''
content = content.replace(old_h2_4, new_h2_4)

with open('src/pages/promoter/PromoterLP.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Finished replacing headers logic.")
