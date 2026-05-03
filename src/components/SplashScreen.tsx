import React from 'react';
import { motion } from 'motion/react';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 1, delay: 2.5 }}
      onAnimationComplete={onComplete}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black"
    >
      <div className="flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1 }}
          className="w-48 h-48 mb-4 relative"
        >
          {/* Owl Logo Placeholder - Using Lucide for icon version of owl since I can't directly use the raw binary artifact in <img> easily without a direct URL, but I'll try to use a representative SVG or icon */}
          <div className="w-full h-full border-4 border-white rounded-full flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-24 h-24 fill-white text-white">
              <path d="M12,2C10.89,2 10,2.89 10,4C10,5.11 10.89,6 12,6C13.11,6 14,5.11 14,4C14,2.89 13.11,2 12,2M12,8C9.79,8 8,9.79 8,12C8,14.21 9.79,16 12,16C14.21,16 16,14.21 16,12C16,9.79 14.21,8 12,8M12,18C10.34,18 9,19.34 9,21C9,22.66 10.34,24 12,24C13.66,24 15,22.66 15,21C15,19.34 13.66,18 12,18Z" />
              <path d="M4.5,12C3.12,12 2,13.12 2,14.5C2,15.88 3.12,17 4.5,17C5.88,17 7,15.88 7,14.5C7,13.12 5.88,12 4.5,12Z" />
              <path d="M19.5,12C18.12,12 17,13.12 17,14.5C17,15.88 18.12,17 19.5,17C20.88,17 22,15.88 22,14.5C22,13.12 20.88,12 19.5,12Z" />
            </svg>
          </div>
        </motion.div>
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-4xl font-bold tracking-widest text-white uppercase"
        >
          DigiSchool
        </motion.h1>
      </div>
    </motion.div>
  );
}
