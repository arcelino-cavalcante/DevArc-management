import React from 'react';

const MobileNavButton = ({ active, onClick, icon, label }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-all duration-300 w-full ${active
            ? 'text-cyan-400'
            : 'text-slate-500 hover:text-slate-300'
            }`}
    >
        <div className={`transition-transform duration-300 ${active ? 'scale-110 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]' : ''}`}>
            {icon}
        </div>
        <span className={`text-[10px] font-medium tracking-wide ${active ? 'font-bold' : ''}`}>{label}</span>
    </button>
);

export default MobileNavButton;
