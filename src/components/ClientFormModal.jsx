import React from 'react';
import Modal from './Modal';

const ClientFormModal = ({ isOpen, onClose, formData, setFormData, onSave }) => {
    if (!isOpen) return null;

    return (
        <Modal title={formData.id ? "Editar Cliente" : "Novo Cliente"} onClose={onClose}>
            <form onSubmit={onSave} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nome Completo</label>
                    <input required className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all placeholder:text-slate-700" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Empresa (Opcional)</label>
                    <input className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all placeholder:text-slate-700" value={formData.company || ''} onChange={e => setFormData({ ...formData, company: e.target.value })} />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">CPF</label>
                    <input placeholder="000.000.000-00" className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all placeholder:text-slate-700" value={formData.cpf || ''} onChange={e => setFormData({ ...formData, cpf: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email</label>
                        <input type="email" className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all placeholder:text-slate-700" value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">WhatsApp</label>
                        <input required placeholder="(00) 00000-0000" className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all placeholder:text-slate-700" value={formData.phone || ''} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                    </div>
                </div>
                <button type="submit" className="w-full bg-white text-black font-bold py-3.5 rounded-xl transition-all hover:bg-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] mt-2 uppercase tracking-wider text-sm">
                    {formData.id ? 'Salvar Alterações' : 'Cadastrar Cliente'}
                </button>
            </form>
        </Modal>
    );
};

export default ClientFormModal;
