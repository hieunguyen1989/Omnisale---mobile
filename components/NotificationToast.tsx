
import React, { useEffect, useState } from 'react';
import { X, MessageCircle } from 'lucide-react';

interface NotificationToastProps {
  sender: string;
  avatar: string;
  message: string;
  platform: string;
  onClose: () => void;
  onClick: () => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ sender, avatar, message, platform, onClose, onClick }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Slide in animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    
    // Auto close after 5 seconds
    const closeTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for slide out animation
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearTimeout(closeTimer);
    };
  }, [onClose]);

  return (
    <div 
      className={`fixed top-4 right-4 z-[60] transition-all duration-300 transform ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div 
        className="bg-white rounded-lg shadow-xl border border-indigo-100 p-4 w-80 cursor-pointer hover:bg-slate-50 transition-colors relative overflow-hidden group"
        onClick={onClick}
      >
        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-600"></div>
        <button 
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 p-1"
        >
          <X size={14} />
        </button>

        <div className="flex gap-3 items-start">
          <div className="relative shrink-0">
            <img src={avatar} alt={sender} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
            <div className="absolute -bottom-1 -right-1 bg-green-500 w-3 h-3 rounded-full border-2 border-white"></div>
          </div>
          <div className="flex-1 min-w-0 pr-4">
             <div className="flex items-center gap-2 mb-0.5">
               <h4 className="font-bold text-slate-800 text-sm truncate">{sender}</h4>
               <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded border border-slate-200 font-medium">
                 {platform}
               </span>
             </div>
             <p className="text-sm text-slate-600 line-clamp-2 leading-snug">{message}</p>
             <div className="mt-2 flex items-center gap-1 text-xs text-indigo-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
               <MessageCircle size={12} /> Trả lời ngay
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationToast;
