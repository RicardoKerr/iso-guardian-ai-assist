
import React, { useState, useEffect } from 'react';

interface AIAvatarProps {
  isProcessing?: boolean;
  isSpeaking?: boolean;
}

export function AIAvatar({ isProcessing = false, isSpeaking = false }: AIAvatarProps) {
  const [animationFrame, setAnimationFrame] = useState(0);
  
  useEffect(() => {
    let interval: number;
    
    if (isProcessing || isSpeaking) {
      interval = window.setInterval(() => {
        setAnimationFrame(prev => (prev + 1) % 3);
      }, 500);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isProcessing, isSpeaking]);
  
  return (
    <div className="relative w-full aspect-square max-w-[280px] mx-auto">
      {/* Outer glow effect */}
      <div className="absolute inset-0 rounded-full bg-iso-purple/5 animate-pulse-glow"></div>
      
      {/* AI Visualization frame */}
      <div className="absolute inset-2 rounded-full border-2 border-iso-purple/30 overflow-hidden bg-gradient-to-b from-iso-dark to-transparent flex items-center justify-center">
        <div className="absolute inset-0 futuristic-grid-bg opacity-20"></div>
        
        {/* Visual center */}
        <div className="h-3/4 w-3/4 rounded-full flex items-center justify-center relative">
          {/* Orbital rings */}
          <div className="absolute w-full h-full rounded-full border border-iso-purple/30 animate-spin" style={{ animationDuration: '8s' }}></div>
          <div className="absolute w-4/5 h-4/5 rounded-full border border-iso-blue/20 animate-spin" style={{ animationDuration: '12s' }}></div>
          
          {/* Core element */}
          <div className="w-2/4 h-2/4 rounded-full bg-gradient-to-br from-iso-purple via-iso-blue to-iso-glow flex items-center justify-center animate-pulse-glow">
            <div className="text-white font-bold text-xl">
              {isProcessing ? (
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              ) : (
                "27001"
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Status indicator */}
      <div className="absolute bottom-2 right-2 flex items-center space-x-2 bg-iso-dark/80 px-3 py-1 rounded-full text-xs">
        <span className={`h-2 w-2 rounded-full ${isProcessing || isSpeaking ? 'bg-iso-blue animate-pulse' : 'bg-iso-purple/50'}`}></span>
        <span className="text-iso-purple/80">
          {isProcessing ? 'Processing...' : isSpeaking ? 'Speaking...' : 'Ready'}
        </span>
      </div>
    </div>
  );
}
