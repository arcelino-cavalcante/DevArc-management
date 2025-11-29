import React from 'react';

const StatCard = ({ title, value, icon, trend, color, iconBg }) => (
    <div className="p-6 rounded-2xl bg-neutral-950 border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors">

        <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2">{title}</p>
                <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{value}</h3>
            </div>
            <div className={`p-3 rounded-xl bg-white/5 border border-white/5 text-slate-300 group-hover:text-white group-hover:border-white/10 transition-colors`}>
                {icon}
            </div>
        </div>
        {trend && (
            <div className="text-[10px] font-medium text-cyan-400 bg-cyan-950/30 inline-block px-2 py-1 rounded border border-cyan-500/20">
                {trend}
            </div>
        )}
    </div>
);

export default StatCard;
