import React, { useState } from 'react';
import { Plus, Users, MessageCircle, Edit, Trash2, CheckSquare, LayoutDashboard, Briefcase, LayoutList, Kanban } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils';
import ProjectDetailsModal from '../components/ProjectDetailsModal';
import KanbanBoard from '../components/KanbanBoard';
import { updateDoc, doc } from "firebase/firestore";

const Projects = ({ projects, onOpenProjectModal, setFormData, handleDeleteProject, handleTaskToggle, handleAddTask, handleSendWhatsApp, db, appId, user }) => {
    const [selectedProject, setSelectedProject] = useState(null);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'kanban'

    const handleUpdateStatus = async (projectId, newStatus) => {
        if (!user) return;
        try {
            await updateDoc(doc(db, 'users', user.uid, 'projects', projectId), {
                status: newStatus
            });
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    return (
        <div className="pb-20 md:pb-0">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Projetos</h1>
                    <p className="text-slate-400 mt-1">Acompanhe o progresso e faturamento.</p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    {/* View Toggle */}
                    <div className="bg-neutral-900 p-1 rounded-xl border border-white/10 flex items-center">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                            title="Lista"
                        >
                            <LayoutList size={20} />
                        </button>
                        <button
                            onClick={() => setViewMode('kanban')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'kanban' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                            title="Kanban"
                        >
                            <Kanban size={20} />
                        </button>
                    </div>

                    <button
                        onClick={() => { setFormData({}); onOpenProjectModal(); }}
                        className="flex-1 sm:flex-none bg-white text-black hover:bg-cyan-400 px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] font-bold uppercase tracking-wider text-sm"
                    >
                        <Plus size={20} /> <span className="hidden sm:inline">Novo Projeto</span><span className="sm:hidden">Novo</span>
                    </button>
                </div>
            </div>

            {viewMode === 'kanban' ? (
                <KanbanBoard
                    projects={projects}
                    onUpdateStatus={handleUpdateStatus}
                    onOpenProjectModal={(project) => { setFormData(project); onOpenProjectModal(); }}
                />
            ) : (
                <div className="space-y-6">
                    {Array.isArray(projects) && projects.map(project => (
                        <div key={project.id} className="bg-neutral-950 rounded-2xl border border-white/5 overflow-hidden hover:border-cyan-500/30 transition-all duration-300 shadow-xl group">
                            <div className="p-6 md:p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-3 mb-3">
                                        <h3 className="text-xl md:text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors">{project.name}</h3>
                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${project.status === 'Ativo' ? 'bg-emerald-950/30 text-emerald-400 border-emerald-500/20' :
                                            project.status === 'Pendente' ? 'bg-amber-950/30 text-amber-400 border-amber-500/20' :
                                                project.status === 'Atrasado' ? 'bg-rose-950/30 text-rose-400 border-rose-500/20' :
                                                    'bg-blue-950/30 text-blue-400 border-blue-500/20'
                                            }`}>
                                            {project.status}
                                        </span>
                                        <span className="px-3 py-1 bg-white/5 text-slate-400 rounded-lg text-[10px] font-bold border border-white/5 uppercase tracking-widest">
                                            {project.type === 'mensal' ? 'Recorrente' : 'Único'}
                                        </span>
                                    </div>
                                    <p className="text-slate-500 text-sm flex items-center gap-2 font-medium uppercase tracking-wide">
                                        <Users size={14} className="text-cyan-500" /> {project.clientName}
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 bg-black/50 p-4 rounded-xl border border-white/5">
                                    <div className="flex w-full sm:w-auto justify-between sm:justify-end gap-8">
                                        <div className="text-left sm:text-right">
                                            <div className="text-[10px] text-slate-600 uppercase font-bold tracking-widest mb-1">Vencimento</div>
                                            <div className="font-bold text-slate-200">{formatDate(project.dueDate)}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] text-slate-600 uppercase font-bold tracking-widest mb-1">Valor</div>
                                            <div className="font-mono font-bold text-cyan-400 text-xl">{formatCurrency(project.value)}</div>
                                        </div>
                                    </div>

                                    <div className="flex w-full sm:w-auto gap-2 pt-2 sm:pt-0 sm:pl-6 sm:border-l border-white/10">
                                        <button
                                            onClick={() => setSelectedProject(project)}
                                            className="bg-white/10 hover:bg-white/20 text-white py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium text-xs uppercase tracking-wider"
                                        >
                                            <LayoutDashboard size={16} /> <span>Detalhes</span>
                                        </button>
                                        <button
                                            onClick={() => handleSendWhatsApp(project)}
                                            className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 font-medium text-xs uppercase tracking-wider"
                                            title="Enviar fatura por WhatsApp"
                                        >
                                            <MessageCircle size={16} /> <span>Cobrar</span>
                                        </button>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => { setFormData(project); onOpenProjectModal(); }}
                                                className="p-2.5 text-slate-400 hover:bg-white/10 hover:text-white rounded-lg border border-white/5 bg-black transition-colors"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteProject(project.id)}
                                                className="p-2.5 text-slate-400 hover:bg-rose-950/30 hover:text-rose-400 rounded-lg border border-white/5 bg-black transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tasks Section */}
                            <div className="p-6 md:p-8 bg-black/30">
                                <div className="mb-4 flex justify-between items-center">
                                    <h4 className="font-bold text-slate-500 text-[10px] uppercase tracking-widest flex items-center gap-2">
                                        <CheckSquare size={14} className="text-cyan-500" /> Tarefas & Pendências
                                    </h4>
                                    <span className="text-xs font-bold bg-white/5 text-slate-300 px-3 py-1 rounded-full border border-white/5">
                                        {project.tasks?.filter(t => t.done).length || 0} / {project.tasks?.length || 0}
                                    </span>
                                </div>

                                <div className="space-y-2 mb-6">
                                    {project.tasks && project.tasks.map((task, idx) => (
                                        <label key={idx} className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/5 hover:border-cyan-500/30 cursor-pointer transition-all group">
                                            <div className="relative flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={task.done}
                                                    onChange={() => handleTaskToggle(project, idx)}
                                                    className="peer appearance-none w-5 h-5 border-2 border-slate-700 rounded bg-black checked:bg-cyan-500 checked:border-cyan-500 transition-colors cursor-pointer"
                                                />
                                                <CheckSquare size={12} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-black opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
                                            </div>
                                            <span className={`text-sm font-medium leading-tight pt-0.5 transition-colors ${task.done ? 'text-slate-600 line-through decoration-slate-700' : 'text-slate-300 group-hover:text-white'}`}>
                                                {task.desc}
                                            </span>
                                        </label>
                                    ))}
                                    {(!project.tasks || project.tasks.length === 0) && (
                                        <p className="text-sm text-slate-600 italic pl-1">Nenhuma tarefa registrada para este projeto.</p>
                                    )}
                                </div>

                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        placeholder="Adicionar nova tarefa..."
                                        className="flex-1 text-sm bg-black border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                handleAddTask(project, e.target.value);
                                                e.target.value = '';
                                            }
                                        }}
                                    />
                                    <button className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-6 rounded-xl border border-white/5 transition-colors uppercase tracking-wider">
                                        Adicionar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {projects.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-24 text-slate-600 bg-neutral-900/20 rounded-3xl border border-dashed border-white/5">
                            <Briefcase size={48} className="mb-4 opacity-20" />
                            <p>Nenhum projeto criado.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Project Details Modal */}
            {selectedProject && (
                <ProjectDetailsModal
                    isOpen={!!selectedProject}
                    onClose={() => setSelectedProject(null)}
                    project={selectedProject}
                    onUpdateProject={() => { }} // Pass empty function or implement update logic if needed
                    db={db}
                    appId={appId}
                    user={user}
                />
            )}
        </div>
    );
};

export default Projects;
