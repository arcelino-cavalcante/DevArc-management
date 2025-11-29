import React from 'react';

const NavButton = ({ onClick, icon, label, active, collapsed }) => {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-200 group relative
            ${active
                    ? 'bg-cyan-500/10 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.1)]'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }
            ${collapsed ? 'justify-center' : ''}
            `}
            title={collapsed ? label : ''}
        >
            <div className={`${active ? 'scale-110' : 'group-hover:scale-110'} transition-transform duration-200`}>
                {icon}
            </div>
            {!collapsed && <span className="font-medium text-sm">{label}</span>}

        </button>
    );
};
export default NavButton;
