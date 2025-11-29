import React, { useState, useEffect } from 'react';
import { Save, Building, FileText, Upload, Image as ImageIcon } from 'lucide-react';
import { doc, getDoc, setDoc } from "firebase/firestore";

const Settings = ({ db, appId, user }) => {
    const [activeTab, setActiveTab] = useState('company'); // 'company', 'contracts'
    const [loading, setLoading] = useState(false);

    const [companyForm, setCompanyForm] = useState({
        name: '',
        cnpj: '',
        email: '',
        phone: '',
        address: '',
        logo: '' // Base64 string
    });

    const [contractTemplate, setContractTemplate] = useState('');

    useEffect(() => {
        if (!user || !db) return;
        const fetchSettings = async () => {
            try {
                const docRef = doc(db, 'users', user.uid, 'settings', 'general');
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setCompanyForm(data.company || { name: '', cnpj: '', email: '', phone: '', address: '', logo: '' });
                    setContractTemplate(data.contractTemplate || '');
                }
            } catch (error) {
                console.error("Error fetching settings:", error);
            }
        };
        fetchSettings();
    }, [user, db, appId]);

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCompanyForm(prev => ({ ...prev, logo: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await setDoc(doc(db, 'users', user.uid, 'settings', 'general'), {
                company: companyForm,
                contractTemplate: contractTemplate
            }, { merge: true });
            alert('Configurações salvas com sucesso!');
        } catch (error) {
            console.error("Error saving settings:", error);
            alert('Erro ao salvar configurações.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pb-20 md:pb-0">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white tracking-tight">Configurações</h1>
                <p className="text-slate-400 mt-1">Personalize seus dados e documentos.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Navigation */}
                <div className="lg:col-span-1 space-y-2">
                    <button
                        onClick={() => setActiveTab('company')}
                        className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition-all ${activeTab === 'company'
                            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/50'
                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <Building size={20} /> Dados da Empresa
                    </button>
                    <button
                        onClick={() => setActiveTab('contracts')}
                        className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition-all ${activeTab === 'contracts'
                            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/50'
                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <FileText size={20} /> Modelo de Contrato
                    </button>
                </div>

                {/* Content Area */}
                <div className="lg:col-span-3">
                    <div className="bg-neutral-900/50 rounded-2xl border border-white/5 p-6 md:p-8">

                        {/* Company Settings */}
                        {activeTab === 'company' && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <h2 className="text-xl font-bold text-white mb-6">Informações da Empresa</h2>

                                {/* Logo Upload */}
                                <div className="flex items-center gap-6">
                                    <div className="w-24 h-24 rounded-2xl bg-black border border-white/10 flex items-center justify-center overflow-hidden relative group">
                                        {companyForm.logo ? (
                                            <img src={companyForm.logo} alt="Logo" className="w-full h-full object-cover" />
                                        ) : (
                                            <ImageIcon className="text-slate-600" size={32} />
                                        )}
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Upload size={20} className="text-white" />
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleLogoUpload}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white">Logo da Empresa</h3>
                                        <p className="text-sm text-slate-500">Recomendado: 500x500px (PNG/JPG)</p>
                                        <p className="text-xs text-cyan-500 mt-1 font-bold">Clique na imagem para alterar</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nome da Empresa</label>
                                        <input
                                            className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                                            value={companyForm.name}
                                            onChange={e => setCompanyForm({ ...companyForm, name: e.target.value })}
                                            placeholder="Minha Agência Digital"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">CNPJ / CPF</label>
                                        <input
                                            className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                                            value={companyForm.cnpj}
                                            onChange={e => setCompanyForm({ ...companyForm, cnpj: e.target.value })}
                                            placeholder="00.000.000/0001-00"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email de Contato</label>
                                        <input
                                            className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                                            value={companyForm.email}
                                            onChange={e => setCompanyForm({ ...companyForm, email: e.target.value })}
                                            placeholder="contato@empresa.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Telefone / WhatsApp</label>
                                        <input
                                            className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                                            value={companyForm.phone}
                                            onChange={e => setCompanyForm({ ...companyForm, phone: e.target.value })}
                                            placeholder="(11) 99999-9999"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Endereço / Sede Virtual</label>
                                        <input
                                            className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                                            value={companyForm.address}
                                            onChange={e => setCompanyForm({ ...companyForm, address: e.target.value })}
                                            placeholder="Rua Exemplo, 123 ou Sede Virtual - São Paulo, SP"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Contract Settings */}
                        {activeTab === 'contracts' && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <h2 className="text-xl font-bold text-white mb-6">Modelo de Contrato Padrão</h2>
                                <p className="text-slate-400 text-sm mb-4">
                                    Este texto será usado como base para novos contratos. Use as variáveis abaixo para preenchimento automático:
                                    <br />
                                    <span className="text-cyan-400 font-mono">{`{CLIENTE_NOME}`}</span>, <span className="text-cyan-400 font-mono">{`{CLIENTE_CPF}`}</span>, <span className="text-cyan-400 font-mono">{`{PROJETO_NOME}`}</span>, <span className="text-cyan-400 font-mono">{`{VALOR}`}</span>, <span className="text-cyan-400 font-mono">{`{DATA}`}</span>
                                </p>
                                <textarea
                                    className="w-full h-[500px] bg-black border border-white/10 rounded-xl p-4 text-slate-300 font-mono text-sm focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all resize-none"
                                    value={contractTemplate}
                                    onChange={e => setContractTemplate(e.target.value)}
                                    placeholder="Cole aqui o seu modelo de contrato..."
                                />
                            </div>
                        )}

                        {/* Save Button */}
                        <div className="mt-8 pt-6 border-t border-white/5 flex justify-end">
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-900/20 uppercase tracking-wider text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Save size={18} /> {loading ? 'Salvando...' : 'Salvar Alterações'}
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
