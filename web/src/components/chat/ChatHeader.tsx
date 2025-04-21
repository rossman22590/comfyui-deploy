import React from 'react';
import { motion } from 'framer-motion';
import { ChatBubbleLeftRightIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface ChatHeaderProps {
  onReset: () => void;
  showResetButton: boolean;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ onReset, showResetButton }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white shadow-sm p-4 flex items-center border-b flex-shrink-0"
    >
      <div className="flex items-center flex-1 max-w-screen-2xl mx-auto w-full px-4">
        <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg mr-3 flex items-center justify-center">
          <ChatBubbleLeftRightIcon className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-xl font-semibold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
          Pixio AI Assistant
        </h1>
        <div className="ml-auto">
          {showResetButton && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onReset}
              className="text-sm flex items-center px-3 py-1.5 rounded-md text-gray-600 hover:bg-gray-100 border border-gray-200"
            >
              <ArrowPathIcon className="w-4 h-4 mr-1" />
              Reset Chat
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ChatHeader;