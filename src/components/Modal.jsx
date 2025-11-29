import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ onClose, title, children }) => (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-end sm:items-center justify-center sm:p-4 backdrop-blur-sm">
        <div className="bg-neutral-950 w-full sm:max-w-lg shadow-2xl animate-in slide-in-from-bottom-10 sm:zoom-in duration-200 flex flex-col max-h-[90vh] sm:rounded-3xl rounded-t-3xl border border-white/10">
            <div className="flex justify-between items-center p-6 border-b border-white/10 flex-shrink-0">
                <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
                    <X size={20} />
                </button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar">
                {children}
            </div>
        </div>
    </div>
);

export default Modal;
