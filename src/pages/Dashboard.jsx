import React from 'react';
import { Calendar, DollarSign, Briefcase, CheckSquare, Users, MessageCircle, Plus } from 'lucide-react';
import StatCard from '../components/StatCard';
import { formatCurrency, formatDate } from '../utils';

const Dashboard = ({ stats, projects, clients, onOpenProjectModal, onOpenClientModal, setFormData }) => {
    return (
        <div className="space-y-8 pb-20 md:pb-0">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">Visão Geral</h1>
                    <p className="text-slate-400">Bem-vindo de volta ao painel de controle ArcDev.</p>
                </div>
                <div className="flex items-center gap-2">
                    {!navigator.onLine && (
                        <div className="flex items-center gap-2 text-sm font-bold text-amber-400 bg-amber-500/10 px-4 py-2 rounded-full border border-amber-500/20">
                            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>
                            Modo Offline
                        </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-slate-400 bg-slate-900/50 px-4 py-2 rounded-full border border-slate-800">
                        <Calendar size={14} />
                        {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <StatCard
                    title="Receita Mensal (MRR)"
                    value={formatCurrency(stats.mrr)}
                    icon={<DollarSign className="text-emerald-400" size={24} />}
                    color="from-emerald-500/10 to-emerald-500/5 border-emerald-500/20"
                    iconBg="bg-emerald-500/20"
                />
                <StatCard
                    title="Projetos Ativos"
                    value={stats.activeProjects}
                    icon={<Briefcase className="text-blue-400" size={24} />}
                    color="from-blue-500/10 to-blue-500/5 border-blue-500/20"
                    iconBg="bg-blue-500/20"
                />
                <StatCard
                    title="Tarefas Pendentes"
                    value={stats.pendingTasks}
                    icon={<CheckSquare className="text-amber-400" size={24} />}
                    color="from-amber-500/10 to-amber-500/5 border-amber-500/20"
                    iconBg="bg-amber-500/20"
                />
                <StatCard
                    title="Total Recebido"
                    value={formatCurrency(stats.totalReceived)}
                    icon={<DollarSign className="text-violet-400" size={24} />}
                    color="from-violet-500/10 to-violet-500/5 border-violet-500/20"
                    iconBg="bg-violet-500/20"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                <div className="lg:col-span-2 bg-neutral-950 p-6 md:p-8 rounded-2xl border border-white/5 shadow-xl">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-3">
                            <div className="p-2 bg-white/5 rounded-lg text-cyan-400 border border-white/5">
                                <Calendar size={20} />
                            </div>
                            Próximos Vencimentos
                        </h2>
                        <button className="text-xs text-cyan-400 hover:text-cyan-300 font-bold uppercase tracking-wider transition-colors">Ver todos</button>
                    </div>

                    <div className="space-y-3">
                        {projects
                            .filter(p => p.status === 'Ativo' && p.dueDate)
                            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                            .slice(0, 5)
                            .map(project => (
                                <div key={project.id} className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-black hover:bg-white/5 rounded-xl border border-white/5 hover:border-cyan-500/30 transition-all duration-300">
                                    <div className="flex items-center gap-4 mb-3 sm:mb-0">
                                        <div className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-slate-400 font-bold text-sm border border-white/5 group-hover:border-cyan-500/30 group-hover:text-cyan-400 transition-colors">
                                            {project.clientName.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-200 group-hover:text-white transition-colors">{project.name}</div>
                                            <div className="text-xs text-slate-500 uppercase tracking-wider">{project.clientName}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between sm:justify-end gap-6 pl-14 sm:pl-0">
                                        <div className="text-right">
                                            <div className="text-[10px] text-slate-600 uppercase font-bold tracking-widest">Valor</div>
                                            <div className="font-mono font-bold text-slate-300">{formatCurrency(project.value)}</div>
                                        </div>
                                        <div className="text-right min-w-[80px]">
                                            <div className="text-[10px] text-slate-600 uppercase font-bold tracking-widest">Vence em</div>
                                            <div className="text-xs font-bold text-rose-400 bg-rose-950/30 px-2 py-1 rounded border border-rose-500/20 inline-block mt-1">
                                                {formatDate(project.dueDate)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        {projects.filter(p => p.status === 'Ativo').length === 0 && (
                            <div className="text-center text-slate-600 py-12 bg-black/50 rounded-xl border border-dashed border-white/5">
                                <div className="mb-2 opacity-50">🎉</div>
                                <span className="text-sm">Nenhum projeto ativo com vencimento próximo.</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-neutral-950 p-6 md:p-8 rounded-2xl border border-white/5 shadow-xl flex flex-col">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                        <div className="p-2 bg-white/5 rounded-lg text-emerald-400 border border-white/5">
                            <MessageCircle size={20} />
                        </div>
                        Ações Rápidas
                    </h2>
                    <div className="grid grid-cols-1 gap-4 flex-1">
                        <button
                            onClick={() => { setFormData({}); onOpenProjectModal(); }}
                            className="group relative p-6 bg-gradient-to-r from-cyan-950 to-blue-950 rounded-xl border border-cyan-500/20 hover:border-cyan-500/50 transition-all duration-300 overflow-hidden text-left shadow-lg shadow-cyan-900/10 hover:shadow-cyan-500/20"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity transform group-hover:scale-110 duration-500">
                                <Briefcase size={80} className="text-cyan-400" />
                            </div>
                            <div className="relative z-10 flex items-center gap-4">
                                <div className="bg-cyan-500/10 w-12 h-12 rounded-lg flex items-center justify-center backdrop-blur-sm border border-cyan-500/20 group-hover:bg-cyan-500/20 transition-colors">
                                    <Plus size={24} className="text-cyan-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">Novo Projeto</h3>
                                    <p className="text-slate-400 text-xs uppercase tracking-wide group-hover:text-slate-300">Iniciar novo trabalho</p>
                                </div>
                            </div>
                        </button>

                        <button
                            onClick={() => { setFormData({}); onOpenClientModal(); }}
                            className="group relative p-6 bg-gradient-to-r from-violet-950 to-fuchsia-950 rounded-xl border border-violet-500/20 hover:border-violet-500/50 transition-all duration-300 overflow-hidden text-left shadow-lg shadow-violet-900/10 hover:shadow-violet-500/20"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity transform group-hover:scale-110 duration-500">
                                <Users size={80} className="text-violet-400" />
                            </div>
                            <div className="relative z-10 flex items-center gap-4">
                                <div className="bg-violet-500/10 w-12 h-12 rounded-lg flex items-center justify-center backdrop-blur-sm border border-violet-500/20 group-hover:bg-violet-500/20 transition-colors">
                                    <Plus size={24} className="text-violet-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white group-hover:text-violet-400 transition-colors">Novo Cliente</h3>
                                    <p className="text-slate-400 text-xs uppercase tracking-wide group-hover:text-slate-300">Cadastrar parceiro</p>
                                </div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
