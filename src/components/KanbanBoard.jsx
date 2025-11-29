import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Clock, CheckCircle2, AlertCircle, PlayCircle } from 'lucide-react';

const KanbanBoard = ({ projects, onUpdateStatus, onOpenProjectModal }) => {
    const columns = {
        'Pendente': {
            id: 'Pendente',
            title: 'Pendente',
            icon: <Clock size={18} className="text-amber-400" />,
            color: 'bg-amber-500/10 border-amber-500/20 text-amber-400'
        },
        'Ativo': {
            id: 'Ativo',
            title: 'Em Andamento',
            icon: <PlayCircle size={18} className="text-cyan-400" />,
            color: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
        },
        'Concluído': {
            id: 'Concluído',
            title: 'Concluído',
            icon: <CheckCircle2 size={18} className="text-emerald-400" />,
            color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
        }
    };

    // Helper to group projects by status
    const getProjectsByStatus = (status) => {
        if (status === 'Pendente') {
            return projects.filter(p => p.status === 'Pendente' || p.status === 'Atrasado');
        }
        return projects.filter(p => p.status === status);
    };

    const onDragEnd = (result) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        const newStatus = destination.droppableId;
        onUpdateStatus(draggableId, newStatus);
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex flex-col md:flex-row gap-6 overflow-x-auto pb-4 h-[calc(100vh-12rem)]">
                {Object.values(columns).map((column) => (
                    <div key={column.id} className="flex-1 min-w-[300px] flex flex-col bg-neutral-900/50 rounded-2xl border border-white/5 backdrop-blur-sm">
                        {/* Column Header */}
                        <div className={`p-4 border-b border-white/5 flex items-center justify-between ${column.color} bg-opacity-5 rounded-t-2xl`}>
                            <div className="flex items-center gap-3">
                                {column.icon}
                                <h3 className="font-bold tracking-wide text-sm uppercase">{column.title}</h3>
                            </div>
                            <span className="text-xs font-bold bg-black/40 px-2 py-1 rounded-lg border border-white/5">
                                {getProjectsByStatus(column.id).length}
                            </span>
                        </div>

                        {/* Droppable Area */}
                        <Droppable droppableId={column.id}>
                            {(provided, snapshot) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className={`flex-1 p-3 space-y-3 overflow-y-auto transition-colors ${snapshot.isDraggingOver ? 'bg-white/5' : ''}`}
                                >
                                    {getProjectsByStatus(column.id).map((project, index) => (
                                        <Draggable key={project.id} draggableId={project.id} index={index}>
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    onClick={() => onOpenProjectModal(project)}
                                                    className={`bg-black border border-white/10 p-4 rounded-xl shadow-lg group hover:border-cyan-500/30 transition-all cursor-grab active:cursor-grabbing relative overflow-hidden ${snapshot.isDragging ? 'rotate-2 scale-105 shadow-2xl border-cyan-500/50 z-50' : ''}`}
                                                    style={provided.draggableProps.style}
                                                >
                                                    {/* Status Indicator Line */}
                                                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${project.status === 'Concluído' ? 'bg-emerald-500' :
                                                            project.status === 'Ativo' ? 'bg-cyan-500' :
                                                                project.status === 'Atrasado' ? 'bg-rose-500' :
                                                                    'bg-amber-500'
                                                        }`}></div>

                                                    <div className="pl-3">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <h4 className="font-bold text-white text-sm line-clamp-2 group-hover:text-cyan-400 transition-colors">{project.name}</h4>
                                                            {project.status === 'Atrasado' && (
                                                                <div className="text-rose-400 bg-rose-950/30 px-1.5 py-0.5 rounded text-[10px] font-bold border border-rose-500/20 uppercase">
                                                                    Atrasado
                                                                </div>
                                                            )}
                                                        </div>

                                                        <p className="text-xs text-slate-500 mb-3 font-medium">{project.clientName}</p>

                                                        <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
                                                            <div className="text-[10px] text-slate-600 font-mono">
                                                                {new Date(project.startDate).toLocaleDateString('pt-BR')}
                                                            </div>
                                                            {project.value > 0 && (
                                                                <div className="text-[10px] font-bold text-emerald-400/80 bg-emerald-950/20 px-2 py-1 rounded border border-emerald-500/10">
                                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(project.value)}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </div>
                ))}
            </div>
        </DragDropContext>
    );
};

export default KanbanBoard;
