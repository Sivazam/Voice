'use client';

import React from 'react';

interface BrandLogo {
  id: number;
  name: string;
  logoPath: string;
}

const BrandLogosAnimation: React.FC = () => {
  const logos: BrandLogo[] = [
    { id: 1, name: 'Education', logoPath: '/logos/1.png' },
    { id: 2, name: 'Banking', logoPath: '/logos/2.png' },
    { id: 3, name: 'GST', logoPath: '/logos/3.png' },
    { id: 4, name: 'Income Tax', logoPath: '/logos/4.png' },
    { id: 5, name: 'Corruption', logoPath: '/logos/5.png' },
    { id: 6, name: 'Political', logoPath: '/logos/6.png' },
  ];

  // Duplicate logos for seamless infinite loop
  const duplicatedLogos = [...logos, ...logos];

  return (
    <div className="w-full py-12 overflow-hidden">
      <div className="relative">
        {/* Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center border w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden border-transparent [a&]:hover:bg-primary/90 px-6 py-3 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 hover:from-blue-200 hover:to-blue-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-grid-3x3 h-4 w-4 mr-2" aria-hidden="true">
              <rect x="3" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/>
              <rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
            Service Areas
          </div>
        </div>
        
        {/* Moving Logos Track */}
        <div className="relative" style={{ paddingTop: '20px', paddingBottom: '20px' }}>
          {/* White gradient blur overlays - concentrated at edges only */}
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white via-white/80 to-transparent opacity-90 blur-md z-10"></div>
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white via-white/80 to-transparent opacity-90 blur-md z-10"></div>
          
          {/* Additional edge blur - very narrow */}
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white/70 to-transparent opacity-70 blur-lg z-10"></div>
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white/70 to-transparent opacity-70 blur-lg z-10"></div>
          
          {/* Final edge touch - minimal spread */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white/50 to-transparent opacity-50 blur-xl z-10"></div>
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white/50 to-transparent opacity-50 blur-xl z-10"></div>
          
          <div 
            className="flex space-x-12 animate-scroll"
            style={{
              animation: 'scroll 30s linear infinite',
              width: 'fit-content'
            }}
          >
            {duplicatedLogos.map((logo, index) => (
              <div
                key={`${logo.id}-${index}`}
                className="flex-shrink-0 group cursor-pointer"
              >
                <div className="relative w-28 h-28 md:w-36 md:h-36 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center">
                  {/* Logo content */}
                  <div className="w-full h-full rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-xl md:text-2xl">
                      {logo.id}
                    </span>
                  </div>
                  {/* Actual image - will be shown when images are available */}
                  <img 
                    src={logo.logoPath} 
                    alt={logo.name}
                    className="w-full h-full rounded-full object-cover absolute inset-0"
                    onError={(e) => {
                      // Show fallback if image fails to load
                      e.currentTarget.style.display = 'none';
                    }}
                    onLoad={(e) => {
                      // Show image when loaded successfully
                      e.currentTarget.style.display = 'block';
                      const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                      if (nextElement) {
                        nextElement.style.display = 'none';
                      }
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes scroll {
          0% { 
            transform: translateX(0); 
          }
          100% { 
            transform: translateX(-50%); 
          }
        }

        .animate-scroll {
          display: flex;
          animation: scroll 30s linear infinite;
        }

        /* Ensure smooth performance */
        .animate-scroll > * {
          will-change: transform;
        }
      `}</style>
    </div>
  );
};

export default BrandLogosAnimation;