import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function BootScreen({ onBootComplete }: { onBootComplete: () => void }) {
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowText(true);
    }, 500);

    const bootTimer = setTimeout(() => {
      onBootComplete();
    }, 3000);

    return () => {
      clearTimeout(timer);
      clearTimeout(bootTimer);
    };
  }, [onBootComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black z-50 flex items-center justify-center"
    >
      <div className="relative">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-32 h-32 rounded-full border-4 border-cyan-400/20"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full h-full rounded-full bg-gradient-to-br from-cyan-400/20 to-blue-500/20"
          />
        </motion.div>
        
        {showText && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-cyan-400 font-orbitron text-xl tracking-wider"
          >
            Ativando núcleo Jarvis...
          </motion.div>
        )}
      </div>
    </motion.div>
  );
} 