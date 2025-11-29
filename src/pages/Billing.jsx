import React, { useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils';

const Billing = ({ projects, clients }) => {
    const [selectedClientId, setSelectedClientId] = useState('');
    const [selectedProjectId, setSelectedProjectId] = useState('');

    const clientProjects = projects.filter(p => p.clientId === selectedClientId);
    const selectedProject = projects.find(p => p.id === selectedProjectId);
    const selectedClient = clients.find(c => c.id === selectedClientId);

    const handleSendWhatsApp = (type) => {
        if (!selectedClient || !selectedProject) return;

        let message = '';
        const phone = selectedClient.phone.replace(/\D/g, '');
        const projectValue = formatCurrency(selectedProject.value);
        const dueDate = formatDate(selectedProject.dueDate);

        if (type === 'invoice') {
            message = `Olá *${selectedClient.name}*,\n\nSegue a fatura referente ao projeto *${selectedProject.name}*.\n\nValor: *${projectValue}*\nVencimento: *${dueDate}*\n\nQualquer dúvida estou à disposição!`;
        } else if (type === 'reminder') {
            message = `Olá *${selectedClient.name}*, passando para lembrar sobre o vencimento do projeto *${selectedProject.name}* em *${dueDate}*.\n\nValor: *${projectValue}*`;
        } else if (type === 'overdue') {
            message = `Olá *${selectedClient.name}*, não identificamos o pagamento do projeto *${selectedProject.name}* (Vencimento: ${dueDate}).\n\nPoderia verificar, por favor?`;
        }

        window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(message)}`, '_blank');
    };

    return (
        <div className="pb-20 md:pb-0">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white tracking-tight">Cobrar</h1>
                <p className="text-slate-400 mt-1">Envie cobranças e lembretes via WhatsApp.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Selection Panel */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-neutral-900/50 p-6 rounded-2xl border border-white/5">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">1. Selecione o Cliente</label>
                        <select
                            className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                            value={selectedClientId}
                            onChange={e => { setSelectedClientId(e.target.value); setSelectedProjectId(''); }}
                        >
                            <option value="">Selecione...</option>
                            {clients.map(client => (
                                <option key={client.id} value={client.id}>{client.name}</option>
                            ))}
                        </select>
                    </div>

                    {selectedClientId && (
                        <div className="bg-neutral-900/50 p-6 rounded-2xl border border-white/5 animate-in slide-in-from-top-4 duration-300">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">2. Selecione o Projeto</label>
                            <select
                                className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                                value={selectedProjectId}
                                onChange={e => setSelectedProjectId(e.target.value)}
                            >
                                <option value="">Selecione...</option>
                                {clientProjects.map(project => (
                                    <option key={project.id} value={project.id}>{project.name}</option>
                                ))}
                            </select>
                            {clientProjects.length === 0 && (
                                <p className="text-xs text-rose-400 mt-2 pl-1">Este cliente não tem projetos.</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Action Panel */}
                <div className="lg:col-span-2">
                    {selectedProject && selectedClient ? (
                        <div className="bg-neutral-900/50 p-8 rounded-2xl border border-white/5 animate-in zoom-in duration-300 relative overflow-hidden">
                            {/* Decorative gradient */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                            <div className="flex items-center gap-4 mb-8 pb-8 border-b border-white/5 relative">
                                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                                    <MessageCircle size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Enviar Mensagem</h2>
                                    <p className="text-slate-400 text-sm">Para: <span className="text-white font-medium">{selectedClient.name}</span> ({selectedClient.phone})</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                                <button
                                    onClick={() => handleSendWhatsApp('invoice')}
                                    className="p-6 bg-black/40 hover:bg-cyan-950/20 border border-white/5 hover:border-cyan-500/50 rounded-xl text-left transition-all group hover:shadow-[0_0_20px_rgba(34,211,238,0.1)]"
                                >
                                    <div className="font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors flex items-center gap-2">
                                        Enviar Fatura
                                    </div>
                                    <p className="text-sm text-slate-500 group-hover:text-slate-400">Mensagem padrão com valor e vencimento.</p>
                                </button>

                                <button
                                    onClick={() => handleSendWhatsApp('reminder')}
                                    className="p-6 bg-black/40 hover:bg-amber-950/20 border border-white/5 hover:border-amber-500/50 rounded-xl text-left transition-all group hover:shadow-[0_0_20px_rgba(245,158,11,0.1)]"
                                >
                                    <div className="font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">Lembrete de Vencimento</div>
                                    <p className="text-sm text-slate-500 group-hover:text-slate-400">Aviso amigável sobre o vencimento próximo.</p>
                                </button>

                                <button
                                    onClick={() => handleSendWhatsApp('overdue')}
                                    className="p-6 bg-black/40 hover:bg-rose-950/20 border border-white/5 hover:border-rose-500/50 rounded-xl text-left transition-all group hover:shadow-[0_0_20px_rgba(244,63,94,0.1)]"
                                >
                                    <div className="font-bold text-white mb-2 group-hover:text-rose-400 transition-colors">Cobrança de Atraso</div>
                                    <p className="text-sm text-slate-500 group-hover:text-slate-400">Mensagem para pagamentos não identificados.</p>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-600 bg-neutral-900/20 rounded-2xl border border-dashed border-white/10 p-12">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                <Send size={32} className="opacity-20" />
                            </div>
                            <p className="text-sm">Selecione um cliente e projeto para ver as opções.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Billing;
