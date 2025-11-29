import React from 'react';
import { Plus, Edit, Trash2, MessageCircle, Users } from 'lucide-react';

const Clients = ({ clients, onOpenClientModal, setFormData, handleDeleteClient }) => {
    return (
        <div className="pb-20 md:pb-0">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Clientes</h1>
                    <p className="text-slate-400 mt-1">Gerencie sua base de contatos e empresas.</p>
                </div>
                <button
                    onClick={() => { setFormData({}); onOpenClientModal(); }}
                    className="w-full sm:w-auto bg-white text-black hover:bg-cyan-400 px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] font-bold uppercase tracking-wider text-sm"
                >
                    <Plus size={20} /> Adicionar Cliente
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clients.map(client => (
                    <div key={client.id} className="bg-neutral-950 p-6 rounded-2xl border border-white/5 hover:border-cyan-500/30 transition-all duration-300 group relative overflow-hidden shadow-xl">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-cyan-500/10 transition-colors"></div>

                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center text-xl font-bold text-white shadow-inner border border-white/10 group-hover:border-cyan-500/30 group-hover:text-cyan-400 transition-colors">
                                {client.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-4 group-hover:translate-x-0">
                                <button onClick={() => { setFormData(client); onOpenClientModal(); }} className="p-2 text-slate-400 hover:bg-white/10 hover:text-white rounded-lg transition-colors">
                                    <Edit size={18} />
                                </button>
                                <button onClick={() => handleDeleteClient(client.id)} className="p-2 text-slate-400 hover:bg-rose-950/30 hover:text-rose-400 rounded-lg transition-colors">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="relative z-10">
                            <h3 className="text-xl font-bold text-white mb-1 truncate group-hover:text-cyan-400 transition-colors">{client.name}</h3>
                            <p className="text-[10px] text-cyan-400 mb-6 font-bold uppercase tracking-widest inline-block bg-cyan-950/30 px-3 py-1 rounded-lg border border-cyan-500/20">
                                {client.company || 'Pessoa Física'}
                            </p>

                            <div className="space-y-3">
                                <a href={`https://wa.me/55${client.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-slate-400 hover:text-emerald-400 transition-colors p-2 hover:bg-emerald-950/20 rounded-lg -mx-2 group/link">
                                    <div className="p-1.5 bg-black rounded-md text-emerald-500 border border-white/5 group-hover/link:border-emerald-500/30 transition-colors">
                                        <MessageCircle size={16} />
                                    </div>
                                    <span className="font-medium text-sm">{client.phone}</span>
                                </a>
                                <div className="flex items-center gap-3 text-slate-400 p-2 -mx-2">
                                    <div className="p-1.5 bg-black rounded-md text-slate-500 border border-white/5">
                                        <span className="font-bold text-xs">@</span>
                                    </div>
                                    <span className="truncate text-sm">{client.email || 'Sem email'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                {clients.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-24 text-slate-600 bg-neutral-900/20 rounded-3xl border border-dashed border-white/5">
                        <Users size={48} className="mb-4 opacity-20" />
                        <p>Nenhum cliente cadastrado.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Clients;
