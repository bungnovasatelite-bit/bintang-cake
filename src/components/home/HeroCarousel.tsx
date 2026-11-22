import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sparkles, ArrowRight, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';
import { useCMS, ensure5HeroSlides } from '../../context/CMSContext';

export const HeroCarousel: React.FC = () => {
  const { setActiveTab } = useNavigation();
  const { storeConfig } = useCMS();

  // HANYA tampilkan slide yang fotonya benar-benar di-upload oleh pengguna (bukan bawaan Unsplash)
  const allSlides = ensure5HeroSlides(storeConfig.heroSlides, storeConfig.heroImage);
  const activeSlides = allSlides.filter(
    (s) => s.image && s.image.trim() !== '' && !s.image.includes('unsplash.com')
  );

  // Jika belum ada di heroSlides tapi ada di storeConfig.heroImage yang di-upload
  const displaySlides = activeSlides.length > 0
    ? activeSlides
    : (storeConfig.heroImage && !storeConfig.heroImage.includes('unsplash.com')
        ? [{
            id: 'slide-main',
            image: storeConfig.heroImage,
            tag: storeConfig.heroTag || 'PARTNER TO ENJOY YOUR DAY',
            title: storeConfig.heroTitle || 'Bintang Cake & Cookies',
            subtitle: storeConfig.heroSubtitle || 'Rayakan setiap kebersamaan berharga dengan kreasi kue lembut dan kue kering mentega Wijsman premium.',
          }]
        : []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Touch gesture state
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const totalSlides = displaySlides.length;

  // Pastikan currentIndex tidak keluar dari jangkauan jika jumlah slide berubah
  useEffect(() => {
    if (currentIndex >= totalSlides && totalSlides > 0) {
      setCurrentIndex(0);
    }
  }, [totalSlides, currentIndex]);

  const nextSlide = useCallback(() => {
    if (totalSlides <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    if (totalSlides <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const goToSlide = (index: number) => {
    if (totalSlides <= 1) return;
    setCurrentIndex(index);
  };

  // Autoplay interval hanya jika ada lebih dari 1 slide yang di-upload
  useEffect(() => {
    if (isPaused || totalSlides <= 1) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 4500);

    return () => clearInterval(timer);
  }, [isPaused, nextSlide, totalSlides]);

  // Handle Touch Gestures untuk Mobile Swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    if (totalSlides <= 1) return;
    touchStartX.current = e.targetTouches[0].clientX;
    setIsPaused(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (totalSlides <= 1) return;
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (totalSlides <= 1 || !touchStartX.current || !touchEndX.current) {
      setIsPaused(false);
      return;
    }
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 45;
    const isRightSwipe = distance < -45;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }

    touchStartX.current = null;
    touchEndX.current = null;
    setIsPaused(false);
  };

  const currentSlide = displaySlides[currentIndex] || {
    id: 'slide-fallback',
    image: '',
    tag: storeConfig.heroTag || 'PARTNER TO ENJOY YOUR DAY',
    title: storeConfig.heroTitle || 'Bintang Cake & Cookies',
    subtitle: storeConfig.heroSubtitle || 'Rayakan setiap kebersamaan berharga dengan kreasi kue lembut dan kue kering mentega Wijsman premium.',
  };

  return (
    <section
      className="relative overflow-hidden rounded-3xl bg-[#201107] text-[#FAF5EE] shadow-float mx-1 select-none group min-h-[320px] sm:min-h-[350px]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-label="Slider Promosi & Produk Unggulan Bintang Cake"
    >
      {/* Lapisan Gambar Slider (Hanya dari foto yang di-upload) */}
      <div className="absolute inset-0 z-0">
        {displaySlides.map((slide, idx) => {
          const isActive = idx === currentIndex;
          return (
            <div
              key={slide.id || idx}
              className={`absolute inset-0 transition-all duration-700 ease-out ${
                isActive
                  ? 'opacity-100 scale-100'
                  : 'opacity-0 scale-105 pointer-events-none'
              }`}
            >
              {slide.image && (
                <img
                  src={slide.image}
                  alt={slide.title || `Bintang Cake Slide ${idx + 1}`}
                  className="w-full h-full object-cover object-center"
                />
              )}
              {/* Elegant Vignette & Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A0C04] via-[#201107]/60 to-black/30" />
            </div>
          );
        })}

        {/* Jika belum ada foto sama sekali yang di-upload */}
        {displaySlides.length === 0 && (
          <div className="absolute inset-0 bg-gradient-to-br from-[#2D1608] via-[#201107] to-[#120702]" />
        )}
      </div>

      {/* Konten Hero Teks & Tombol Aksi */}
      <div className="relative z-10 p-5 sm:p-7 flex flex-col justify-end min-h-[320px] sm:min-h-[350px]">
        {/* Baris Atas: Badge Tag & Counter Slide */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF5EE]/15 backdrop-blur-md border border-[#FAF5EE]/25 text-[#FAF5EE] text-[10.5px] sm:text-[11px] font-semibold w-fit shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#EAD1B6]" />
            <span>{currentSlide.tag || storeConfig.heroTag || 'SPECIAL COLLECTION'}</span>
          </div>

          {/* Indikator Angka Slide (hanya jika ada foto yang di-upload) */}
          {totalSlides > 1 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-[#EAD1B6] border border-white/10">
              {currentIndex + 1} / {totalSlides}
            </span>
          )}
        </div>

        {/* Judul & Subtitle Slide */}
        <div className="space-y-1.5 max-w-md">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#FAF5EE] leading-tight drop-shadow-sm">
            {currentSlide.title || storeConfig.heroTitle}
          </h2>

          <p className="text-xs sm:text-sm text-[#E6D3BE] font-normal leading-relaxed line-clamp-2 drop-shadow-xs">
            {currentSlide.subtitle || storeConfig.heroSubtitle}
          </p>
        </div>

        {/* Tombol CTA & Dots */}
        <div className="mt-4 sm:mt-5 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setActiveTab('produk')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#FFFDF9] text-[#3D2314] font-bold text-xs hover:bg-[#FAF5EE] active:scale-95 transition-all shadow-md cursor-pointer"
            >
              <span>Belanja Sekarang</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>

            <button
              onClick={() => setActiveTab('profil')}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-[#FFFDF9]/15 backdrop-blur-md border border-[#FAF5EE]/30 text-[#FAF5EE] font-semibold text-xs hover:bg-[#FFFDF9]/25 active:scale-95 transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Hubungi Kami</span>
            </button>
          </div>

          {/* Dots Navigasi Slide (hanya tampil jika > 1 slide yang di-upload) */}
          {totalSlides > 1 && (
            <div className="flex items-center gap-1.5 py-1">
              {displaySlides.map((_, dotIdx) => {
                const isDotActive = dotIdx === currentIndex;
                return (
                  <button
                    key={dotIdx}
                    onClick={() => goToSlide(dotIdx)}
                    aria-label={`Buka slide ${dotIdx + 1}`}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      isDotActive
                        ? 'w-6 bg-[#EAD1B6] shadow-sm'
                        : 'w-2 bg-white/40 hover:bg-white/70'
                    }`}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Tombol Navigasi Panah Kiri & Kanan (Hanya tampil jika ada lebih dari 1 slide yang di-upload) */}
      {totalSlides > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prevSlide();
            }}
            aria-label="Slide sebelumnya"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/35 hover:bg-black/60 backdrop-blur-md border border-white/20 text-[#FAF5EE] flex items-center justify-center transition-all cursor-pointer opacity-80 group-hover:opacity-100 active:scale-90"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              nextSlide();
            }}
            aria-label="Slide berikutnya"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/35 hover:bg-black/60 backdrop-blur-md border border-white/20 text-[#FAF5EE] flex items-center justify-center transition-all cursor-pointer opacity-80 group-hover:opacity-100 active:scale-90"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}
    </section>
  );
};
