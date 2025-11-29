import React, { useState, useMemo } from 'react';
import { FileText, Calendar, User, ChevronRight, CheckCircle2 } from 'lucide-react';
import ProjectDetailsModal from '../components/ProjectDetailsModal';
import { formatCurrency } from '../utils';

const Contracts = ({ projects, clients, onOpenProjectModal, setProjectModalTab, setSelectedProject, db, appId, user }) => {
    const [selectedClientId, setSelectedClientId] = useState('');
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [selectedProjectForModal, setSelectedProjectForModal] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    // Filter projects based on selected client
    const clientProjects = useMemo(() => {
        if (!selectedClientId) return [];
        return projects.filter(p => p.clientId === selectedClientId);
    }, [projects, selectedClientId]);

    const selectedClient = clients.find(c => c.id === selectedClientId);
    const selectedProjectData = projects.find(p => p.id === selectedProjectId);

    const handleOpenContract = () => {
        if (!selectedProjectData) return;
        setSelectedProjectForModal(selectedProjectData);
        setIsDetailsModalOpen(true);
    };

    return (
        <div className="pb-20 md:pb-0 max-w-4xl mx-auto">
            <header className="mb-12 text-center">
                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">Gerador de Contratos</h1>
                <p className="text-slate-400">Selecione o cliente e o projeto para emitir o documento.</p>
            </header>

            <div className="grid md:grid-cols-2 gap-8 items-start">
                {/* Selection Panel */}
                <div className="bg-neutral-950 border border-white/10 rounded-3xl p-8 space-y-8 shadow-2xl relative overflow-hidden">


                    {/* Step 1: Select Client */}
                    <div className="relative">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${selectedClientId ? 'bg-cyan-500 text-black' : 'bg-white/10 text-slate-500'}`}>1</div>
                            <label className="text-sm font-bold text-slate-300 uppercase tracking-wider">Selecione o Cliente</label>
                        </div>
                        <select
                            className="w-full bg-black border border-white/10 rounded-xl p-4 text-white focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all appearance-none cursor-pointer hover:border-white/20"
                            value={selectedClientId}
                            onChange={(e) => {
                                setSelectedClientId(e.target.value);
                                setSelectedProjectId(''); // Reset project when client changes
                            }}
                        >
                            <option value="">-- Escolha um cliente --</option>
                            {clients.map(client => (
                                <option key={client.id} value={client.id}>{client.name} {client.company ? `(${client.company})` : ''}</option>
                            ))}
                        </select>
                    </div>

                    {/* Step 2: Select Project */}
                    <div className={`relative transition-opacity duration-500 ${!selectedClientId ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${selectedProjectId ? 'bg-cyan-500 text-black' : 'bg-white/10 text-slate-500'}`}>2</div>
                            <label className="text-sm font-bold text-slate-300 uppercase tracking-wider">Selecione o Projeto</label>
                        </div>
                        <select
                            className="w-full bg-black border border-white/10 rounded-xl p-4 text-white focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all appearance-none cursor-pointer hover:border-white/20"
                            value={selectedProjectId}
                            onChange={(e) => setSelectedProjectId(e.target.value)}
                            disabled={!selectedClientId}
                        >
                            <option value="">-- Escolha um projeto --</option>
                            {clientProjects.map(project => (
                                <option key={project.id} value={project.id}>{project.name}</option>
                            ))}
                        </select>
                        {selectedClientId && clientProjects.length === 0 && (
                            <p className="text-xs text-rose-400 mt-2 pl-1">Este cliente não possui projetos cadastrados.</p>
                        )}
                    </div>
                </div>

                {/* Preview / Action Panel */}
                <div className="space-y-6">
                    {selectedProjectData ? (
                        <div className="bg-neutral-950 border border-cyan-500/30 rounded-3xl p-8 shadow-[0_0_30px_rgba(34,211,238,0.1)] relative overflow-hidden group">
                            <div className="absolute -right-10 -top-10 text-cyan-500/5 group-hover:text-cyan-500/10 transition-colors duration-500">
                                <FileText size={200} />
                            </div>

                            <h3 className="text-xl font-bold text-white mb-1">{selectedProjectData.name}</h3>
                            <p className="text-cyan-400 text-sm font-bold uppercase tracking-widest mb-6">{selectedClient?.name}</p>

                            <div className="space-y-4 mb-8">
                                <div className="flex items-center gap-3 text-slate-400 bg-white/5 p-3 rounded-xl border border-white/5">
                                    <Calendar size={18} className="text-cyan-500" />
                                    <span className="text-sm">Início: <span className="text-white font-medium">{selectedProjectData.startDate ? new Date(selectedProjectData.startDate).toLocaleDateString('pt-BR') : 'N/A'}</span></span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-400 bg-white/5 p-3 rounded-xl border border-white/5">
                                    <User size={18} className="text-cyan-500" />
                                    <span className="text-sm">CPF/CNPJ: <span className="text-white font-medium">{selectedClient?.cpf || 'Não informado'}</span></span>
                                </div>
                            </div>

                            <button
                                onClick={handleOpenContract}
                                className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-cyan-400 transition-all uppercase tracking-wider text-sm shadow-lg hover:shadow-cyan-500/30 flex items-center justify-center gap-2 group-hover:scale-[1.02]"
                            >
                                <FileText size={18} />
                                Gerar Contrato Agora
                            </button>
                        </div>
                    ) : (
                        <div className="h-full min-h-[300px] bg-neutral-900/20 border border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center text-slate-600 p-8 text-center">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                <FileText size={32} className="opacity-20" />
                            </div>
                            <p className="text-sm">Selecione um cliente e um projeto para visualizar os detalhes e gerar o contrato.</p>
                        </div>
                    )}
                </div>
            </div>

            <ProjectDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                project={selectedProjectForModal}
                clients={clients} // Pass clients to modal
                onUpdateProject={() => { }}
                db={db}
                appId={appId}
                user={user}
                initialTab="contract"
            />
        </div>
    );
};

export default Contracts;
