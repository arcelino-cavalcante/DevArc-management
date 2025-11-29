import React, { useState } from 'react';
import { CheckSquare, Plus, Trash2, RefreshCw } from 'lucide-react';
import { doc, updateDoc } from "firebase/firestore";

const Updates = ({ projects, db, appId, user }) => {
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [newTask, setNewTask] = useState('');

    const selectedProject = projects.find(p => p.id === selectedProjectId);

    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!newTask.trim() || !selectedProject) return;

        const newTasks = [...(selectedProject.tasks || []), { desc: newTask, done: false }];
        try {
            await updateDoc(doc(db, 'users', user.uid, 'projects', selectedProject.id), {
                tasks: newTasks
            });
            setNewTask('');
        } catch (error) {
            console.error("Erro ao adicionar tarefa:", error);
        }
    };

    const handleToggleTask = async (index) => {
        if (!selectedProject) return;
        const newTasks = [...(selectedProject.tasks || [])];
        newTasks[index].done = !newTasks[index].done;

        try {
            await updateDoc(doc(db, 'users', user.uid, 'projects', selectedProject.id), {
                tasks: newTasks
            });
        } catch (error) {
            console.error("Erro ao atualizar tarefa:", error);
        }
    };

    const handleDeleteTask = async (index) => {
        if (!selectedProject) return;
        const newTasks = [...(selectedProject.tasks || [])].filter((_, i) => i !== index);

        try {
            await updateDoc(doc(db, 'users', user.uid, 'projects', selectedProject.id), {
                tasks: newTasks
            });
        } catch (error) {
            console.error("Erro ao deletar tarefa:", error);
        }
    };

    return (
        <div className="pb-20 md:pb-0">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white tracking-tight">Atualizações</h1>
                <p className="text-slate-400 mt-1">Gerencie tarefas e o progresso dos projetos.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Project List */}
                <div className="lg:col-span-1 bg-neutral-900/50 rounded-2xl border border-white/5 p-4 h-fit">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 px-2">Selecione um Projeto</h3>
                    <div className="space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
                        {projects.map(project => (
                            <button
                                key={project.id}
                                onClick={() => setSelectedProjectId(project.id)}
                                className={`w-full text-left p-4 rounded-xl border transition-all ${selectedProjectId === project.id
                                    ? 'bg-cyan-950/30 border-cyan-500/50 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.1)]'
                                    : 'bg-black/40 border-white/5 text-slate-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <div className="font-bold truncate">{project.name}</div>
                                <div className="text-[10px] font-bold uppercase tracking-wider opacity-70 mt-1">
                                    {project.tasks?.filter(t => t.done).length || 0} / {project.tasks?.length || 0} tarefas
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Task Board */}
                <div className="lg:col-span-2">
                    {selectedProject ? (
                        <div className="space-y-6">
                            {/* Add Task */}
                            <div className="bg-neutral-900/50 p-6 rounded-2xl border border-white/5">
                                <form onSubmit={handleAddTask} className="flex gap-4">
                                    <input
                                        type="text"
                                        placeholder="O que precisa ser feito?"
                                        className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all placeholder:text-slate-700"
                                        value={newTask}
                                        onChange={e => setNewTask(e.target.value)}
                                    />
                                    <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-black px-6 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-cyan-900/20 uppercase tracking-wider text-sm">
                                        <Plus size={18} /> Adicionar
                                    </button>
                                </form>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* To Do Column */}
                                <div className="bg-neutral-900/30 p-6 rounded-2xl border border-white/5 min-h-[300px]">
                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div> A Fazer
                                    </h3>
                                    <div className="space-y-3">
                                        {selectedProject.tasks?.map((task, idx) => !task.done && (
                                            <div key={idx} className="bg-black/40 p-4 rounded-xl border border-white/5 flex justify-between items-start group hover:border-cyan-500/30 transition-all">
                                                <span className="text-slate-300 text-sm">{task.desc}</span>
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => handleToggleTask(idx)} className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors">
                                                        <CheckSquare size={16} />
                                                    </button>
                                                    <button onClick={() => handleDeleteTask(idx)} className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {(!selectedProject.tasks || selectedProject.tasks.filter(t => !t.done).length === 0) && (
                                            <div className="text-center py-8 text-slate-700 text-xs font-bold uppercase tracking-widest">Nada pendente</div>
                                        )}
                                    </div>
                                </div>

                                {/* Done Column */}
                                <div className="bg-neutral-900/30 p-6 rounded-2xl border border-white/5 min-h-[300px]">
                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div> Concluído
                                    </h3>
                                    <div className="space-y-3">
                                        {selectedProject.tasks?.map((task, idx) => task.done && (
                                            <div key={idx} className="bg-black/20 p-4 rounded-xl border border-white/5 flex justify-between items-start group">
                                                <span className="text-slate-600 text-sm line-through">{task.desc}</span>
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => handleToggleTask(idx)} className="p-1.5 text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors">
                                                        <RefreshCw size={16} />
                                                    </button>
                                                    <button onClick={() => handleDeleteTask(idx)} className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {(!selectedProject.tasks || selectedProject.tasks.filter(t => t.done).length === 0) && (
                                            <div className="text-center py-8 text-slate-700 text-xs font-bold uppercase tracking-widest">Nada concluído</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-600 bg-neutral-900/20 rounded-2xl border border-dashed border-white/10 p-12">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                <CheckSquare size={32} className="opacity-20" />
                            </div>
                            <p className="text-sm">Selecione um projeto para gerenciar tarefas.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Updates;
