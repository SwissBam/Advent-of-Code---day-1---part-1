import React from 'react';

interface DialProps {
  currentValue: number; // 0-99
  isMatch: boolean;
  isAnimating: boolean;
}

const Dial: React.FC<DialProps> = ({ currentValue, isMatch, isAnimating }) => {
  // 0 is top (12 o'clock).
  // 360 degrees / 100 units = 3.6 degrees per unit.
  // Rotation is clockwise.
  const rotation = currentValue * 3.6;

  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      <div className="relative w-72 h-72 md:w-96 md:h-96 flex items-center justify-center">
        {/* Outer Bezel / Fixed Numbers Ring */}
        <div className="absolute inset-0 rounded-full border-8 border-slate-700 bg-slate-900 shadow-2xl">
          {/* Ticks and Numbers */}
          {Array.from({ length: 100 }).map((_, i) => {
            const isMajor = i % 10 === 0;
            const isMedium = i % 5 === 0;
            
            // Only render visual markers for 5s and 10s to keep DOM light, but could do all if needed
            if (!isMedium && !isMajor) return null;

            const deg = i * 3.6;

            return (
              <React.Fragment key={i}>
                {/* Tick Mark */}
                <div
                  className={`absolute top-0 left-1/2 -translate-x-1/2 origin-bottom h-[50%] pointer-events-none`}
                  style={{ transform: `rotate(${deg}deg)` }}
                >
                  <div
                    className={`mt-2 ${
                      isMajor ? 'h-4 w-1 bg-slate-300' : 'h-2 w-0.5 bg-slate-600'
                    }`}
                  ></div>
                </div>
                {/* Number Label */}
                {isMajor && (
                  <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 h-[50%] origin-bottom pointer-events-none"
                    style={{ transform: `rotate(${deg}deg)` }}
                  >
                    <span
                      className="absolute top-7 left-1/2 -translate-x-1/2 text-xs md:text-sm font-mono font-bold text-slate-400"
                      style={{ transform: `translateX(-50%) rotate(-${deg}deg)` }} // Counter-rotate text
                    >
                      {i}
                    </span>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* The Rotating Dial (Center part) */}
        <div
          className="absolute inset-16 md:inset-20 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 shadow-lg border-2 border-slate-600 flex items-center justify-center transition-transform"
          style={{ 
            transform: `rotate(${rotation}deg)`,
            transitionDuration: isAnimating ? '300ms' : '0ms',
            transitionTimingFunction: 'cubic-bezier(0.25, 0.1, 0.25, 1.0)' // Ease out
          }}
        >
          {/* The Pointer Arrow */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2">
            <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[16px] border-b-red-500 filter drop-shadow-md"></div>
          </div>

          {/* Center Knob */}
          <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full bg-slate-800 border-4 flex items-center justify-center shadow-inner ${
            isMatch 
              ? 'border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.5)]' 
              : 'border-slate-600'
          } transition-all duration-200`}>
             <div className="w-2 h-2 rounded-full bg-slate-500"></div>
          </div>
        </div>
      </div>

      {/* Digital Readout */}
      <div className="flex flex-col items-center">
        <div className="text-slate-400 text-xs font-mono uppercase tracking-widest mb-1">Current Position</div>
        <div className={`text-4xl font-mono font-bold px-6 py-2 rounded bg-slate-800 border ${isMatch ? 'text-green-400 border-green-500' : 'text-white border-slate-600'} transition-colors duration-200`}>
          {currentValue.toString().padStart(2, '0')}
        </div>
      </div>
    </div>
  );
};

export default Dial;
