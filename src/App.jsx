import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { auth, db, appId } from './lib/firebase';
import { Briefcase, LayoutDashboard, CheckSquare, Users, LogIn, DollarSign, RefreshCw, Send, FileText, LogOut } from 'lucide-react';

// Components
import Sidebar from './components/Sidebar';
import MobileNavButton from './components/MobileNavButton';
import ProjectFormModal from './components/ProjectFormModal';
import ClientFormModal from './components/ClientFormModal';
import InstallPWA from './components/InstallPWA';

// Pages
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Clients from './pages/Clients';
import Financials from './pages/Financials';
import Updates from './pages/Updates';
import Billing from './pages/Billing';
import Contracts from './pages/Contracts';
import Settings from './pages/Settings';

const App = () => {
    const [user, setUser] = useState(null);
    const [clients, setClients] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [dataError, setDataError] = useState(null);

    // Modais e Form States
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [projectModalTab, setProjectModalTab] = useState('overview');
    const [formData, setFormData] = useState({});

    // Login State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');

    // Sidebar State
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    // --- AUTHENTICATION ---
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // --- AUTHENTICATION ---
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setLoginError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error("Erro ao fazer login com email/senha:", error);
            setLoginError("Email ou senha incorretos.");
        }
    };

    // --- ONLINE STATUS ---
    useEffect(() => {
        const handleStatusChange = () => setIsOnline(navigator.onLine);
        window.addEventListener('online', handleStatusChange);
        window.addEventListener('offline', handleStatusChange);
        return () => {
            window.removeEventListener('online', handleStatusChange);
            window.removeEventListener('offline', handleStatusChange);
        };
    }, []);

    // --- DATA FETCHING ---
    useEffect(() => {
        if (!user) return;

        const clientsQuery = query(collection(db, 'users', user.uid, 'clients'), orderBy('createdAt', 'desc'));
        const unsubscribeClients = onSnapshot(clientsQuery, (snapshot) => {
            setClients(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setDataError(null);
        }, (error) => {
            console.error("Erro ao buscar clientes:", error);
            if (error.code === 'permission-denied') {
                setDataError("Sem permissão para acessar os dados. Verifique as regras do Firestore.");
            }
        });

        const projectsQuery = query(collection(db, 'users', user.uid, 'projects'), orderBy('createdAt', 'desc'));
        const unsubscribeProjects = onSnapshot(projectsQuery, (snapshot) => {
            setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }, (error) => {
            console.error("Erro ao buscar projetos:", error);
        });

        return () => {
            unsubscribeClients();
            unsubscribeProjects();
        };
    }, [user]);

    // --- HANDLERS ---
    const handleSaveClient = async (e) => {
        e.preventDefault();
        try {
            if (formData.id) {
                await updateDoc(doc(db, 'users', user.uid, 'clients', formData.id), formData);
            } else {
                await addDoc(collection(db, 'users', user.uid, 'clients'), {
                    ...formData,
                    createdAt: serverTimestamp()
                });
            }
            setIsClientModalOpen(false);
            setFormData({});
        } catch (error) {
            console.error("Erro ao salvar cliente:", error);
            alert("Erro ao salvar cliente.");
        }
    };

    const handleDeleteClient = async (id) => {
        if (confirm('Tem certeza que deseja excluir este cliente?')) {
            await deleteDoc(doc(db, 'users', user.uid, 'clients', id));
        }
    };

    const handleSaveProject = async (e) => {
        e.preventDefault();
        try {
            if (formData.id) {
                await updateDoc(doc(db, 'users', user.uid, 'projects', formData.id), formData);
            } else {
                await addDoc(collection(db, 'users', user.uid, 'projects'), {
                    ...formData,
                    value: formData.value || 0,
                    type: formData.type || 'unico',
                    totalPaid: 0,
                    createdAt: serverTimestamp()
                });
            }
            setIsProjectModalOpen(false);
            setFormData({});
        } catch (error) {
            console.error("Erro ao salvar projeto:", error);
            alert("Erro ao salvar projeto.");
        }
    };

    const handleDeleteProject = async (id) => {
        if (confirm('Tem certeza que deseja excluir este projeto?')) {
            await deleteDoc(doc(db, 'users', user.uid, 'projects', id));
        }
    };

    const handleTaskToggle = async (project, taskIndex) => {
        const newTasks = [...(project.tasks || [])];
        newTasks[taskIndex].done = !newTasks[taskIndex].done;
        await updateDoc(doc(db, 'users', user.uid, 'projects', project.id), {
            tasks: newTasks
        });
    };

    const handleAddTask = async (project, taskDesc) => {
        if (!taskDesc.trim()) return;
        const newTasks = [...(project.tasks || []), { desc: taskDesc, done: false }];
        await updateDoc(doc(db, 'users', user.uid, 'projects', project.id), {
            tasks: newTasks
        });
    };

    const handleSendWhatsApp = (project) => {
        const client = clients.find(c => c.id === project.clientId);
        if (!client) return alert('Cliente não encontrado');

        const message = `Olá ${client.name}, referente ao projeto *${project.name}*.\nValor: R$ ${project.value}\nVencimento: ${new Date(project.dueDate).toLocaleDateString('pt-BR')}\n\nPodemos conversar?`;
        window.open(`https://wa.me/55${client.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
    };

    // --- STATS ---
    const stats = useMemo(() => {
        const activeProjects = projects.filter(p => p.status === 'Ativo').length;
        const pendingTasks = projects.reduce((acc, p) => acc + (p.tasks?.filter(t => !t.done).length || 0), 0);
        const mrr = projects
            .filter(p => p.status === 'Ativo' && p.type === 'mensal')
            .reduce((acc, p) => acc + parseFloat(p.value), 0);
        const totalReceived = projects.reduce((acc, p) => acc + (p.totalPaid || 0), 0);

        return { activeProjects, pendingTasks, mrr, totalReceived };
    }, [projects]);

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white font-bold tracking-widest">CARREGANDO...</div>;

    if (!user) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <div className="bg-neutral-950 p-8 rounded-3xl border border-white/10 shadow-2xl max-w-md w-full text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-violet-500"></div>
                    <h1 className="text-5xl font-bold text-white mb-2 tracking-tight">DevArc</h1>
                    <p className="text-slate-500 mb-8 text-sm uppercase tracking-widest">Acesso Restrito</p>

                    <form onSubmit={handleEmailLogin} className="space-y-4 mb-6 text-left">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email</label>
                            <input
                                type="email"
                                required
                                className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all placeholder:text-slate-700"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Senha</label>
                            <input
                                type="password"
                                required
                                className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all placeholder:text-slate-700"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        {loginError && (
                            <div className="text-rose-400 text-xs font-bold uppercase tracking-wide bg-rose-950/30 p-3 rounded-lg border border-rose-500/20 text-center">
                                {loginError}
                            </div>
                        )}
                        <button type="submit" className="w-full bg-white text-black font-bold py-3 rounded-xl transition-all hover:bg-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)]">
                            ENTRAR
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-black font-sans text-slate-300 selection:bg-cyan-500/30">
            <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 w-full bg-black/90 backdrop-blur-md border-b border-white/10 z-40 px-4 py-3 flex justify-between items-center">
                <div className="font-bold text-xl text-white">
                    DevArc
                </div>
                {!isOnline && (
                    <div className="text-[10px] font-bold text-amber-400 bg-amber-950/30 px-2 py-1 rounded border border-amber-500/20 animate-pulse uppercase tracking-wider">
                        Offline
                    </div>
                )}
            </div>

            <main className={`flex-1 ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-72'} p-4 md:p-8 pt-20 md:pt-8 transition-all duration-300`}>
                {dataError && (
                    <div className="mb-6 bg-rose-950/20 border border-rose-500/20 text-rose-400 p-4 rounded-xl flex items-center gap-3">
                        <div className="p-2 bg-rose-500/10 rounded-lg">
                            <Briefcase size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold uppercase tracking-wider text-xs">Acesso Negado</h3>
                            <p className="text-sm text-rose-300/80">{dataError}</p>
                        </div>
                    </div>
                )}
                <Routes>
                    <Route path="/" element={
                        <Dashboard
                            stats={stats}
                            projects={projects}
                            clients={clients}
                            onOpenProjectModal={() => setIsProjectModalOpen(true)}
                            onOpenClientModal={() => setIsClientModalOpen(true)}
                            setFormData={setFormData}
                        />
                    } />
                    <Route path="/clients" element={
                        <Clients
                            clients={clients}
                            onOpenClientModal={() => setIsClientModalOpen(true)}
                            setFormData={setFormData}
                            handleDeleteClient={handleDeleteClient}
                        />
                    } />
                    <Route path="/projects" element={
                        <Projects
                            projects={projects}
                            onOpenProjectModal={() => setIsProjectModalOpen(true)}
                            setFormData={setFormData}
                            handleDeleteProject={handleDeleteProject}
                            handleTaskToggle={handleTaskToggle}
                            handleAddTask={handleAddTask}
                            handleSendWhatsApp={handleSendWhatsApp}
                            db={db}
                            appId={appId}
                            user={user}
                        />
                    } />
                    <Route path="/financials" element={
                        <Financials
                            projects={projects}
                            clients={clients}
                            db={db}
                            appId={appId}
                            user={user}
                        />
                    } />
                    <Route path="/updates" element={
                        <Updates
                            projects={projects}
                            db={db}
                            appId={appId}
                            user={user}
                        />
                    } />
                    <Route path="/billing" element={
                        <Billing
                            projects={projects}
                            clients={clients}
                        />
                    } />
                    <Route path="/contracts" element={
                        <Contracts
                            projects={projects}
                            clients={clients}
                            onOpenProjectModal={() => setIsProjectModalOpen(true)}
                            setProjectModalTab={setProjectModalTab}
                            setSelectedProject={setFormData} // Using setFormData to pass project data to modal
                            db={db}
                            appId={appId}
                            user={user}
                        />
                    } />
                    <Route path="/settings" element={
                        <Settings
                            db={db}
                            appId={appId}
                            user={user}
                        />
                    } />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>

            {/* Mobile Bottom Nav (Tab Bar) */}
            <div className="md:hidden fixed bottom-0 w-full bg-black/90 backdrop-blur-xl border-t border-white/10 px-2 py-2 flex justify-between items-end z-50 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                <MobileNavButton active={location.pathname === '/'} onClick={() => { navigate('/'); setIsMobileMenuOpen(false); }} icon={<LayoutDashboard size={22} />} label="Home" />
                <MobileNavButton active={location.pathname === '/clients'} onClick={() => { navigate('/clients'); setIsMobileMenuOpen(false); }} icon={<Users size={22} />} label="Clientes" />

                {/* Floating Action Button for Projects */}
                <div className="relative -top-6 flex flex-col items-center gap-1">
                    <button
                        onClick={() => { navigate('/projects'); setIsMobileMenuOpen(false); }}
                        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all duration-300 ${location.pathname === '/projects' ? 'bg-cyan-500 text-black scale-110 border-4 border-black' : 'bg-neutral-900 border border-white/20 text-cyan-400'}`}
                    >
                        <CheckSquare size={24} />
                    </button>
                    <span className={`text-[10px] font-medium tracking-wide ${location.pathname === '/projects' ? 'text-cyan-400 font-bold' : 'text-slate-500'}`}>Projetos</span>
                </div>

                <MobileNavButton active={location.pathname === '/financials'} onClick={() => { navigate('/financials'); setIsMobileMenuOpen(false); }} icon={<DollarSign size={22} />} label="Finanças" />
                <MobileNavButton active={isMobileMenuOpen} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} icon={<div className="grid grid-cols-2 gap-0.5"><div className="w-1 h-1 bg-current rounded-full"></div><div className="w-1 h-1 bg-current rounded-full"></div><div className="w-1 h-1 bg-current rounded-full"></div><div className="w-1 h-1 bg-current rounded-full"></div></div>} label="Menu" />
            </div>

            {/* Mobile Menu Drawer */}
            {isMobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-40 flex flex-col justify-end">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
                    <div className="bg-neutral-900/95 backdrop-blur-xl border-t border-white/10 rounded-t-3xl p-6 pb-28 relative animate-in slide-in-from-bottom duration-300 shadow-2xl">

                        {/* Drawer Header */}
                        <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-white tracking-tight">Menu</h2>
                                <p className="text-[10px] text-cyan-400/80 font-medium tracking-[0.2em] uppercase">DevArc Management</p>
                            </div>
                            <button
                                onClick={() => auth.signOut()}
                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-medium text-xs hover:bg-rose-500/20 transition-colors"
                            >
                                <LogOut size={14} />
                                Sair
                            </button>
                        </div>

                        {/* Drawer Grid */}
                        <div className="grid grid-cols-3 gap-4">
                            <button onClick={() => { navigate('/contracts'); setIsMobileMenuOpen(false); }} className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-black/50 border border-white/10 active:scale-95 transition-all hover:border-cyan-500/30 group relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="p-3 bg-violet-500/10 text-violet-400 rounded-xl group-hover:bg-violet-500/20 transition-colors relative z-10">
                                    <FileText size={24} />
                                </div>
                                <span className="text-xs font-medium text-slate-300 group-hover:text-white relative z-10">Contratos</span>
                            </button>
                            <button onClick={() => { navigate('/billing'); setIsMobileMenuOpen(false); }} className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-black/50 border border-white/10 active:scale-95 transition-all hover:border-cyan-500/30 group relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl group-hover:bg-emerald-500/20 transition-colors relative z-10">
                                    <Send size={24} />
                                </div>
                                <span className="text-xs font-medium text-slate-300 group-hover:text-white relative z-10">Cobrar</span>
                            </button>
                            <button onClick={() => { navigate('/updates'); setIsMobileMenuOpen(false); }} className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-black/50 border border-white/10 active:scale-95 transition-all hover:border-cyan-500/30 group relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl group-hover:bg-amber-500/20 transition-colors relative z-10">
                                    <RefreshCw size={24} />
                                </div>
                                <span className="text-xs font-medium text-slate-300 group-hover:text-white relative z-10">Updates</span>
                            </button>
                        </div>

                        <div className="mt-6 border-t border-white/5 pt-4">
                            <InstallPWA />
                        </div>
                    </div>
                </div>
            )}

            <ProjectFormModal
                isOpen={isProjectModalOpen}
                onClose={() => { setIsProjectModalOpen(false); setProjectModalTab('overview'); }}
                formData={formData}
                setFormData={setFormData}
                onSave={handleSaveProject}
                clients={clients}
                initialTab={projectModalTab}
            />

            <ClientFormModal
                isOpen={isClientModalOpen}
                onClose={() => setIsClientModalOpen(false)}
                formData={formData}
                setFormData={setFormData}
                onSave={handleSaveClient}
            />
        </div>
    );
};

export default App;
