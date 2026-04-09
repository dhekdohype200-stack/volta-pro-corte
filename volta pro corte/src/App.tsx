import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, 
  CheckCircle2, 
  MessageCircle, 
  Plus, 
  Settings, 
  Users, 
  Clock, 
  Trash2,
  ChevronRight,
  LayoutDashboard,
  ExternalLink,
  UserX,
  TrendingUp,
  AlertCircle,
  Scissors,
  Zap,
  ArrowRight,
  Menu,
  X,
  Bell,
  CalendarDays,
  UserCheck,
  TrendingDown,
  CreditCard,
  ShieldCheck,
  HelpCircle,
  Check,
  Camera,
  User,
  UserPlus,
  LogIn,
  AlertTriangle,
  Copy
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  AreaChart, 
  Area 
} from 'recharts';
import { format, isToday, parseISO, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Toaster, toast } from 'sonner';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
interface Service {
  id: number;
  name: string;
  price: number;
  duration: number;
}

interface Appointment {
  id: number;
  client_name: string;
  client_phone: string;
  service_id: number;
  service_name: string;
  service_price: number;
  date: string;
  time: string;
  status: 'pending' | 'completed';
  created_at: string;
}

interface InactiveClient {
  client_name: string;
  client_phone: string;
  last_visit: string;
  avg_price: number;
}

// --- Components ---

const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'cta', size?: 'sm' | 'md' | 'lg' | 'xl' }>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary: 'bg-red-600 text-white hover:bg-red-500 shadow-lg glow-red',
      secondary: 'bg-neutral-800 text-white border border-neutral-700 hover:bg-neutral-700 shadow-sm',
      outline: 'bg-transparent border border-neutral-800 text-neutral-400 hover:bg-neutral-900 hover:text-white',
      ghost: 'bg-transparent text-neutral-400 hover:bg-neutral-900 hover:text-white',
      danger: 'bg-red-950/30 text-red-500 hover:bg-red-900/40 border border-red-900/50',
      success: 'bg-emerald-600 text-white hover:bg-emerald-500 glow-green shadow-lg',
      cta: 'bg-red-600 text-white hover:bg-red-500 font-black tracking-tighter uppercase glow-red-strong shadow-2xl',
    };
    const sizes = {
      sm: 'h-9 px-4 text-xs',
      md: 'h-11 px-6 py-2 text-sm',
      lg: 'h-14 px-8 text-base',
      xl: 'h-16 px-10 text-lg',
    };
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-2xl font-bold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:pointer-events-none disabled:opacity-50 active:scale-95',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'flex h-12 w-full rounded-2xl border border-neutral-800 bg-neutral-900/40 px-5 py-2 text-sm text-white ring-offset-black file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 hover:border-neutral-700',
        className
      )}
      {...props}
    />
  )
);

// --- Main App ---

export default function App() {
  const [view, setView] = useState<'dashboard' | 'clients' | 'agenda' | 'settings' | 'booking' | 'pricing' | 'checkout' | 'onboarding'>('dashboard');
  const [services, setServices] = useState<Service[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [inactiveClients, setInactiveClients] = useState<InactiveClient[]>([]);
  const [clients, setClients] = useState<{id: number, name: string, phone: string}[]>([]);
  const [settings, setSettings] = useState<{business_name: string, business_email: string, start_time: string, end_time: string, business_logo?: string}>({
    business_name: 'Volta Pro Corte',
    business_email: 'barbearia@premium.com',
    start_time: '08:00',
    end_time: '19:00',
    business_logo: ''
  });
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<{id: number, client_name: string, service_name: string, price: number, time: string}[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const prevAppointmentsCount = useRef(0);

  useEffect(() => {
    if (appointments.length > prevAppointmentsCount.current && prevAppointmentsCount.current !== 0) {
      const newApp = appointments[appointments.length - 1];
      const newNotif = {
        id: Date.now(),
        client_name: newApp.client_name,
        service_name: newApp.service_name,
        price: newApp.service_price,
        time: format(new Date(), 'HH:mm')
      };
      setNotifications(prev => [newNotif, ...prev]);
      toast.success(`Novo agendamento: ${newApp.client_name}`);
    }
    prevAppointmentsCount.current = appointments.length;
  }, [appointments]);

  const chartData = [
    { name: 'Seg', revenue: 400, recovered: 2 },
    { name: 'Ter', revenue: 300, recovered: 1 },
    { name: 'Qua', revenue: 600, recovered: 3 },
    { name: 'Qui', revenue: 800, recovered: 4 },
    { name: 'Sex', revenue: 1200, recovered: 6 },
    { name: 'Sáb', revenue: 1500, recovered: 8 },
    { name: 'Dom', revenue: 200, recovered: 1 },
  ];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (window.location.pathname === '/agendar' || params.get('booking') === 'true') {
      setView('booking');
    }
  }, []);

  const fetchData = async () => {
    try {
      const [servicesRes, appointmentsRes, inactiveRes, clientsRes, settingsRes] = await Promise.all([
        fetch('/api/services'),
        fetch('/api/appointments'),
        fetch('/api/inactive-clients'),
        fetch('/api/clients'),
        fetch('/api/settings')
      ]);
      const servicesData = await servicesRes.json();
      const appointmentsData = await appointmentsRes.json();
      const inactiveData = await inactiveRes.json();
      const clientsData = await clientsRes.json();
      const settingsData = await settingsRes.json();
      
      setServices(servicesData);
      setAppointments(appointmentsData);
      setInactiveClients(inactiveData);
      setClients(clientsData);
      if (settingsData.business_name) setSettings(settingsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleComplete = async (id: number) => {
    try {
      await fetch(`/api/appointments/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' })
      });
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'completed' } : a));
      toast.success('Agendamento concluído!');
    } catch (error) {
      toast.error('Erro ao atualizar agendamento');
    }
  };

  const handleWhatsApp = (appointment: Appointment) => {
    const message = `Olá ${appointment.client_name}, estou entrando em contato sobre o seu agendamento no serviço ${appointment.service_name}.`;
    const phone = appointment.client_phone.replace(/\D/g, '');
    window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleReactivateWhatsApp = (client: InactiveClient) => {
    const message = `Olá ${client.client_name}, faz um tempo que não nos vemos! Que tal agendar um novo horário? Estamos com saudades!`;
    const phone = client.client_phone.replace(/\D/g, '');
    window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleDeleteAppointment = async (id: number) => {
    try {
      await fetch(`/api/appointments/${id}`, { method: 'DELETE' });
      setAppointments(prev => prev.filter(a => a.id !== id));
      toast.success('Agendamento removido');
    } catch (error) {
      toast.error('Erro ao remover agendamento');
    }
  };

  const handleDeleteClient = async (id: number) => {
    try {
      await fetch(`/api/clients/${id}`, { method: 'DELETE' });
      setClients(prev => prev.filter(c => c.id !== id));
      toast.success('Cliente removido');
    } catch (error) {
      toast.error('Erro ao remover cliente');
    }
  };

  const totalRecoverable = inactiveClients.reduce((acc, curr) => acc + curr.avg_price, 0);
  const todayAppointments = appointments.filter(a => isToday(parseISO(a.date)));
  const emptySlots = 10 - todayAppointments.length;
  const newClientsToday = appointments.filter(a => isToday(parseISO(a.created_at))).length;
  const projectedRevenue = appointments.reduce((acc, curr) => acc + curr.service_price, 0);

  if (view === 'booking') {
    return <PublicBooking services={services} onComplete={fetchData} settings={settings} appointments={appointments} />;
  }

  return (
    <div className="min-h-screen flex bg-[#0A0A0A] text-white selection:bg-red-600 selection:text-white">
      <Toaster theme="dark" position="top-right" />
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 flex-shrink-0 min-h-screen saas-sidebar transition-transform duration-300 md:relative",
        sidebarOpen ? "translate-x-0" : "-translate-x-full",
        "md:!translate-x-0"
      )}>
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center glow-red">
              <Scissors className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-black text-base tracking-tighter text-white uppercase leading-none">{settings.business_name}</h1>
            </div>
          </div>

          <nav className="flex-1 space-y-1">
            <SidebarItem 
              icon={<LayoutDashboard className="w-5 h-5" />} 
              label="Dashboard" 
              active={view === 'dashboard'} 
              onClick={() => { setView('dashboard'); setSidebarOpen(false); }} 
            />
            <SidebarItem 
              icon={<Users className="w-5 h-5" />} 
              label="Clientes" 
              active={view === 'clients'} 
              onClick={() => { setView('clients'); setSidebarOpen(false); }} 
            />
            <SidebarItem 
              icon={<CalendarDays className="w-5 h-5" />} 
              label="Agenda" 
              active={view === 'agenda'} 
              onClick={() => { setView('agenda'); setSidebarOpen(false); }} 
            />
            <SidebarItem 
              icon={<Settings className="w-5 h-5" />} 
              label="Configurações" 
              active={view === 'settings'} 
              onClick={() => { setView('settings'); setSidebarOpen(false); }} 
            />
            <SidebarItem 
              icon={<CreditCard className="w-5 h-5" />} 
              label="Planos" 
              active={view === 'pricing'} 
              onClick={() => { setView('pricing'); setSidebarOpen(false); }} 
            />
            <SidebarItem 
              icon={<Zap className="w-5 h-5" />} 
              label="Onboarding" 
              active={view === 'onboarding'} 
              onClick={() => { setView('onboarding'); setSidebarOpen(false); }} 
            />
          </nav>

          <div className="pt-6 border-t border-neutral-800/50 space-y-2">
            <AppointmentDialog services={services} onAdd={fetchData} settings={settings} appointments={appointments} />
            <a 
              href="/agendar" 
              target="_blank" 
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-neutral-500 hover:text-white hover:bg-neutral-900 transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              Link de Agendamento
            </a>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-20 saas-header flex items-center justify-between px-4 md:px-8 sticky top-0 z-40 border-b border-neutral-800/50 bg-[#0A0A0A]/80 backdrop-blur-xl">
          <div className="flex items-center gap-6">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 text-neutral-400 hover:text-white">
              <Menu className="w-6 h-6" />
            </button>
            
            <div className="hidden lg:flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/20">
                <Scissors className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-black text-white uppercase tracking-tighter leading-none">Volta Pro Corte</h1>
                <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mt-1">Painel do Barbeiro</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-8 relative">
            {/* High-Conversion Alert - Now in Header for maximum visibility */}
            <motion.div 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="hidden xl:flex items-center gap-3 px-4 py-2 rounded-2xl bg-red-600/10 border border-red-600/30 group cursor-pointer hover:bg-red-600/20 transition-all"
              onClick={() => {
                setView('dashboard');
                setTimeout(() => {
                  document.getElementById('recovery-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
            >
              <div className="relative">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-red-500 uppercase tracking-tighter leading-none">Atenção Barbeiro</span>
                <span className="text-[11px] font-bold text-white leading-tight">Perda de clientes detectada!</span>
              </div>
              <ArrowRight className="w-4 h-4 text-red-500 group-hover:translate-x-1 transition-transform" />
            </motion.div>

            <div className="flex items-center gap-2">
              {/* Auth Buttons - Smaller and dual purpose */}
              <button 
                onClick={() => setView('onboarding')}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700 transition-all"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black uppercase tracking-widest">Criar Conta</span>
              </button>

              <button 
                onClick={() => setView('booking')}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-white text-black hover:bg-neutral-200 transition-all shadow-lg group"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black uppercase tracking-widest">Entrar</span>
                <div className="ml-1 px-1 py-0.5 rounded bg-red-600 text-[7px] font-black text-white">NOVO</div>
              </button>

              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2.5 text-neutral-400 hover:text-white relative bg-neutral-900 rounded-xl border border-neutral-800"
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-600 rounded-full border-2 border-[#0A0A0A]"></span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full right-0 mt-2 w-64 saas-card p-4 z-50 shadow-2xl border border-neutral-800"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Notificações</h4>
                      <button onClick={() => setNotifications([])} className="text-[9px] text-red-500 font-bold hover:underline">Limpar</button>
                    </div>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="text-[10px] text-neutral-600 italic text-center py-4">Nenhuma notificação nova</p>
                      ) : (
                        notifications.map(n => (
                          <div key={n.id} className="bg-neutral-900/50 p-2.5 rounded-lg border border-neutral-800/50 space-y-1">
                            <div className="flex justify-between items-start">
                              <p className="text-[10px] text-white font-black uppercase tracking-tight">{n.client_name}</p>
                              <span className="text-[8px] text-neutral-500">{n.time}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <p className="text-[9px] text-neutral-400">{n.service_name}</p>
                              <p className="text-[9px] text-emerald-500 font-bold">R$ {n.price.toFixed(0)}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="w-11 h-11 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-sm font-black text-white shadow-lg">
                BP
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-3 md:p-4">
          <AnimatePresence mode="wait">
            {view === 'dashboard' && (
              <motion.div 
                key="dashboard" 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -20 }} 
                className="space-y-1.5 max-w-7xl mx-auto"
              >
                {/* High-Conversion Banner for Dashboard */}
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "saas-card p-6 md:p-8 border-none relative overflow-hidden group cursor-pointer transition-all duration-500",
                    inactiveClients.length > 0 
                      ? "bg-gradient-to-br from-red-600 to-red-900" 
                      : "bg-gradient-to-br from-emerald-500 to-emerald-700"
                  )}
                  onClick={() => inactiveClients.length > 0 && toast.info('Iniciando campanha de recuperação...')}
                >
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                    {inactiveClients.length > 0 ? (
                      <AlertTriangle className="w-48 h-48 -rotate-12" />
                    ) : (
                      <CheckCircle2 className="w-48 h-48 -rotate-12" />
                    )}
                  </div>
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-[10px] font-black text-white uppercase tracking-widest">
                        {inactiveClients.length > 0 ? (
                          <>
                            <Zap className="w-3 h-3 fill-current" />
                            Ação Necessária
                          </>
                        ) : (
                          <>
                            <Check className="w-3 h-3" />
                            Tudo em dia
                          </>
                        )}
                      </div>
                      <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">
                        {inactiveClients.length > 0 
                          ? "Perda de clientes detectada!" 
                          : "Sua agenda está um sucesso!"}
                      </h2>
                      <p className="text-white/90 font-bold text-lg">
                        {inactiveClients.length > 0 ? (
                          <>Você tem <span className="text-white underline decoration-2 underline-offset-4">{inactiveClients.length} clientes</span> que não voltam há mais de 30 dias.</>
                        ) : (
                          <>Nenhum cliente sumido nos últimos 30 dias. Continue assim!</>
                        )}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Metrics Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
                  <div className="relative group">
                    <MetricCard 
                      label="Faturamento gerado" 
                      value={`R$ ${projectedRevenue.toFixed(0)}`} 
                      icon={<TrendingUp />} 
                      variant="success"
                    />
                    <div className="absolute top-2 right-2 text-[8px] font-bold text-emerald-500 bg-emerald-500/10 px-1 py-0.5 rounded">+18%</div>
                  </div>
                  <div className="relative group">
                    <MetricCard 
                      label="Clientes reativados" 
                      value={appointments.filter(a => a.status === 'completed').length} 
                      icon={<UserCheck />} 
                      variant="success"
                    />
                    <div className="absolute top-2 right-2 text-[8px] font-bold text-emerald-500 bg-emerald-500/10 px-1 py-0.5 rounded">+5 hoje</div>
                  </div>
                  <MetricCard 
                    label="Horários vazios" 
                    value={Math.max(0, emptySlots)} 
                    icon={<Clock />} 
                    variant="warning"
                  />
                </div>

                {/* Main Action Section */}
                <div id="recovery-section" className="saas-card p-3 md:p-4 space-y-2.5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Scissors className="w-32 h-32 rotate-12" />
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 relative z-10">
                    <div className="space-y-0.5">
                      <h3 className="text-xl font-black text-white tracking-tight">Clientes prontos para voltar</h3>
                      <div className="flex items-center gap-3 text-[9px] font-bold text-neutral-500 uppercase tracking-widest">
                        <span className="flex items-center gap-1.5"><Zap className="w-2.5 h-2.5 text-yellow-500" /> 1 clique = volta</span>
                        <span className="flex items-center gap-1.5"><CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" /> Rápido</span>
                      </div>
                    </div>
                    <Button 
                      variant="cta" 
                      size="md" 
                      className="glow-red-strong h-10 px-6 text-sm"
                      onClick={() => toast.info('Iniciando campanha de recuperação...')}
                    >
                      TRAZER CLIENTES DE VOLTA
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>

                  <div className="space-y-1.5 relative z-10">
                    {inactiveClients.length === 0 ? (
                      <div className="py-10 text-center text-neutral-500 italic border border-dashed border-neutral-800 rounded-2xl">
                        Nenhum cliente inativo detectado.
                      </div>
                    ) : (
                      <div className="grid gap-2">
                        {inactiveClients.slice(0, 4).map((client) => (
                          <motion.div 
                            key={client.client_phone} 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-900/30 border border-neutral-800/40 hover:bg-neutral-900/60 hover:border-neutral-700 transition-all group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center text-sm font-black text-white group-hover:bg-red-600 transition-colors">
                                {client.client_name.charAt(0)}
                              </div>
                              <div>
                                <h4 className="font-bold text-sm text-white">{client.client_name}</h4>
                                <p className="text-[10px] text-red-500 font-bold flex items-center gap-1">
                                  <Clock className="w-2.5 h-2.5" />
                                  {differenceInDays(new Date(), parseISO(client.last_visit))} dias
                                </p>
                              </div>
                            </div>
                            <Button 
                              variant="success" 
                              size="sm" 
                              onClick={() => handleReactivateWhatsApp(client)}
                              className="bg-emerald-600 hover:bg-emerald-500 glow-green h-8 px-3 text-[10px]"
                            >
                              <MessageCircle className="w-3.5 h-3.5 mr-1.5 fill-current" />
                              Chamar
                            </Button>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="text-center pt-1">
                    <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-[0.2em]">Direto no WhatsApp • Seguro • Rápido</p>
                  </div>
                </div>

                {/* Secondary Business Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                  <div className="saas-card p-2.5 flex items-center justify-between border-neutral-800/30">
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Dinheiro recuperado (R$)</p>
                      <p className={cn(
                        "text-lg font-black",
                        projectedRevenue >= 0 ? "text-emerald-500" : "text-red-500"
                      )}>R$ {projectedRevenue.toFixed(0)}</p>
                      <p className="text-[8px] text-emerald-500 font-bold">+R$ 1.200 essa semana</p>
                    </div>
                    <div className={cn(
                      "w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center",
                      projectedRevenue >= 0 ? "text-emerald-500" : "text-red-500"
                    )}>
                      {projectedRevenue >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    </div>
                  </div>
                  <div className="saas-card p-2.5 flex items-center justify-between border-neutral-800/30">
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Clientes recuperados essa semana</p>
                      <p className={cn(
                        "text-lg font-black",
                        newClientsToday >= 0 ? "text-emerald-500" : "text-red-500"
                      )}>{newClientsToday + 12}</p>
                      <p className="text-[8px] text-emerald-500 font-bold">+3 em relação a ontem</p>
                    </div>
                    <div className={cn(
                      "w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center",
                      newClientsToday >= 0 ? "text-emerald-500" : "text-red-500"
                    )}>
                      <UserCheck className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Evolution Chart */}
                <EvolutionChart data={chartData} />
              </motion.div>
            )}

            {view === 'clients' && (
              <motion.div key="clients" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4 max-w-7xl mx-auto">
                <div className="saas-card p-3 md:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                    <h3 className="text-lg font-bold text-white">Todos os Clientes</h3>
                    <div className="flex gap-2">
                      <ClientDialog onAdd={fetchData} />
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-neutral-800 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                          <th className="pb-3 px-2">Nome</th>
                          <th className="pb-3 px-2">Telefone</th>
                          <th className="pb-3 px-2 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800/50">
                        {clients.map((c) => (
                          <tr key={c.id} className="group hover:bg-neutral-900/30 transition-colors">
                            <td className="py-2.5 px-2">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-[9px] font-bold text-neutral-400 uppercase overflow-hidden">
                                  {(c as any).photo ? (
                                    <img src={(c as any).photo} alt={c.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                  ) : (
                                    c.name.charAt(0)
                                  )}
                                </div>
                                <span className="text-sm font-medium text-white">{c.name}</span>
                              </div>
                            </td>
                            <td className="py-2.5 px-2 text-xs text-neutral-400">{c.phone}</td>
                            <td className="py-2.5 px-2 text-right flex items-center justify-end gap-1">
                              <button 
                                onClick={() => {
                                  const message = `Olá ${c.name}, gostaria de agendar um horário?`;
                                  window.open(`https://wa.me/55${c.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
                                }}
                                className="p-1.5 text-neutral-500 hover:text-emerald-500"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => handleDeleteClient(c.id)}
                                className="p-1.5 text-neutral-500 hover:text-red-500"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {view === 'agenda' && (
              <motion.div key="agenda" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4 max-w-7xl mx-auto">
                <div className="saas-card p-3 md:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                    <h3 className="text-lg font-bold text-white">Agenda Completa</h3>
                    <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                      <Input type="date" className="w-full sm:w-40 h-9 text-sm" defaultValue={format(new Date(), 'yyyy-MM-dd')} />
                      <AppointmentDialog services={services} onAdd={fetchData} settings={settings} appointments={appointments} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    {appointments.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)).map((a) => (
                      <div key={a.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-neutral-900/30 border border-neutral-800/50 group hover:border-red-600/50 transition-all gap-3">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="text-center w-10 sm:w-12 flex-shrink-0">
                            <p className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">{format(parseISO(a.date), 'MMM', { locale: ptBR })}</p>
                            <p className="text-lg sm:text-xl font-black text-white leading-none mt-0.5">{format(parseISO(a.date), 'dd')}</p>
                          </div>
                          <div className="h-8 sm:h-10 w-px bg-neutral-800 flex-shrink-0"></div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-0.5">
                              <span className="text-[10px] font-black text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded flex-shrink-0">{a.time}</span>
                              <p className="text-sm font-bold text-white truncate">{a.client_name}</p>
                            </div>
                            <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider truncate">{a.service_name}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-3 border-t border-neutral-800/50 pt-2 sm:border-0 sm:pt-0">
                          <span className={cn(
                            "text-[8px] font-black uppercase px-1.5 py-0.5 rounded tracking-widest flex-shrink-0",
                            a.status === 'completed' ? "bg-emerald-500/10 text-emerald-500" : "bg-yellow-500/10 text-yellow-500"
                          )}>
                            {a.status === 'completed' ? 'Concluído' : 'Pendente'}
                          </span>
                          <button 
                            onClick={() => handleDeleteAppointment(a.id)}
                            className="p-1.5 text-neutral-600 hover:text-red-500 transition-colors flex-shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {view === 'settings' && (
              <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-4">
                    <div className="saas-card p-4 md:p-6">
                      <h3 className="text-lg font-bold text-white mb-4">Link de Agendamento</h3>
                      <p className="text-xs text-neutral-500 mb-4">Compartilhe este link com seus clientes para que eles possam agendar horários sozinhos.</p>
                      
                      <div className="flex flex-col sm:flex-row gap-2">
                        <div className="flex-1 h-10 bg-neutral-900/50 border border-neutral-800 rounded-xl px-3 flex items-center overflow-hidden">
                          <span className="text-[10px] text-neutral-400 truncate">{window.location.origin}?booking=true</span>
                        </div>
                        <Button 
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}?booking=true`);
                            toast.success('Link copiado!');
                          }}
                          className="h-10 px-4 text-xs"
                        >
                          <Copy className="w-3.5 h-3.5 mr-2" />
                          Copiar Link
                        </Button>
                      </div>
                      
                      <div className="mt-4 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-white">Agendamento Automático</p>
                          <p className="text-[10px] text-neutral-500">Quando um cliente agendar por este link, o horário aparecerá automaticamente na sua agenda.</p>
                        </div>
                      </div>
                    </div>

                    <div className="saas-card p-4 md:p-6">
                      <h3 className="text-lg font-bold text-white mb-4">Serviços Oferecidos</h3>
                      <div className="grid gap-2">
                        {services.map((s) => (
                          <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-neutral-900/30 border border-neutral-800/50">
                            <div>
                              <p className="text-sm font-bold text-white">{s.name}</p>
                              <p className="text-[10px] text-neutral-500">{s.duration} min • R$ {s.price.toFixed(2)}</p>
                            </div>
                            <Button variant="danger" size="sm" className="h-8 w-8 p-0" onClick={async () => {
                              await fetch(`/api/services/${s.id}`, { method: 'DELETE' });
                              fetchData();
                              toast.success('Serviço removido');
                            }}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        ))}
                        <ServiceDialog onAdd={fetchData} />
                      </div>
                    </div>

                    <div className="saas-card p-4 md:p-6">
                      <h3 className="text-lg font-bold text-white mb-4">Horário de Funcionamento</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Abre às</label>
                          <select 
                            className="flex h-10 w-full rounded-xl border border-neutral-800 bg-neutral-900/50 px-3 py-2 text-xs text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500"
                            value={settings.start_time}
                            onChange={async (e) => {
                              const newSettings = { ...settings, start_time: e.target.value };
                              setSettings(newSettings);
                              await fetch('/api/settings', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ start_time: e.target.value })
                              });
                              toast.success('Horário atualizado');
                            }}
                          >
                            {['06:00', '07:00', '08:00', '09:00', '10:00'].map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Fecha às</label>
                          <select 
                            className="flex h-10 w-full rounded-xl border border-neutral-800 bg-neutral-900/50 px-3 py-2 text-xs text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500"
                            value={settings.end_time}
                            onChange={async (e) => {
                              const newSettings = { ...settings, end_time: e.target.value };
                              setSettings(newSettings);
                              await fetch('/api/settings', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ end_time: e.target.value })
                              });
                              toast.success('Horário atualizado');
                            }}
                          >
                            {['17:00', '18:00', '19:00', '20:00', '21:00', '22:00'].map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="saas-card p-4 md:p-6">
                      <h3 className="text-lg font-bold text-white mb-4">Perfil</h3>
                      <div className="flex flex-col items-center text-center gap-4">
                        <div className="relative group">
                          <div className="w-24 h-24 rounded-full bg-neutral-800 border-2 border-red-600 flex items-center justify-center text-3xl font-bold text-white uppercase overflow-hidden">
                            {settings.business_logo ? (
                              <img src={settings.business_logo} alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              settings.business_name.charAt(0)
                            )}
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer">
                            <Camera className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        <div>
                          <p className="font-bold text-white">{settings.business_name}</p>
                          <p className="text-xs text-neutral-500">{settings.business_email}</p>
                        </div>
                        <ProfileDialog settings={settings} onUpdate={fetchData} />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {view === 'pricing' && (
              <PricingView onSelectPlan={() => setView('checkout')} />
            )}

            {view === 'checkout' && (
              <CheckoutView onBack={() => setView('pricing')} />
            )}

            {view === 'onboarding' && (
              <OnboardingView onComplete={() => setView('dashboard')} />
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

function PricingView({ onSelectPlan }: { onSelectPlan: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -10 }} 
      className="space-y-16 max-w-7xl mx-auto pb-20"
    >
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase">
          Escolha o melhor plano para <span className="text-red-600">trazer clientes de volta</span>
        </h2>
        <p className="text-neutral-400 max-w-2xl mx-auto text-sm md:text-base">
          Teste por 3 dias grátis. Se entrar cliente, continua. Se não, sem compromisso.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 pt-8">
        {/* Semanal */}
        <div className="saas-card p-8 flex flex-col h-full border border-neutral-800 hover:border-neutral-700 transition-all">
          <div className="mb-8">
            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">Semanal</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-white">R$19</span>
              <span className="text-neutral-500 text-sm">/semana</span>
            </div>
            <p className="text-neutral-500 text-xs mt-4">Entrada fácil para começar sem peso no bolso</p>
          </div>
          
          <div className="flex-1 space-y-4 mb-8">
            <FeatureItem text="Reativação de clientes pelo WhatsApp" />
            <FeatureItem text="Lista de clientes sumidos" />
            <FeatureItem text="Painel com métricas" />
            <FeatureItem text="Suporte inicial" />
          </div>

          <button onClick={onSelectPlan} className="w-full py-4 rounded-xl bg-neutral-900 text-white font-black uppercase tracking-widest text-xs hover:bg-neutral-800 transition-all border border-neutral-800">
            Começar teste grátis
          </button>
        </div>

        {/* Mensal - Most Recommended */}
        <div className="saas-card p-8 flex flex-col h-full border-2 border-red-600 relative lg:scale-105 shadow-2xl shadow-red-600/10 z-10">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full shadow-lg whitespace-nowrap">
            Mais escolhido
          </div>
          <div className="mb-8">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-black text-white uppercase tracking-tight text-red-500">Mensal</h3>
              <span className="bg-red-600/10 text-red-500 text-[10px] font-black px-2 py-0.5 rounded-md uppercase">15% OFF</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-white">R$41</span>
              <span className="text-neutral-500 text-sm">/mês</span>
              <span className="text-neutral-600 text-xs line-through ml-1">R$49</span>
            </div>
            <p className="text-neutral-500 text-xs mt-4">Melhor custo-benefício para manter a agenda cheia</p>
          </div>
          
          <div className="flex-1 space-y-4 mb-8">
            <FeatureItem text="Tudo do plano semanal" />
            <FeatureItem text="Uso contínuo do sistema" />
            <FeatureItem text="Mais tempo para recuperar clientes" />
            <FeatureItem text="Melhor acompanhamento de resultados" />
          </div>

          <button onClick={onSelectPlan} className="w-full py-4 rounded-xl bg-red-600 text-white font-black uppercase tracking-widest text-xs hover:bg-red-700 transition-all glow-red">
            Começar teste grátis
          </button>
        </div>

        {/* 6 Meses */}
        <div className="saas-card p-8 flex flex-col h-full border border-neutral-800 hover:border-neutral-700 transition-all">
          <div className="mb-8">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-black text-white uppercase tracking-tight">6 meses</h3>
              <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-black px-2 py-0.5 rounded-md uppercase">30% OFF</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">R$205</span>
              <span className="text-neutral-600 text-xs line-through ml-1">R$294</span>
            </div>
            <p className="text-emerald-500 text-[10px] font-bold mt-1">equivale a R$34/mês</p>
            <p className="text-neutral-500 text-xs mt-4">Para quem quer economizar e manter consistência</p>
          </div>
          
          <div className="flex-1 space-y-4 mb-8">
            <FeatureItem text="Tudo do plano mensal" />
            <FeatureItem text="Desconto de 30%" />
            <FeatureItem text="Mais previsibilidade" />
            <FeatureItem text="Melhor retenção de clientes" />
          </div>

          <button onClick={onSelectPlan} className="w-full py-4 rounded-xl bg-neutral-900 text-white font-black uppercase tracking-widest text-xs hover:bg-neutral-800 transition-all border border-neutral-800">
            Garantir desconto
          </button>
        </div>
      </div>

      {/* Trust Section */}
      <div className="saas-card p-4 md:p-8 bg-neutral-900/20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-4 text-center md:text-left flex-1">
            <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2 justify-center md:justify-start">
              <ShieldCheck className="w-6 h-6 text-red-600" />
              Sem risco para começar
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
              <TrustItem text="3 dias grátis para testar" />
              <TrustItem text="Sem burocracia" />
              <TrustItem text="Resultado rápido no WhatsApp" />
              <TrustItem text="Feito para barbeiros" />
            </div>
          </div>
          <div className="hidden md:block w-px h-24 bg-neutral-800"></div>
          <div className="text-center md:text-right space-y-4 flex-1">
            <p className="text-neutral-400 text-sm max-w-xs ml-auto">
              Junte-se a centenas de barbeiros que estão recuperando o faturamento perdido com inteligência.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-2xl mx-auto space-y-6 px-4">
        <h3 className="text-xl font-black text-white uppercase tracking-tight text-center flex items-center gap-2 justify-center">
          <HelpCircle className="w-5 h-5 text-red-600" />
          Perguntas Frequentes
        </h3>
        <div className="space-y-3">
          <FAQItem 
            question="Preciso pagar para testar?" 
            answer="Não. Você testa por 3 dias grátis." 
          />
          <FAQItem 
            question="Funciona no WhatsApp?" 
            answer="Sim, o foco do sistema é facilitar a reativação de clientes pelo WhatsApp." 
          />
          <FAQItem 
            question="Posso cancelar depois?" 
            answer="Sim, sem complicação." 
          />
        </div>
      </div>

      {/* Final CTA */}
      <div className="text-center space-y-6 pt-6">
        <h3 className="text-2xl font-black text-white uppercase tracking-tighter">
          Comece hoje e veja clientes voltando
        </h3>
        <button 
          onClick={onSelectPlan}
          className="px-10 py-5 rounded-2xl bg-red-600 text-white font-black uppercase tracking-[0.2em] text-sm hover:bg-red-700 transition-all glow-red scale-105"
        >
          TESTAR 3 DIAS GRÁTIS
        </button>
      </div>
    </motion.div>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
        <Check className="w-3 h-3 text-emerald-500" />
      </div>
      <span className="text-xs text-neutral-300 font-medium">{text}</span>
    </div>
  );
}

function TrustItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2">
      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
      <span className="text-sm text-neutral-400 font-bold">{text}</span>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string, answer: string }) {
  return (
    <div className="saas-card p-4 border border-neutral-800/50">
      <p className="text-xs font-black text-white uppercase tracking-tight mb-1">{question}</p>
      <p className="text-xs text-neutral-500">{answer}</p>
    </div>
  );
}

function CheckoutView({ onBack }: { onBack: () => void }) {
  const [selectedPlan, setSelectedPlan] = useState<'semanal' | 'mensal' | '6meses'>('mensal');

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }} 
      exit={{ opacity: 0, scale: 0.95 }} 
      className="max-w-4xl mx-auto py-6 px-4"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <button onClick={onBack} className="text-neutral-500 hover:text-white text-[10px] font-bold uppercase tracking-widest mb-4 flex items-center gap-2 mx-auto">
          <ArrowRight className="w-3 h-3 rotate-180" />
          Voltar aos planos
        </button>
        <div className="flex items-center justify-center gap-2 mb-1">
          <Scissors className="w-5 h-5 text-red-600" />
          <h1 className="text-xl font-black text-white uppercase tracking-tighter">Volta Pro Corte</h1>
        </div>
        <p className="text-neutral-400 text-xs font-medium">Teste 3 dias grátis e veja clientes voltando</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Main Form */}
        <div className="md:col-span-3 space-y-4">
          <div className="saas-card p-5 md:p-6 border border-neutral-800">
            <div className="mb-6">
              <h2 className="text-lg font-black text-white uppercase tracking-tight mb-1">Comece seu teste grátis</h2>
              <p className="text-neutral-500 text-[10px]">Sem compromisso. Se fizer sentido pra sua barbearia, você continua.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">Nome da barbearia</label>
                <Input placeholder="Ex: Barbearia do João" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">Seu nome</label>
                <Input placeholder="Como quer ser chamado" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">WhatsApp</label>
                <Input placeholder="(00) 00000-0000" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">Instagram (Opcional)</label>
                <Input placeholder="@suabarbearia" />
              </div>

              <div className="pt-6 space-y-4">
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">Escolha seu plano</label>
                <div className="grid gap-3">
                  <PlanOption 
                    active={selectedPlan === 'semanal'} 
                    onClick={() => setSelectedPlan('semanal')}
                    title="Semanal"
                    price="R$19/semana"
                  />
                  <PlanOption 
                    active={selectedPlan === 'mensal'} 
                    onClick={() => setSelectedPlan('mensal')}
                    title="Mensal"
                    price="R$41/mês"
                    badge="15% OFF"
                  />
                  <PlanOption 
                    active={selectedPlan === '6meses'} 
                    onClick={() => setSelectedPlan('6meses')}
                    title="6 meses"
                    price="R$205"
                    badge="30% OFF"
                  />
                </div>
              </div>

              <div className="pt-8">
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-center gap-3 mb-6">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <p className="text-xs font-bold text-emerald-500">✅ Você testa por 3 dias grátis antes de decidir</p>
                </div>

                <button className="w-full py-5 rounded-2xl bg-red-600 text-white font-black uppercase tracking-[0.2em] text-sm hover:bg-red-700 transition-all glow-red shadow-xl shadow-red-600/20">
                  COMEÇAR TESTE GRÁTIS
                </button>
                <p className="text-center text-[10px] text-neutral-600 font-bold uppercase tracking-widest mt-3">Leva menos de 1 minuto</p>
              </div>
            </div>
          </div>

          {/* FAQ Mini */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FAQMiniItem q="Preciso pagar para testar?" a="Não. Você começa com 3 dias grátis." />
            <FAQMiniItem q="Posso cancelar depois?" a="Sim, sem complicação." />
            <FAQMiniItem q="Como o sistema funciona?" a="Você vê clientes sumidos e chama pelo WhatsApp." />
          </div>
        </div>

        {/* Sidebar Summary */}
        <div className="md:col-span-2 space-y-6">
          <div className="saas-card p-6 border border-neutral-800 bg-neutral-900/20 sticky top-8">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 pb-4 border-b border-neutral-800">O que você recebe</h3>
            <div className="space-y-4">
              <SummaryItem text="Reativação de clientes pelo WhatsApp" />
              <SummaryItem text="Identificação de clientes sumidos" />
              <SummaryItem text="Painel com resultados" />
              <SummaryItem text="Feito para barbeiros" />
            </div>

            <div className="mt-10 pt-6 border-t border-neutral-800 space-y-3">
              <TrustBadge text="Sem burocracia" />
              <TrustBadge text="Cancelamento simples" />
              <TrustBadge text="Feito para trazer clientes de volta" />
              <TrustBadge text="Funciona direto no WhatsApp" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function PlanOption({ active, onClick, title, price, badge }: { active: boolean, onClick: () => void, title: string, price: string, badge?: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200",
        active ? "bg-red-600/10 border-red-600 shadow-lg shadow-red-600/5" : "bg-neutral-900/40 border-neutral-800 hover:border-neutral-700"
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-4 h-4 rounded-full border-2 flex items-center justify-center",
          active ? "border-red-600" : "border-neutral-700"
        )}>
          {active && <div className="w-2 h-2 rounded-full bg-red-600" />}
        </div>
        <div className="text-left">
          <p className={cn("text-xs font-black uppercase tracking-tight", active ? "text-white" : "text-neutral-400")}>{title}</p>
          {badge && <span className="text-[8px] font-black uppercase tracking-widest text-red-500">{badge}</span>}
        </div>
      </div>
      <p className={cn("text-sm font-black", active ? "text-white" : "text-neutral-400")}>{price}</p>
    </button>
  );
}

function SummaryItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-5 h-5 rounded-full bg-red-600/10 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Check className="w-3 h-3 text-red-600" />
      </div>
      <span className="text-xs text-neutral-400 font-medium leading-tight">{text}</span>
    </div>
  );
}

function TrustBadge({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
      <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">{text}</span>
    </div>
  );
}

function FAQMiniItem({ q, a }: { q: string, a: string }) {
  return (
    <div className="saas-card p-4 bg-neutral-900/10 border border-neutral-800/30">
      <p className="text-[9px] font-black text-white uppercase tracking-tight mb-1">{q}</p>
      <p className="text-[9px] text-neutral-600 leading-tight">{a}</p>
    </div>
  );
}

function OnboardingView({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    business_name: '',
    user_name: '',
    whatsapp: '',
    avg_price: '50'
  });

  const next = () => setStep(s => s + 1);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div 
            key="welcome"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="text-center space-y-8 max-w-md"
          >
            <div className="w-20 h-20 bg-red-600 rounded-3xl flex items-center justify-center mx-auto glow-red rotate-3">
              <Scissors className="w-10 h-10 text-white" />
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">
                Bem-vindo ao <br /> <span className="text-red-600">Volta Pro Corte 💈</span>
              </h2>
              <p className="text-neutral-400 font-medium">Vamos trazer seus clientes antigos de volta pelo WhatsApp</p>
              <p className="text-[10px] text-neutral-600 font-bold uppercase tracking-widest">Leva menos de 1 minuto</p>
            </div>
            <button 
              onClick={next}
              className="w-full py-5 rounded-2xl bg-red-600 text-white font-black uppercase tracking-[0.2em] text-sm hover:bg-red-700 transition-all glow-red"
            >
              COMEÇAR
            </button>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="saas-card p-6 max-w-md w-full space-y-6"
          >
            <div className="space-y-1">
              <h3 className="text-lg font-black text-white uppercase tracking-tight">Dados da barbearia</h3>
              <p className="text-neutral-500 text-[10px]">Conte um pouco sobre seu negócio</p>
            </div>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest ml-1">Nome da barbearia</label>
                <Input 
                  className="h-10 text-sm"
                  placeholder="Ex: Barbearia Premium" 
                  value={data.business_name}
                  onChange={e => setData({...data, business_name: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest ml-1">Seu nome</label>
                <Input 
                  className="h-10 text-sm"
                  placeholder="Como quer ser chamado" 
                  value={data.user_name}
                  onChange={e => setData({...data, user_name: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest ml-1">WhatsApp da barbearia</label>
                <Input 
                  className="h-10 text-sm"
                  placeholder="(00) 00000-0000" 
                  value={data.whatsapp}
                  onChange={e => setData({...data, whatsapp: e.target.value})}
                />
              </div>
              <button 
                onClick={next}
                disabled={!data.business_name || !data.user_name || !data.whatsapp}
                className="w-full py-3.5 rounded-xl bg-red-600 text-white font-black uppercase tracking-widest text-[10px] hover:bg-red-700 transition-all glow-red disabled:opacity-50 disabled:glow-none mt-2"
              >
                Continuar
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="saas-card p-6 max-w-md w-full space-y-6"
          >
            <div className="space-y-1">
              <h3 className="text-lg font-black text-white uppercase tracking-tight">Quanto vale um cliente pra você?</h3>
              <p className="text-neutral-500 text-[10px]">Usamos isso para mostrar quanto você pode recuperar</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest ml-1">Valor médio do corte/barba</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 font-bold text-xs">R$</span>
                  <Input 
                    type="number"
                    className="pl-10 h-10 text-sm"
                    placeholder="50" 
                    value={data.avg_price}
                    onChange={e => setData({...data, avg_price: e.target.value})}
                  />
                </div>
              </div>
              <button 
                onClick={next}
                className="w-full py-3.5 rounded-xl bg-red-600 text-white font-black uppercase tracking-widest text-[10px] hover:bg-red-700 transition-all glow-red"
              >
                Continuar
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div 
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="saas-card p-6 max-w-md w-full space-y-6"
          >
            <div className="space-y-1 text-center">
              <h3 className="text-lg font-black text-white uppercase tracking-tight">Adicione seus clientes</h3>
              <p className="text-neutral-500 text-[10px]">Vamos identificar quem está sumido há 30+ dias</p>
            </div>
            <div className="grid gap-3">
              <button className="p-4 rounded-2xl border border-neutral-800 bg-neutral-900/40 hover:border-red-600/50 hover:bg-red-600/5 transition-all text-left group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-neutral-800 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-colors">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-white uppercase tracking-tight">Importar lista</p>
                    <p className="text-[9px] text-neutral-500 font-bold">Excel ou CSV</p>
                  </div>
                </div>
              </button>
              <button className="p-4 rounded-2xl border border-neutral-800 bg-neutral-900/40 hover:border-red-600/50 hover:bg-red-600/5 transition-all text-left group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-neutral-800 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-colors">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-white uppercase tracking-tight">Adicionar manualmente</p>
                    <p className="text-[9px] text-neutral-500 font-bold">Um por um</p>
                  </div>
                </div>
              </button>
              <button 
                onClick={next}
                className="w-full py-3.5 rounded-xl bg-red-600 text-white font-black uppercase tracking-widest text-[10px] hover:bg-red-700 transition-all glow-red mt-2"
              >
                Continuar
              </button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div 
            key="step4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="text-center space-y-8 max-w-md w-full"
          >
            <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Pronto. Já encontramos clientes para reativar</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="saas-card p-6 border border-neutral-800">
                <p className="text-3xl font-black text-white leading-none">12</p>
                <p className="text-[10px] text-neutral-500 font-black uppercase tracking-widest mt-2">Clientes sumidos</p>
              </div>
              <div className="saas-card p-6 border border-emerald-500/20 bg-emerald-500/5">
                <p className="text-3xl font-black text-emerald-500 leading-none">R${(Number(data.avg_price || 0) * 12).toLocaleString('pt-BR')}</p>
                <p className="text-[10px] text-emerald-500/60 font-black uppercase tracking-widest mt-2">Pode recuperar</p>
              </div>
            </div>

            <div className="saas-card p-6 bg-neutral-900/20 border border-neutral-800 space-y-4">
              <p className="text-sm font-bold text-white">Agora é só chamar no WhatsApp e começar a trazer clientes de volta</p>
              <div className="flex flex-wrap justify-center gap-3">
                <OnboardingBadge text="1 clique = cliente voltando" />
                <OnboardingBadge text="Sem complicação" />
                <OnboardingBadge text="Feito para barbeiros" />
              </div>
            </div>

            <button 
              onClick={onComplete}
              className="w-full py-5 rounded-2xl bg-red-600 text-white font-black uppercase tracking-[0.2em] text-sm hover:bg-red-700 transition-all glow-red"
            >
              VER CLIENTES PRONTOS PRA VOLTAR
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function OnboardingBadge({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-800">
      <div className="w-1 h-1 rounded-full bg-red-600" />
      <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">{text}</span>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-bold transition-all duration-200",
        active 
          ? "bg-red-600 text-white shadow-lg glow-red scale-[1.02]" 
          : "text-neutral-500 hover:text-white hover:bg-neutral-900/50"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function EvolutionChart({ data }: { data: any[] }) {
  return (
    <div className="saas-card p-4 h-64 w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xs font-black text-neutral-500 uppercase tracking-widest">Desempenho Semanal</h3>
          <p className="text-[10px] text-emerald-500 font-bold mt-0.5">+12% em relação à semana passada</p>
        </div>
        <div className="flex gap-4 text-[9px] font-bold uppercase tracking-tighter">
          <span className="flex items-center gap-1 text-emerald-500"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Faturamento</span>
          <span className="flex items-center gap-1 text-blue-500"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Clientes Recuperados</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height="80%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
          <XAxis 
            dataKey="name" 
            stroke="#525252" 
            fontSize={9} 
            tickLine={false} 
            axisLine={false} 
          />
          <YAxis hide />
          <Tooltip 
            contentStyle={{ backgroundColor: '#111', border: '1px solid #262626', borderRadius: '8px', fontSize: '10px', color: '#fff' }}
            itemStyle={{ padding: '2px 0' }}
            formatter={(value: any, name: string) => [
              name === 'revenue' ? `R$ ${value}` : `${value} clientes`,
              name === 'revenue' ? 'Faturamento' : 'Recuperados'
            ]}
            labelStyle={{ color: '#737373', marginBottom: '4px', fontWeight: 'bold' }}
          />
          <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
          <Area type="monotone" dataKey="recovered" stroke="#3b82f6" fillOpacity={0} strokeWidth={2} strokeDasharray="5 5" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function MetricCard({ label, value, icon, variant, forceColor }: { label: string, value: string | number, icon: React.ReactNode, variant: 'danger' | 'warning' | 'success', forceColor?: 'success' | 'danger' }) {
  const variants = {
    danger: "border-red-900/20 bg-red-950/5",
    warning: "border-yellow-900/20 bg-yellow-950/5",
    success: "border-emerald-900/20 bg-emerald-950/5"
  };

  const textColors = {
    danger: "text-red-500",
    warning: "text-yellow-500",
    success: "text-emerald-500"
  };

  const glowColors = {
    danger: "glow-red",
    warning: "shadow-[0_0_20px_rgba(234,179,8,0.05)]",
    success: "glow-green"
  };

  const activeVariant = forceColor || variant;

  return (
    <div className={cn(
      "metric-card p-2 md:p-2.5",
      variants[activeVariant],
      glowColors[activeVariant]
    )}>
      <div className="flex items-center justify-between mb-0.5">
        <p className="text-[8px] font-black text-neutral-500 uppercase tracking-[0.1em]">{label}</p>
        <div className={cn("p-1 rounded-lg bg-neutral-900/50", textColors[activeVariant])}>
          {React.cloneElement(icon as React.ReactElement, { className: 'w-3.5 h-3.5' })}
        </div>
      </div>
      <p className={cn(
        "text-xl md:text-2xl font-black tracking-tighter font-display",
        textColors[activeVariant]
      )}>{value}</p>
    </div>
  );
}

function AppointmentDialog({ services, onAdd, settings, appointments }: { services: Service[], onAdd: () => void, settings: any, appointments: Appointment[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [time, setTime] = useState('');

  const generateTimeSlots = () => {
    const slots = [];
    let current = parseInt(settings.start_time.split(':')[0]);
    const end = parseInt(settings.end_time.split(':')[0]);
    
    // Get already booked times for the selected date
    const bookedTimes = appointments
      .filter(a => a.date === date)
      .map(a => a.time);

    for (let i = current; i < end; i++) {
      const hour = i.toString().padStart(2, '0');
      const t1 = `${hour}:00`;
      const t2 = `${hour}:30`;
      
      if (!bookedTimes.includes(t1)) slots.push(t1);
      if (!bookedTimes.includes(t2)) slots.push(t2);
    }
    return slots;
  };

  const times = generateTimeSlots();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_name: name,
          client_phone: phone,
          service_id: parseInt(serviceId),
          date,
          time
        })
      });
      onAdd();
      setOpen(false);
      setName('');
      setPhone('');
      setServiceId('');
      setTime('');
      toast.success('Agendamento realizado!');
    } catch (error) {
      toast.error('Erro ao realizar agendamento');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return (
    <Button size="sm" className="w-full md:w-auto" onClick={() => setOpen(true)}>
      <Plus className="w-4 h-4 mr-2" /> Novo Agendamento
    </Button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="saas-card p-8 w-full max-w-md shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-6">Novo Agendamento</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Nome do Cliente</label>
            <Input placeholder="Nome" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">WhatsApp</label>
            <Input placeholder="(00) 00000-0000" value={phone} onChange={e => setPhone(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Serviço</label>
            <select 
              className="flex h-11 w-full rounded-xl border border-neutral-800 bg-neutral-900/50 px-4 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500"
              value={serviceId}
              onChange={e => setServiceId(e.target.value)}
              required
            >
              <option value="">Selecione um serviço</option>
              {services.map(s => (
                <option key={s.id} value={s.id}>{s.name} - R$ {s.price}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Data</label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Hora</label>
              <select 
                className="flex h-11 w-full rounded-xl border border-neutral-800 bg-neutral-900/50 px-4 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500"
                value={time}
                onChange={e => setTime(e.target.value)}
                required
              >
                <option value="">Hora</option>
                {times.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-2 pt-4">
            <Button type="submit" disabled={loading}>{loading ? 'Confirmando...' : 'Confirmar'}</Button>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function ClientDialog({ onAdd }: { onAdd: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [photo, setPhoto] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, photo })
      });
      if (!res.ok) throw new Error();
      onAdd();
      setOpen(false);
      setName('');
      setPhone('');
      setPhoto('');
      toast.success('Cliente cadastrado!');
    } catch (error) {
      toast.error('Erro ao cadastrar cliente');
    }
  };

  if (!open) return (
    <Button size="sm" onClick={() => setOpen(true)}>
      <Plus className="w-4 h-4 mr-2" /> Novo Cliente
    </Button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="saas-card p-8 w-full max-w-md shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-6">Novo Cliente</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div 
              className="relative group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-20 h-20 rounded-full bg-neutral-800 border-2 border-neutral-700 flex items-center justify-center text-2xl font-bold text-white uppercase overflow-hidden">
                {photo ? (
                  <img src={photo} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  name.charAt(0) || <Users className="w-8 h-8 text-neutral-600" />
                )}
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange} 
              />
            </div>
            <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Foto do Cliente (Opcional)</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Nome</label>
              <Input placeholder="Nome" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">WhatsApp</label>
              <Input placeholder="(00) 00000-0000" value={phone} onChange={e => setPhone(e.target.value)} required />
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-4">
            <Button type="submit">Salvar</Button>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function ProfileDialog({ settings, onUpdate }: { settings: any, onUpdate: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(settings.business_name);
  const [email, setEmail] = useState(settings.business_email);
  const [logo, setLogo] = useState(settings.business_logo || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ business_name: name, business_email: email, business_logo: logo })
      });
      onUpdate();
      setOpen(false);
      toast.success('Perfil atualizado!');
    } catch (error) {
      toast.error('Erro ao atualizar perfil');
    }
  };

  if (!open) return (
    <Button variant="outline" className="w-full" onClick={() => setOpen(true)}>Editar Perfil</Button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="saas-card p-8 w-full max-w-md shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-6">Editar Perfil</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div 
              className="relative group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-24 h-24 rounded-full bg-neutral-800 border-2 border-red-600 flex items-center justify-center text-3xl font-bold text-white uppercase overflow-hidden">
                {logo ? (
                  <img src={logo} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  name.charAt(0)
                )}
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange} 
              />
            </div>
            <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Clique para alterar a foto</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Nome da Barbearia</label>
              <Input value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">E-mail</label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-4">
            <Button type="submit">Salvar Alterações</Button>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function ServiceDialog({ onAdd }: { onAdd: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, price: parseFloat(price), duration: parseInt(duration) })
      });
      onAdd();
      setOpen(false);
      setName('');
      setPrice('');
      setDuration('');
      toast.success('Serviço adicionado!');
    } catch (error) {
      toast.error('Erro ao adicionar serviço');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return <Button variant="outline" className="w-full border-dashed" onClick={() => setOpen(true)}><Plus className="w-4 h-4 mr-2" /> Adicionar Novo Serviço</Button>;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="saas-card p-8 w-full max-w-md shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-6">Novo Serviço</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Nome do Serviço</label>
            <Input placeholder="Ex: Corte Degradê" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Preço (R$)</label>
              <Input type="number" step="0.01" placeholder="0.00" value={price} onChange={e => setPrice(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Duração (min)</label>
              <Input type="number" placeholder="30" value={duration} onChange={e => setDuration(e.target.value)} required />
            </div>
          </div>
          <div className="flex flex-col gap-2 pt-4">
            <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Salvar Serviço'}</Button>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function PublicBooking({ services, onComplete, settings, appointments }: { services: Service[], onComplete: () => void, settings: any, appointments: Appointment[] }) {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [time, setTime] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const generateTimeSlots = () => {
    const slots = [];
    let current = parseInt(settings.start_time.split(':')[0]);
    const end = parseInt(settings.end_time.split(':')[0]);
    
    // Get already booked times for the selected date
    const bookedTimes = appointments
      .filter(a => a.date === date)
      .map(a => a.time);

    for (let i = current; i < end; i++) {
      const hour = i.toString().padStart(2, '0');
      const t1 = `${hour}:00`;
      const t2 = `${hour}:30`;
      
      if (!bookedTimes.includes(t1)) slots.push(t1);
      if (!bookedTimes.includes(t2)) slots.push(t2);
    }
    return slots;
  };

  const times = generateTimeSlots();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;

    try {
      await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_name: name,
          client_phone: phone,
          service_id: selectedService.id,
          date,
          time
        })
      });
      onComplete();
      setStep(4);
    } catch (error) {
      toast.error('Erro ao realizar agendamento');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
      <Toaster theme="dark" position="top-center" />
      <div className="saas-card w-full max-w-md p-6 md:p-8">
        <div className="flex flex-col items-center text-center gap-3 mb-8">
          <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center glow-red">
            <Scissors className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Agendar Horário</h1>
            <p className="text-neutral-500 text-xs font-medium mt-0.5">{settings.business_name} 💈</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Selecione o serviço:</h3>
              <div className="grid gap-2">
                {services.map(s => (
                  <button
                    key={s.id}
                    onClick={() => { setSelectedService(s); setStep(2); }}
                    className="flex justify-between items-center p-4 rounded-xl border border-neutral-800 bg-neutral-900/30 hover:border-red-600 hover:bg-neutral-900 transition-all text-left group"
                  >
                    <div>
                      <div className="font-bold text-base text-white">{s.name}</div>
                      <div className="text-[10px] text-neutral-500 uppercase font-bold">{s.duration} min</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-white">R$ {s.price.toFixed(0)}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-neutral-700 group-hover:text-red-500 group-hover:translate-x-1 transition-all" />
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Escolha a data e hora:</h3>
                <Input type="date" className="h-10 text-sm" value={date} onChange={e => setDate(e.target.value)} min={format(new Date(), 'yyyy-MM-dd')} />
                <div className="grid grid-cols-3 gap-2">
                  {times.map(t => (
                    <button
                      key={t}
                      onClick={() => setTime(t)}
                      className={cn(
                        "py-2.5 rounded-xl border text-xs font-bold transition-all",
                        time === t ? "bg-red-600 text-white border-red-600 glow-red" : "border-neutral-800 bg-neutral-900/30 text-neutral-400 hover:border-neutral-600"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button size="lg" disabled={!time} onClick={() => setStep(3)}>Continuar</Button>
                <Button variant="ghost" onClick={() => setStep(1)}>Voltar</Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Seus dados:</h3>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Nome Completo</label>
                  <Input className="h-10 text-sm" placeholder="Seu nome" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">WhatsApp</label>
                  <Input className="h-10 text-sm" placeholder="(00) 00000-0000" value={phone} onChange={e => setPhone(e.target.value)} required />
                </div>
                <div className="pt-4 space-y-2">
                  <Button type="submit" size="default" className="w-full">Confirmar Agendamento</Button>
                  <Button type="button" variant="ghost" size="sm" className="w-full" onClick={() => setStep(2)}>Voltar</Button>
                </div>
              </form>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6 py-10">
              <div className="w-20 h-20 bg-green-950/30 border border-green-900/50 rounded-full flex items-center justify-center mx-auto mb-6 glow-green">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-white">Horário Reservado!</h2>
              <p className="text-neutral-500 font-medium">Seu agendamento foi confirmado com sucesso. Nos vemos em breve!</p>
              <Button variant="outline" className="mt-6" onClick={() => window.location.reload()}>Fazer outro agendamento</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
