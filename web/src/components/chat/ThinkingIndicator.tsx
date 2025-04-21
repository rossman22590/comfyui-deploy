import React from 'react';
import { motion } from 'framer-motion';
import { LightBulbIcon } from '@heroicons/react/24/outline';

interface ThinkingIndicatorProps {
  isLoading: boolean;
  thinkingText: string;
}

const ThinkingIndicator: React.FC<ThinkingIndicatorProps> = ({ isLoading, thinkingText }) => {
  if (!isLoading) return null;
  
  return (
    <motion.div 
      className="p-4 mb-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-100 dark:border-blue-900"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-1">
          <LightBulbIcon className="h-5 w-5 text-blue-500" />
        </div>
        <div>
          <div className="font-medium text-sm text-blue-700 dark:text-blue-300 mb-1 flex items-center">
            Thinking...
            <div className="flex ml-2">
              <motion.div 
                className="h-1 w-1 bg-blue-500 rounded-full"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div 
                className="h-1 w-1 mx-1 bg-blue-500 rounded-full"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.3, ease: "easeInOut" }}
              />
              <motion.div 
                className="h-1 w-1 bg-blue-500 rounded-full"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.6, ease: "easeInOut" }}
              />
            </div>
          </div>
          {thinkingText && (
            <div className="text-sm text-blue-600 dark:text-blue-400 whitespace-pre-wrap">
              {thinkingText}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ThinkingIndicator;
