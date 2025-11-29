import React, { useState, useEffect } from 'react';
import { DollarSign, Calendar, Save, PieChart, FileText, Plus, Trash2, TrendingUp, TrendingDown, Download } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils';
import { doc, updateDoc, collection, addDoc, deleteDoc, onSnapshot, query, orderBy } from "firebase/firestore";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Financials = ({ projects, clients, db, appId, user }) => {
    const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'projects', 'expenses'
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [editForm, setEditForm] = useState({ value: '', dueDate: '', type: 'unico' });
    const [expenses, setExpenses] = useState([]);
    const [newExpense, setNewExpense] = useState({ description: '', value: '', date: '', category: 'Software', clientId: '', projectId: '' });

    const selectedProject = projects.find(p => p.id === selectedProjectId);

    // Fetch Expenses
    useEffect(() => {
        if (!user || !db) return;
        const q = query(collection(db, 'artifacts', appId, 'users', user.uid, 'expenses'), orderBy('date', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const expensesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setExpenses(expensesData);
            setExpenses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, [user]);

    const handleProjectSelect = (projectId) => {
        setSelectedProjectId(projectId);
        const project = projects.find(p => p.id === projectId);
        if (project) {
            setEditForm({
                value: project.value || '',
                dueDate: project.dueDate || '',
                type: project.type || 'unico'
            });
        }
    };

    const handleSaveProject = async (e) => {
        e.preventDefault();
        if (!selectedProject) return;

        try {
            await updateDoc(doc(db, 'users', user.uid, 'projects', selectedProject.id), {
                value: parseFloat(editForm.value),
                dueDate: editForm.dueDate,
                type: editForm.type
            });
            alert('Dados financeiros atualizados!');
        } catch (error) {
            console.error("Erro ao atualizar financeiro:", error);
            alert("Erro ao atualizar.");
        }
    };

    const handleAddExpense = async (e) => {
        e.preventDefault();
        if (!newExpense.description || !newExpense.value) return;

        const selectedClient = clients?.find(c => c.id === newExpense.clientId);
        const selectedProjectExp = projects?.find(p => p.id === newExpense.projectId);

        try {
            await addDoc(collection(db, 'users', user.uid, 'expenses'), {
                description: newExpense.description,
                value: parseFloat(newExpense.value),
                date: newExpense.date || new Date().toISOString().split('T')[0],
                category: newExpense.category,
                clientId: newExpense.clientId || null,
                clientName: selectedClient?.name || null,
                projectId: newExpense.projectId || null,
                projectName: selectedProjectExp?.name || null,
                createdAt: new Date().toISOString()
            });
            setNewExpense({ description: '', value: '', date: '', category: 'Software', clientId: '', projectId: '' });
        } catch (error) {
            console.error("Erro ao adicionar despesa:", error);
        }
    };

    const handleDeleteExpense = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir esta despesa?')) {
            try {
                await deleteDoc(doc(db, 'users', user.uid, 'expenses', id));
            } catch (error) {
                console.error("Erro ao excluir despesa:", error);
            }
        }
    };

    const generateInvoice = (project) => {
        const doc = new jsPDF();

        // Header
        doc.setFillColor(10, 10, 10); // Black background
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.text("DevArc Management", 20, 25);
        doc.setFontSize(10);
        doc.text("FATURA DE SERVIÇOS", 150, 25);

        // Client Info
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.text(`Cliente: ${project.clientName}`, 20, 60);
        doc.text(`Projeto: ${project.name}`, 20, 70);
        doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 150, 60);

        // Table
        autoTable(doc, {
            startY: 90,
            head: [['Descrição', 'Tipo', 'Vencimento', 'Valor']],
            body: [
                [
                    project.name,
                    project.type === 'mensal' ? 'Recorrente Mensal' : 'Pagamento Único',
                    formatDate(project.dueDate),
                    formatCurrency(project.value)
                ]
            ],
            theme: 'grid',
            headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
            styles: { fontSize: 10, cellPadding: 5 }
        });

        // Total
        const finalY = doc.lastAutoTable.finalY || 100;
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(`TOTAL: ${formatCurrency(project.value)}`, 140, finalY + 20);

        // Footer
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 100, 100);
        doc.text("Obrigado pela preferência.", 105, 280, { align: 'center' });

        doc.save(`Fatura_${project.name.replace(/\s+/g, '_')}.pdf`);
    };

    // Chart Data Preparation
    const chartData = projects.map(p => ({
        name: p.name.substring(0, 10) + '...',
        Receita: p.value || 0,
        Despesa: 0 // Placeholder, ideally we'd map expenses to months or projects
    }));

    // Calculate totals
    const totalRevenue = projects.reduce((acc, curr) => acc + (curr.value || 0), 0);
    const totalExpenses = expenses.reduce((acc, curr) => acc + (curr.value || 0), 0);

    return (
        <div className="pb-20 md:pb-0">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Financeiro</h1>
                    <p className="text-slate-400 mt-1">Gestão completa de receitas, despesas e faturas.</p>
                </div>

                {/* Tabs */}
                <div className="flex bg-neutral-900 p-1 rounded-xl border border-white/10">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'overview' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Visão Geral
                    </button>
                    <button
                        onClick={() => setActiveTab('projects')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'projects' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Projetos & Faturas
                    </button>
                    <button
                        onClick={() => setActiveTab('expenses')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'expenses' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Despesas
                    </button>
                </div>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-neutral-900/50 p-6 rounded-2xl border border-white/5">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400"><TrendingUp size={20} /></div>
                                <span className="text-slate-400 text-sm font-bold uppercase tracking-wider">Receita Total</span>
                            </div>
                            <div className="text-2xl font-bold text-white">{formatCurrency(totalRevenue)}</div>
                        </div>
                        <div className="bg-neutral-900/50 p-6 rounded-2xl border border-white/5">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400"><TrendingDown size={20} /></div>
                                <span className="text-slate-400 text-sm font-bold uppercase tracking-wider">Despesas</span>
                            </div>
                            <div className="text-2xl font-bold text-white">{formatCurrency(totalExpenses)}</div>
                        </div>
                        <div className="bg-neutral-900/50 p-6 rounded-2xl border border-white/5">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400"><DollarSign size={20} /></div>
                                <span className="text-slate-400 text-sm font-bold uppercase tracking-wider">Lucro Líquido</span>
                            </div>
                            <div className={`text-2xl font-bold ${totalRevenue - totalExpenses >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {formatCurrency(totalRevenue - totalExpenses)}
                            </div>
                        </div>
                    </div>

                    {/* Charts */}
                    <div className="bg-neutral-900/50 p-6 rounded-2xl border border-white/5 h-[400px]">
                        <h3 className="text-lg font-bold text-white mb-6">Receita por Projeto</h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value}`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Bar dataKey="Receita" fill="#22d3ee" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Projects & Invoices Tab */}
            {activeTab === 'projects' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
                    {/* Project List */}
                    <div className="lg:col-span-1 bg-neutral-900/50 rounded-2xl border border-white/5 p-4 h-fit">
                        <h3 className="text-lg font-bold text-white mb-4 px-2">Selecione um Projeto</h3>
                        <div className="space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            {projects.map(project => (
                                <button
                                    key={project.id}
                                    onClick={() => handleProjectSelect(project.id)}
                                    className={`w-full text-left p-4 rounded-xl border transition-all ${selectedProjectId === project.id
                                        ? 'bg-cyan-950/30 border-cyan-500/50 text-white shadow-[0_0_15px_rgba(34,211,238,0.1)]'
                                        : 'bg-black/40 border-white/5 text-slate-400 hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    <div className="font-bold truncate">{project.name}</div>
                                    <div className="text-xs opacity-70 mt-1 flex justify-between">
                                        <span>{formatCurrency(project.value)}</span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${project.status === 'Ativo' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-300'
                                            }`}>{project.status}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Edit Form & Actions */}
                    <div className="lg:col-span-2">
                        {selectedProject ? (
                            <div className="bg-neutral-900/50 rounded-2xl border border-white/5 p-6 md:p-8">
                                <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/5">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-cyan-500/10 rounded-xl">
                                            <FileText size={24} className="text-cyan-400" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-white">{selectedProject.name}</h2>
                                            <p className="text-slate-400 text-sm">Gerenciar Finanças & Faturas</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => generateInvoice(selectedProject)}
                                        className="bg-white text-black hover:bg-cyan-400 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow hover:shadow-[0_0_15px_rgba(34,211,238,0.4)]"
                                    >
                                        <Download size={16} /> Gerar Fatura PDF
                                    </button>
                                </div>

                                <form onSubmit={handleSaveProject} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Valor do Projeto (R$)</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">R$</span>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    required
                                                    className="w-full bg-black border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                                                    value={editForm.value}
                                                    onChange={e => setEditForm({ ...editForm, value: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Data de Vencimento</label>
                                            <div className="relative">
                                                <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                                <input
                                                    type="date"
                                                    required
                                                    className="w-full bg-black border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                                                    value={editForm.dueDate}
                                                    onChange={e => setEditForm({ ...editForm, dueDate: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tipo de Cobrança</label>
                                            <select
                                                className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                                                value={editForm.type}
                                                onChange={e => setEditForm({ ...editForm, type: e.target.value })}
                                            >
                                                <option value="unico">Único</option>
                                                <option value="mensal">Mensal (Recorrente)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-white/5 flex justify-end">
                                        <button
                                            type="submit"
                                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-900/20 uppercase tracking-wider text-sm"
                                        >
                                            <Save size={18} /> Salvar Alterações
                                        </button>
                                    </div>
                                </form>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-500 bg-neutral-900/30 rounded-2xl border border-dashed border-white/5 p-12">
                                <DollarSign size={48} className="mb-4 opacity-20" />
                                <p>Selecione um projeto ao lado para gerenciar.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Expenses Tab */}
            {activeTab === 'expenses' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
                    {/* Add Expense Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-neutral-900/50 rounded-2xl border border-white/5 p-6">
                            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <Plus size={20} className="text-rose-400" /> Nova Despesa
                            </h3>
                            <form onSubmit={handleAddExpense} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Descrição</label>
                                    <input
                                        required
                                        className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:ring-1 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
                                        placeholder="Ex: Servidor AWS"
                                        value={newExpense.description}
                                        onChange={e => setNewExpense({ ...newExpense, description: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Valor (R$)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:ring-1 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
                                        placeholder="0.00"
                                        value={newExpense.value}
                                        onChange={e => setNewExpense({ ...newExpense, value: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Categoria</label>
                                    <select
                                        className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:ring-1 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
                                        value={newExpense.category}
                                        onChange={e => setNewExpense({ ...newExpense, category: e.target.value })}
                                    >
                                        <option value="Software">Software / SaaS</option>
                                        <option value="Marketing">Marketing</option>
                                        <option value="Equipamentos">Equipamentos</option>
                                        <option value="Impostos">Impostos</option>
                                        <option value="Outros">Outros</option>
                                    </select>
                                </div>

                                {/* Optional Client/Project Selection */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Cliente (Opcional)</label>
                                        <select
                                            className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:ring-1 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
                                            value={newExpense.clientId}
                                            onChange={e => setNewExpense({ ...newExpense, clientId: e.target.value, projectId: '' })}
                                        >
                                            <option value="">Nenhum</option>
                                            {clients?.map(client => (
                                                <option key={client.id} value={client.id}>{client.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Projeto (Opcional)</label>
                                        <select
                                            className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:ring-1 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
                                            value={newExpense.projectId}
                                            onChange={e => setNewExpense({ ...newExpense, projectId: e.target.value })}
                                            disabled={!newExpense.clientId}
                                        >
                                            <option value="">Nenhum</option>
                                            {projects?.filter(p => p.clientId === newExpense.clientId).map(project => (
                                                <option key={project.id} value={project.id}>{project.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Data</label>
                                    <input
                                        type="date"
                                        className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:ring-1 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
                                        value={newExpense.date}
                                        onChange={e => setNewExpense({ ...newExpense, date: e.target.value })}
                                    />
                                </div>
                                <button type="submit" className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-rose-900/20 mt-2 uppercase tracking-wider text-sm">
                                    Adicionar Despesa
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Expense List */}
                    <div className="lg:col-span-2">
                        <div className="bg-neutral-900/50 rounded-2xl border border-white/5 p-6">
                            <h3 className="text-lg font-bold text-white mb-6">Histórico de Despesas</h3>
                            <div className="space-y-3">
                                {expenses.map(expense => (
                                    <div key={expense.id} className="flex items-center justify-between p-4 bg-black/40 border border-white/5 rounded-xl hover:border-rose-500/30 transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-rose-500/10 rounded-lg text-rose-400">
                                                <TrendingDown size={18} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-white">{expense.description}</div>
                                                <div className="text-xs text-slate-500 flex gap-2">
                                                    <span>{formatDate(expense.date)}</span>
                                                    <span>•</span>
                                                    <span>{expense.category}</span>
                                                    {expense.clientName && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="text-cyan-500">{expense.clientName}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="font-mono font-bold text-rose-400">-{formatCurrency(expense.value)}</span>
                                            <button
                                                onClick={() => handleDeleteExpense(expense.id)}
                                                className="p-2 text-slate-600 hover:text-rose-500 hover:bg-rose-950/30 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {expenses.length === 0 && (
                                    <p className="text-center text-slate-500 py-8 italic">Nenhuma despesa registrada.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Financials;
