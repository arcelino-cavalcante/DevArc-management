import React from 'react';
import { LayoutDashboard, CheckSquare, Users, LogOut, DollarSign, RefreshCw, Send, FileText, ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import NavButton from './NavButton';
import InstallPWA from './InstallPWA';
import { useLocation, useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';

const Sidebar = ({ isCollapsed, toggleSidebar }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => auth.signOut();

    return (
        <aside className={`fixed left-0 top-0 h-screen bg-black border-r border-white/10 hidden md:flex flex-col z-50 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-72'}`}>
            <div className="p-6 flex flex-col h-full">
                {/* Header / Logo */}
                <div className={`mb-10 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                    {!isCollapsed && (
                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">DevArc</h1>
                            <p className="text-[10px] text-cyan-400/80 font-medium tracking-[0.2em] uppercase">Management</p>
                        </div>
                    )}
                    <button
                        onClick={toggleSidebar}
                        className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    >
                        {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="space-y-2 flex-1">
                    <NavButton
                        onClick={() => navigate('/')}
                        icon={<LayoutDashboard size={20} />}
                        label="Dashboard"
                        active={location.pathname === '/'}
                        collapsed={isCollapsed}
                    />
                    <NavButton
                        onClick={() => navigate('/clients')}
                        icon={<Users size={20} />}
                        label="Clientes"
                        active={location.pathname === '/clients'}
                        collapsed={isCollapsed}
                    />
                    <NavButton
                        onClick={() => navigate('/projects')}
                        icon={<CheckSquare size={20} />}
                        label="Projetos"
                        active={location.pathname === '/projects'}
                        collapsed={isCollapsed}
                    />
                    <NavButton
                        onClick={() => navigate('/financials')}
                        icon={<DollarSign size={20} />}
                        label="Financeiro"
                        active={location.pathname === '/financials'}
                        collapsed={isCollapsed}
                    />
                    <NavButton
                        onClick={() => navigate('/updates')}
                        icon={<RefreshCw size={20} />}
                        label="Atualizações"
                        active={location.pathname === '/updates'}
                        collapsed={isCollapsed}
                    />
                    <NavButton
                        onClick={() => navigate('/billing')}
                        icon={<Send size={20} />}
                        label="Cobrar"
                        active={location.pathname === '/billing'}
                        collapsed={isCollapsed}
                    />
                    <NavButton
                        onClick={() => navigate('/contracts')}
                        icon={<FileText size={20} />}
                        label="Contratos"
                        active={location.pathname === '/contracts'}
                        collapsed={isCollapsed}
                    />
                    <NavButton
                        onClick={() => navigate('/settings')}
                        icon={<Settings size={20} />}
                        label="Configurações"
                        active={location.pathname === '/settings'}
                        collapsed={isCollapsed}
                    />
                </nav>

                {/* Footer / Logout */}
                <div className="pt-6 border-t border-white/10 space-y-2">
                    {!isCollapsed && <InstallPWA />}
                    <button
                        onClick={handleLogout}
                        className={`flex items-center gap-3 text-slate-500 hover:text-rose-400 transition-colors w-full p-3 rounded-xl hover:bg-rose-500/5 border border-transparent hover:border-rose-500/20 group font-medium text-sm ${isCollapsed ? 'justify-center' : ''}`}
                        title={isCollapsed ? "Sair do Sistema" : ""}
                    >
                        <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                        {!isCollapsed && <span>Sair do Sistema</span>}
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
