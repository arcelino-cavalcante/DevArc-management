import React, { useState, useEffect } from 'react';
import { Users, X, LayoutDashboard, DollarSign, Calendar, Trash2 } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, updateDoc, doc, serverTimestamp, getDoc } from "firebase/firestore";
import { db, appId } from '../lib/firebase';
import TabButton from './TabButton';
import { formatCurrency, formatDate } from '../utils';

const ProjectDetailsModal = ({ isOpen, onClose, project, clients, onUpdateProject, db, appId, user, initialTab = 'overview' }) => {
    if (!isOpen || !project) return null;

    const [activeTab, setActiveTab] = useState(initialTab);
    const [payments, setPayments] = useState([]);
    const [newPayment, setNewPayment] = useState({ value: '', date: '', note: '' });
    const [updates, setUpdates] = useState([]);
    const [newUpdate, setNewUpdate] = useState('');
    const [settings, setSettings] = useState(null);

    useEffect(() => {
        if (isOpen) {
            setActiveTab(initialTab);
        }
    }, [isOpen, initialTab]);

    useEffect(() => {
        if (!project || !user) return;

        const fetchSettings = async () => {
            try {
                const docRef = doc(db, 'users', user.uid, 'settings', 'general');
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setSettings(docSnap.data());
                }
            } catch (error) {
                console.error("Error fetching settings:", error);
            }
        };
        fetchSettings();

        const paymentsQuery = query(collection(db, 'users', user.uid, 'projects', project.id, 'payments'), orderBy('date', 'desc'));
        const unsubPayments = onSnapshot(paymentsQuery, (snapshot) => {
            setPayments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        const updatesQuery = query(collection(db, 'users', user.uid, 'projects', project.id, 'updates'), orderBy('createdAt', 'desc'));
        const unsubUpdates = onSnapshot(updatesQuery, (snapshot) => {
            setUpdates(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        return () => {
            unsubPayments();
            unsubUpdates();
        };
    }, [project, user]);

    const handleAddPayment = async (e) => {
        e.preventDefault();
        if (!newPayment.value || !newPayment.date) return;

        await addDoc(collection(db, 'users', user.uid, 'projects', project.id, 'payments'), {
            value: parseFloat(newPayment.value),
            date: newPayment.date,
            note: newPayment.note,
            createdAt: serverTimestamp()
        });

        // Update project total paid
        const currentTotal = payments.reduce((acc, curr) => acc + (curr.value || 0), 0);
        const newTotal = currentTotal + parseFloat(newPayment.value);
        await updateDoc(doc(db, 'users', user.uid, 'projects', project.id), {
            totalPaid: newTotal
        });

        setNewPayment({ value: '', date: '', note: '' });
    };

    const handleDeletePayment = async (id) => {
        if (!confirm('Remover este pagamento?')) return;

        const paymentToDelete = payments.find(p => p.id === id);
        await deleteDoc(doc(db, 'users', user.uid, 'projects', project.id, 'payments', id));

        if (paymentToDelete) {
            const currentTotal = payments.reduce((acc, curr) => acc + (curr.value || 0), 0);
            const newTotal = Math.max(0, currentTotal - (paymentToDelete.value || 0));
            await updateDoc(doc(db, 'users', user.uid, 'projects', project.id), {
                totalPaid: newTotal
            });
        }
    };

    const handleAddUpdate = async (e) => {
        e.preventDefault();
        if (!newUpdate.trim()) return;
        await addDoc(collection(db, 'users', user.uid, 'projects', project.id, 'updates'), {
            text: newUpdate,
            createdAt: serverTimestamp()
        });
        setNewUpdate('');
    };

    const totalPaid = payments.reduce((acc, curr) => acc + (curr.value || 0), 0);
    const progress = Math.min((totalPaid / (project.value || 1)) * 100, 100);

    return (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-neutral-950 w-full max-w-4xl h-[85vh] rounded-3xl border border-white/10 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in duration-200">

                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-start bg-black/50">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-2xl font-bold text-white tracking-tight">{project.name}</h2>
                            <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${project.status === 'Ativo' ? 'bg-emerald-950/30 text-emerald-400 border-emerald-500/20' :
                                project.status === 'Pendente' ? 'bg-amber-950/30 text-amber-400 border-amber-500/20' :
                                    'bg-white/5 text-slate-400 border-white/10'
                                }`}>
                                {project.status}
                            </span>
                        </div>
                        <p className="text-slate-400 flex items-center gap-2 text-sm">
                            <Users size={16} className="text-cyan-500" /> {project.clientName}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="px-6 pt-4 border-b border-white/10 flex gap-2 bg-black/50">
                    <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<LayoutDashboard size={18} />} label="Visão Geral" />
                    <TabButton active={activeTab === 'financials'} onClick={() => setActiveTab('financials')} icon={<DollarSign size={18} />} label="Financeiro" />
                    <TabButton active={activeTab === 'timeline'} onClick={() => setActiveTab('timeline')} icon={<Calendar size={18} />} label="Timeline" />
                    <TabButton active={activeTab === 'contract'} onClick={() => setActiveTab('contract')} icon={<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>} label="Contrato" />
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-black/30 custom-scrollbar">

                    {activeTab === 'overview' && (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="p-5 bg-neutral-900/50 rounded-2xl border border-white/5">
                                    <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Valor Total</div>
                                    <div className="text-2xl font-mono font-bold text-white">{formatCurrency(project.value)}</div>
                                </div>
                                <div className="p-5 bg-neutral-900/50 rounded-2xl border border-white/5">
                                    <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Total Recebido</div>
                                    <div className="text-2xl font-mono font-bold text-emerald-400">{formatCurrency(totalPaid)}</div>
                                </div>
                                <div className="p-5 bg-neutral-900/50 rounded-2xl border border-white/5">
                                    <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Pendente</div>
                                    <div className="text-2xl font-mono font-bold text-rose-400">{formatCurrency(project.value - totalPaid)}</div>
                                </div>
                            </div>

                            <div className="bg-neutral-900/30 p-6 rounded-2xl border border-white/5">
                                <h3 className="text-lg font-bold text-white mb-4">Progresso Financeiro</h3>
                                <div className="w-full bg-black rounded-full h-4 overflow-hidden border border-white/5">
                                    <div className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(34,211,238,0.3)]" style={{ width: `${progress}%` }}></div>
                                </div>
                                <div className="flex justify-between mt-2 text-xs text-slate-500 font-bold uppercase tracking-wider">
                                    <span>0%</span>
                                    <span>{progress.toFixed(0)}% Recebido</span>
                                    <span>100%</span>
                                </div>
                            </div>

                            <div className="bg-neutral-900/30 p-6 rounded-2xl border border-white/5">
                                <h3 className="text-lg font-bold text-white mb-4">Descrição do Projeto</h3>
                                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap text-sm">
                                    {project.description || "Nenhuma descrição fornecida."}
                                </p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'financials' && (
                        <div className="space-y-6">
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="flex-1 space-y-4">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <DollarSign size={20} className="text-emerald-400" /> Histórico de Pagamentos
                                    </h3>
                                    <div className="space-y-3">
                                        {payments.map(payment => (
                                            <div key={payment.id} className="flex justify-between items-center p-4 bg-neutral-900/50 rounded-xl border border-white/5 hover:border-emerald-500/30 transition-colors group">
                                                <div>
                                                    <div className="font-bold text-emerald-400 font-mono text-lg">{formatCurrency(payment.value)}</div>
                                                    <div className="text-xs text-slate-500 uppercase tracking-wider font-bold mt-1">{formatDate(payment.date)} • {payment.note || 'Sem nota'}</div>
                                                </div>
                                                <button onClick={() => handleDeletePayment(payment.id)} className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        ))}
                                        {payments.length === 0 && (
                                            <div className="text-center py-10 text-slate-600 bg-neutral-900/20 rounded-xl border border-dashed border-white/5 text-sm">
                                                Nenhum pagamento registrado.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="w-full md:w-80">
                                    <div className="bg-neutral-900/50 p-6 rounded-2xl border border-white/5 sticky top-0">
                                        <h3 className="text-lg font-bold text-white mb-4">Registrar Pagamento</h3>
                                        <form onSubmit={handleAddPayment} className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Valor</label>
                                                <input required type="number" step="0.01" className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none placeholder:text-slate-700" value={newPayment.value} onChange={e => setNewPayment({ ...newPayment, value: e.target.value })} />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Data</label>
                                                <input required type="date" className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none" value={newPayment.date} onChange={e => setNewPayment({ ...newPayment, date: e.target.value })} />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nota (Opcional)</label>
                                                <input type="text" className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none placeholder:text-slate-700" value={newPayment.note} onChange={e => setNewPayment({ ...newPayment, note: e.target.value })} />
                                            </div>
                                            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-emerald-900/20 uppercase tracking-wider text-sm">
                                                Adicionar Pagamento
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'timeline' && (
                        <div className="space-y-6">
                            <div className="bg-neutral-900/50 p-4 rounded-2xl border border-white/5">
                                <form onSubmit={handleAddUpdate} className="flex gap-4">
                                    <input
                                        type="text"
                                        placeholder="Adicionar uma atualização ou nota sobre o projeto..."
                                        className="flex-1 bg-black border border-white/10 rounded-xl p-3 text-white focus:ring-1 focus:ring-cyan-500 outline-none placeholder:text-slate-700"
                                        value={newUpdate}
                                        onChange={e => setNewUpdate(e.target.value)}
                                    />
                                    <button type="submit" className="bg-white text-black hover:bg-cyan-400 px-6 rounded-xl font-bold transition-all uppercase tracking-wider text-sm shadow-[0_0_10px_rgba(255,255,255,0.1)] hover:shadow-[0_0_15px_rgba(34,211,238,0.4)]">
                                        Postar
                                    </button>
                                </form>
                            </div>

                            <div className="relative pl-8 space-y-8 before:content-[''] before:absolute before:left-3 before:top-0 before:bottom-0 before:w-px before:bg-white/10">
                                {updates.map(update => (
                                    <div key={update.id} className="relative">
                                        <div className="absolute -left-[34px] top-1 w-7 h-7 rounded-full bg-black border-4 border-neutral-950 flex items-center justify-center shadow-[0_0_10px_rgba(34,211,238,0.2)]">
                                            <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                                        </div>
                                        <div className="bg-neutral-900/30 p-4 rounded-xl border border-white/5 hover:border-cyan-500/30 transition-colors">
                                            <p className="text-slate-300 mb-2 text-sm">{update.text}</p>
                                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                                {update.createdAt?.seconds ? new Date(update.createdAt.seconds * 1000).toLocaleString('pt-BR') : 'Agora'}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {updates.length === 0 && (
                                    <div className="text-slate-600 italic text-sm">Nenhuma atualização registrada.</div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'contract' && (
                        <div className="space-y-6">
                            <div className="flex justify-end">
                                <button
                                    onClick={() => window.print()}
                                    className="bg-white text-black hover:bg-cyan-400 px-6 py-2 rounded-xl font-bold transition-all uppercase tracking-wider text-sm shadow-[0_0_10px_rgba(255,255,255,0.1)] hover:shadow-[0_0_15px_rgba(34,211,238,0.4)] flex items-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                                    Imprimir Contrato
                                </button>
                            </div>
                            <div id="contract-area" className="bg-white text-black p-12 rounded-xl shadow-2xl max-w-3xl mx-auto font-serif leading-relaxed">
                                {/* Header with Logo */}
                                <div className="text-center mb-8 border-b-2 border-black pb-4">
                                    {settings?.company?.logo && (
                                        <div className="mb-4 flex justify-center">
                                            <img src={settings.company.logo} alt="Logo" className="h-20 object-contain" />
                                        </div>
                                    )}
                                    <h1 className="text-2xl font-bold uppercase">{settings?.company?.name || "DevArc"}</h1>
                                    <p className="text-xs text-gray-500">{settings?.company?.address || "Endereço não informado"}</p>
                                    <p className="text-xs text-gray-500">CNPJ: {settings?.company?.cnpj || "Não informado"} | Email: {settings?.company?.email || user.email}</p>
                                </div>

                                <div className="space-y-6 text-sm whitespace-pre-wrap">
                                    {(() => {
                                        const client = clients?.find(c => c.id === project.clientId);
                                        const template = settings?.contractTemplate || `CONTRATO DE PRESTAÇÃO DE SERVIÇOS

CONTRATANTE: {CLIENTE_NOME}, CPF/CNPJ: {CLIENTE_CPF}.
CONTRATADA: {EMPRESA_NOME}, CNPJ: {EMPRESA_CNPJ}.

1. DO OBJETO
O presente contrato tem por objeto a prestação de serviços de desenvolvimento de software, especificamente o projeto "{PROJETO_NOME}".

2. DO VALOR
O valor total é de {VALOR}.

3. DATA
{DATA}
`;
                                        let content = template;
                                        content = content.replace(/{CLIENTE_NOME}/g, project.clientName || '________________');
                                        content = content.replace(/{CLIENTE_CPF}/g, client?.cpf || '________________');
                                        content = content.replace(/{PROJETO_NOME}/g, project.name || '________________');
                                        content = content.replace(/{VALOR}/g, formatCurrency(project.value));
                                        content = content.replace(/{DATA}/g, new Date().toLocaleDateString('pt-BR'));
                                        content = content.replace(/{EMPRESA_NOME}/g, settings?.company?.name || 'DevArc');
                                        content = content.replace(/{EMPRESA_CNPJ}/g, settings?.company?.cnpj || '________________');
                                        content = content.replace(/{EMPRESA_ENDERECO}/g, settings?.company?.address || '________________');

                                        return content;
                                    })()}
                                </div>

                                <div className="mt-16 pt-8 grid grid-cols-2 gap-12">
                                    <div className="text-center border-t border-black pt-2">
                                        <p className="font-bold">{project.clientName}</p>
                                        <p className="text-xs">CONTRATANTE</p>
                                    </div>
                                    <div className="text-center border-t border-black pt-2">
                                        <p className="font-bold">{settings?.company?.name || "DevArc"}</p>
                                        <p className="text-xs">CONTRATADA</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjectDetailsModal;
