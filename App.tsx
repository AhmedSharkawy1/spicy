
import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import MenuSection from './components/MenuSection';
import { MENU_DATA, ADDITIONS_DATA } from './constants';

const SpicyLogo = ({ size = "w-20 h-20" }: { size?: string }) => (
  <div className={`${size} relative flex items-center justify-center overflow-hidden rounded-full border-4 border-[#e31e24] shadow-2xl bg-white mb-4 transform hover:rotate-6 transition-all duration-500 hover:scale-110`}>
    <img 
      src="https://i.postimg.cc/G2mXpXG0/image.png" 
      alt="Spicy Logo" 
      className="w-full h-full object-contain p-2"
    />
  </div>
);

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('');
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return true;
  });
  
  const navRef = useRef<HTMLDivElement>(null);
  const isScrollingToRef = useRef<boolean>(false);
  const [showBottomCallMenu, setShowBottomCallMenu] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const STICKY_OFFSET = 80;

  const triggerHaptic = (pattern: number | number[] = 10) => {
    if (typeof window !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };

  useEffect(() => {
    setCurrentUrl(window.location.href);
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const checkScroll = () => {
    if (navRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = navRef.current;
      const isAtStart = Math.abs(scrollLeft) < 15;
      const isAtEnd = Math.abs(scrollLeft) + clientWidth >= scrollWidth - 15;
      
      setCanScrollRight(!isAtStart);
      setCanScrollLeft(!isAtEnd);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (isScrollingToRef.current) return;
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          setActiveSection(id);
          if (navRef.current) {
            const navItem = navRef.current.querySelector(`[data-id="${id}"]`) as HTMLElement;
            if (navItem) {
              const container = navRef.current;
              const scrollTarget = navItem.offsetLeft - (container.offsetWidth / 2) + (navItem.offsetWidth / 2);
              container.scrollTo({ left: scrollTarget, behavior: 'smooth' });
            }
          }
        }
      });
    }, { rootMargin: '-80px 0px -40% 0px' });

    MENU_DATA.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    const addEl = document.getElementById('additions');
    if (addEl) observer.observe(addEl);

    return () => observer.disconnect();
  }, []);

  const handleNavClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    triggerHaptic(15);
    const target = document.getElementById(id);
    if (target) {
      isScrollingToRef.current = true;
      const offsetPosition = target.getBoundingClientRect().top + window.pageYOffset - STICKY_OFFSET;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      setActiveSection(id);
      setTimeout(() => isScrollingToRef.current = false, 1000);
    }
  };

  const scrollNav = (direction: 'left' | 'right') => {
    if (navRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      navRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      triggerHaptic(5);
    }
  };

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentUrl)}&bgcolor=ffffff&color=cc0000`;
  const mapsLink = "https://www.google.com/maps/search/مطعم+اسبيسى+البدرشين+بجوار+صيدلية+الظاهر";

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#050505] text-zinc-900 dark:text-zinc-200 antialiased selection:bg-red-500/30 transition-colors duration-500">
      <Header isDark={isDark} onToggleTheme={() => setIsDark(!isDark)} onAction={() => triggerHaptic(10)} />
      
      <nav className="sticky top-0 z-40 bg-white/95 dark:bg-[#050505]/95 backdrop-blur-xl border-b border-zinc-200 dark:border-white/10 py-3 shadow-md transition-all duration-300">
        <div className="relative max-w-2xl mx-auto flex items-center group">
          <button 
            onClick={() => scrollNav('right')}
            className={`absolute right-1.5 z-20 w-8 h-8 flex items-center justify-center bg-white/95 dark:bg-zinc-800/95 rounded-full shadow-lg border border-zinc-200 dark:border-white/10 transition-all duration-300 active:scale-90 ${canScrollRight ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'}`}
            aria-label="تمرير لليمين"
          >
            <span className="text-red-600 font-bold text-sm">❯</span>
          </button>

          <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white dark:from-[#050505] to-transparent z-10 pointer-events-none"></div>
          <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white dark:from-[#050505] to-transparent z-10 pointer-events-none"></div>

          <div 
            ref={navRef} 
            onScroll={checkScroll} 
            className="flex gap-2 overflow-x-auto no-scrollbar px-10 py-1 scroll-smooth w-full"
          >
            {MENU_DATA.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                data-id={section.id}
                onClick={(e) => handleNavClick(e, section.id)}
                className={`whitespace-nowrap px-4 py-2 rounded-2xl text-[12px] font-black border transition-all transform active:scale-95 ${
                  activeSection === section.id 
                  ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/20 scale-105' 
                  : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/10 text-zinc-500 hover:border-red-200'
                }`}
              >
                {section.emoji} {section.title}
              </a>
            ))}
            <a
              href="#additions"
              data-id="additions"
              onClick={(e) => handleNavClick(e, 'additions')}
              className={`whitespace-nowrap px-4 py-2 rounded-2xl text-[12px] font-black border transition-all transform active:scale-95 ${
                activeSection === 'additions' 
                ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/20 scale-105' 
                : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/10 text-zinc-500 hover:border-red-200'
              }`}
            >
              ✨ الإضافات
            </a>
          </div>

          <button 
            onClick={() => scrollNav('left')}
            className={`absolute left-1.5 z-20 w-8 h-8 flex items-center justify-center bg-white/95 dark:bg-zinc-800/95 rounded-full shadow-lg border border-zinc-200 dark:border-white/10 transition-all duration-300 active:scale-90 ${canScrollLeft ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'}`}
            aria-label="تمرير لليسار"
          >
            <span className="text-red-600 font-bold text-sm">❮</span>
          </button>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-5 py-8 pb-48">
        <div className="mb-12 rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-10 relative overflow-hidden text-right shadow-2xl reveal-item">
          <div className="relative z-10">
            <h2 className="text-5xl font-black text-zinc-900 dark:text-white mb-2 leading-none italic uppercase tracking-tighter">SPICY</h2>
            <p className="text-red-600 dark:text-red-500 text-sm font-black uppercase mb-4 tracking-widest">بيتزا & كريب اسبيسى</p>
            <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500 text-[10px] font-bold">
              <span>📍 البدرشين - ش آثار سقارة</span>
              <span className="w-1 h-1 bg-zinc-300 rounded-full"></span>
              <span>بجوار صيدلية الظاهر</span>
            </div>
          </div>
          <div className="absolute -left-10 -bottom-12 text-[180px] opacity-[0.04] grayscale select-none pointer-events-none rotate-12">🌶️</div>
          <div className="absolute right-0 top-0 w-32 h-32 bg-gradient-to-bl from-red-600/10 to-transparent rounded-bl-full"></div>
        </div>

        {MENU_DATA.map((section, idx) => (
          <MenuSection key={section.id} section={section} isFirst={idx === 0} onInteraction={() => triggerHaptic(5)} />
        ))}

        <section id="additions" className="scroll-mt-[100px] mb-10 text-right reveal-item">
          <div className="bg-gradient-to-br from-red-50 to-white dark:from-zinc-900 dark:to-zinc-800 rounded-[2.5rem] p-8 border-2 border-red-600/20 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-red-600"></div>
            <h3 className="text-2xl font-black mb-8 text-red-600 flex items-center gap-3">
              <span className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl">✨</span>
              الأضافات
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ADDITIONS_DATA.general.map((add, idx) => (
                <div key={idx} className="flex justify-between items-center bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-100 dark:border-white/5 shadow-sm group hover:border-red-500/30 transition-colors">
                  <span className="font-black text-sm text-zinc-700 dark:text-zinc-300">{add.name}</span>
                  <span className="bg-red-600 text-white px-5 py-2 rounded-xl font-black tabular-nums text-sm shadow-lg shadow-red-600/20">{add.price} ج</span>
                </div>
              ))}
            </div>
            <div className="mt-10 pt-6 border-t border-zinc-100 dark:border-white/10 text-center">
                <p className="text-xs font-black text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 inline-block px-6 py-2 rounded-full">🛵 خدمة التوصيل متوفرة لجميع المناطق</p>
            </div>
          </div>
        </section>

        <footer className="mt-24 pb-12 flex flex-col items-center gap-8 reveal-item">
            <div className="w-full bg-white dark:bg-zinc-900 rounded-[3rem] p-12 shadow-2xl border border-zinc-200 dark:border-white/10 flex flex-col items-center gap-8 text-center relative overflow-hidden">
               <div className="absolute top-0 right-0 w-40 h-40 bg-red-600/5 blur-3xl -z-10"></div>
               <div className="absolute bottom-0 left-0 w-40 h-40 bg-red-600/5 blur-3xl -z-10"></div>
               
               <SpicyLogo />
               <div className="space-y-2">
                 <h3 className="text-4xl font-black text-zinc-900 dark:text-white uppercase italic tracking-tighter">SPICY</h3>
                 <p className="text-red-600 dark:text-red-500 text-xs font-black uppercase tracking-[0.2em]">الطعم له أصول</p>
               </div>
               
               <div className="relative group">
                 <div className="absolute -inset-2 bg-red-600/20 rounded-[2.5rem] blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>
                 <div className="relative p-6 bg-white rounded-[2.5rem] border-4 border-zinc-100 shadow-inner">
                    <img src={qrUrl} alt="QR Code" className="w-44 h-44" />
                 </div>
               </div>
               
               <p className="text-[11px] text-zinc-400 font-black max-w-[200px] leading-relaxed">
                 امسح الكود بكاميرا هاتفك لمشاركة القائمة مع أصدقائك
               </p>
            </div>

            <a href={mapsLink} target="_blank" rel="noopener noreferrer" className="w-full bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 shadow-xl border border-zinc-200 dark:border-white/10 text-right group active:scale-95 transition-all">
               <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-3xl flex items-center justify-center text-3xl border border-red-100 dark:border-red-900/30 group-hover:bg-red-600 group-hover:text-white transition-all duration-500 shadow-sm group-hover:shadow-red-600/30">📍</div>
                    <div className="flex flex-col pt-1">
                       <span className="text-[11px] font-black text-red-600 uppercase tracking-tighter mb-1">موقعنا على الخريطة</span>
                       <p className="text-zinc-800 dark:text-zinc-100 text-base font-black leading-snug">البدرشين - ش آثار سقارة بجوار صيدلية الظاهر</p>
                    </div>
                  </div>
               </div>
            </a>
            
            <div className="flex flex-col items-center gap-3 opacity-80">
               <div className="text-center space-y-1">
                 <p className="text-zinc-500 dark:text-zinc-400 text-[11px] font-bold">تصميم وتنفيذ مهندس / احمد النقيب</p>
                 <a href="tel:01092621367" className="text-red-600 text-[11px] font-black hover:underline tabular-nums">للتواصل 01092621367</a>
               </div>
               <div className="flex gap-4 pt-2">
                 <span className="w-2 h-2 rounded-full bg-red-600"></span>
                 <span className="w-2 h-2 rounded-full bg-red-600/60"></span>
                 <span className="w-2 h-2 rounded-full bg-red-600/30"></span>
               </div>
            </div>
        </footer>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-[60] px-4 pb-6 pt-2 md:hidden">
        <div className="max-w-xl mx-auto glass border border-zinc-200 dark:border-white/10 rounded-[2.5rem] p-2 flex items-center justify-around shadow-2xl relative">
          {showBottomCallMenu && (
            <>
              <div className="fixed inset-0 bg-black/40 backdrop-blur-[4px]" onClick={() => setShowBottomCallMenu(false)}></div>
              <div className="absolute bottom-[calc(100%+1rem)] left-0 right-0 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-up mx-2 z-[61]">
                <div className="px-6 py-4 bg-zinc-50 dark:bg-white/5 border-b border-zinc-100 text-right">
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">تواصل معنا الآن</span>
                </div>
                {[
                  { n: "01110455108", l: "رقم 1" },
                  { n: "01111229972", l: "رقم 2" },
                  { n: "01152430222", l: "رقم 3" },
                  { n: "01007148685", l: "رقم 4" },
                  { n: "01013003496", l: "رقم 5" }
                ].map((p, i) => (
                  <a key={i} href={`tel:${p.n}`} className="flex items-center justify-between px-7 py-4 border-b last:border-0 border-zinc-100 dark:border-white/5 active:bg-red-50 transition-colors">
                    <span className="text-[11px] font-black text-zinc-400">{p.l}</span>
                    <span className="text-[17px] font-black tabular-nums tracking-tighter text-red-600">{p.n}</span>
                  </a>
                ))}
              </div>
            </>
          )}
          <a href="https://wa.me/201013003496" className="flex-1 flex flex-col items-center py-2 gap-1 text-zinc-500 dark:text-zinc-400"><span className="text-2xl">💬</span><span className="text-[10px] font-black">واتساب</span></a>
          <button onClick={() => setShowBottomCallMenu(!showBottomCallMenu)} className={`flex-1 flex flex-col items-center py-2 gap-1 ${showBottomCallMenu ? 'text-red-600' : 'text-zinc-500 dark:text-zinc-400'}`}><span className="text-2xl">📞</span><span className="text-[10px] font-black">اتصال</span></button>
          
          <button 
            onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} 
            className="bg-red-600 w-16 h-16 rounded-full flex items-center justify-center text-white shadow-xl -mt-10 border-4 border-white dark:border-[#050505] active:scale-90 transition-all z-10 red-glow"
          >
            <span className="text-xl">🔝</span>
          </button>
          
          <a href={mapsLink} target="_blank" rel="noopener noreferrer" className="flex-1 flex flex-col items-center py-2 gap-1 text-zinc-500 dark:text-zinc-400"><span className="text-2xl">📍</span><span className="text-[10px] font-black">الموقع</span></a>
          <button onClick={(e) => handleNavClick(e, MENU_DATA[0].id)} className="flex-1 flex flex-col items-center py-2 gap-1 text-zinc-500 dark:text-zinc-400"><span className="text-2xl">📋</span><span className="text-[10px] font-black">المنيو</span></button>
        </div>
      </nav>
    </div>
  );
};

export default App;
