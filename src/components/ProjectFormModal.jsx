import React from 'react';
import Modal from './Modal';

const ProjectFormModal = ({ isOpen, onClose, formData, setFormData, onSave, clients }) => {
    if (!isOpen) return null;

    return (
        <Modal title={formData.id ? "Editar Projeto" : "Novo Projeto"} onClose={onClose}>
            <form onSubmit={onSave} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nome do Projeto</label>
                    <input required className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all placeholder:text-slate-700" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Cliente</label>
                    <select required className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all" value={formData.clientId || ''} onChange={e => {
                        const client = clients.find(c => c.id === e.target.value);
                        setFormData({ ...formData, clientId: e.target.value, clientName: client?.name || '' });
                    }}>
                        <option value="">Selecione um cliente...</option>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Data de Início</label>
                        <input required type="date" className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all" value={formData.startDate || ''} onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Status</label>
                        <select className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all" value={formData.status || 'Pendente'} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                            <option value="Pendente">Pendente</option>
                            <option value="Ativo">Ativo</option>
                            <option value="Concluído">Concluído</option>
                            <option value="Atrasado">Atrasado</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Descrição</label>
                    <textarea rows="3" className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all placeholder:text-slate-700" value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })}></textarea>
                </div>
                <button type="submit" className="w-full bg-white text-black font-bold py-3.5 rounded-xl transition-all hover:bg-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] mt-2 uppercase tracking-wider text-sm">
                    {formData.id ? 'Salvar Alterações' : 'Criar Projeto'}
                </button>
            </form>
        </Modal>
    );
};

export default ProjectFormModal;
