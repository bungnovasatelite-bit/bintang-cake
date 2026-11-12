import React from 'react';
import { Smartphone, Monitor } from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';

interface MobileContainerProps {
  children: React.ReactNode;
}

export const MobileContainer: React.FC<MobileContainerProps> = ({ children }) => {
  const { isDeviceFrameEnabled, setIsDeviceFrameEnabled } = useNavigation();

  return (
    <div className="min-h-screen bg-[#F0E6D8] text-[#3D2314] flex flex-col items-center justify-start sm:py-6 sm:px-4">
      {/* Desktop Helper Bar: Quick toggle for review on large screens */}
      <div className="hidden sm:flex items-center justify-between w-full max-w-md mb-3 px-3 py-1.5 rounded-full bg-[#FAF5EE]/90 backdrop-blur-md border border-[#E0D2C2] text-xs shadow-sm">
        <span className="font-serif font-bold text-[#4A2810] text-[11px] tracking-tight">
          Bintang Cake &amp; Cookies • Mobile App Shell
        </span>
        <button
          onClick={() => setIsDeviceFrameEnabled(!isDeviceFrameEnabled)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#4A2810] text-[#FFFDF9] text-[10px] font-bold hover:bg-[#341A08] transition-all"
        >
          {isDeviceFrameEnabled ? (
            <>
              <Monitor className="w-3 h-3" />
              Mode Bersih
            </>
          ) : (
            <>
              <Smartphone className="w-3 h-3" />
              Bingkai HP
            </>
          )}
        </button>
      </div>

      {/* Main Container */}
      {isDeviceFrameEnabled ? (
        /* Phone Shell Frame Mockup */
        <div className="relative w-full max-w-[412px] bg-[#2C180C] rounded-[48px] p-3 shadow-2xl border-4 border-[#5C381E]">
          {/* Dynamic Island / Notch */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-50 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-[#1A1A1A] mr-4" />
            <div className="w-2 h-2 rounded-full bg-[#0D2436]" />
          </div>

          {/* Screen Content */}
          <div className="relative w-full min-h-[820px] max-h-[88vh] overflow-y-auto bg-[#FAF5EE] rounded-[40px] overflow-hidden no-scrollbar flex flex-col">
            {children}
          </div>
        </div>
      ) : (
        /* Seamless Clean Mobile App Container */
        <div className="w-full max-w-md min-h-screen sm:min-h-[840px] sm:max-h-[92vh] sm:rounded-[36px] bg-[#FAF5EE] shadow-float sm:border sm:border-[#E8DACB] relative flex flex-col overflow-y-auto no-scrollbar">
          {children}
        </div>
      )}
    </div>
  );
};
