import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);
import { 
  User, 
  Settings, 
  Truck, 
  Store, 
  Plus, 
  Check, 
  X, 
  MapPin, 
  LogOut, 
  ChevronRight, 
  Star, 
  Clock, 
  DollarSign, 
  BarChart3, 
  Users, 
  ClipboardList,
  Wallet,
  TrendingUp,
  ShoppingBag,
  Bike,
  Download,
  RefreshCw,
  Trash2,
  AlertCircle,
  Edit2,
  ShieldAlert,
  Trash,
  ChefHat,
  Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '2rem'
};

const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  fullscreenControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  styles: []
};

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const MARKER_ICONS = {
  restaurant: { url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#000"/><text x="50" y="65" font-size="40" text-anchor="middle">🏪</text></svg>'), scaledSize: { width: 32, height: 32 } },
  client: { url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#10b981"/><text x="50" y="65" font-size="40" text-anchor="middle">👤</text></svg>'), scaledSize: { width: 32, height: 32 } },
  driver: { url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#f59e0b"/><text x="50" y="65" font-size="40" text-anchor="middle">🏍️</text></svg>'), scaledSize: { width: 40, height: 40 } }
};

function DeliveryMap({ driverLoc, restaurantLoc, clientLoc }: any) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  });

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    setMapReady(true);
  }, []);

  useEffect(() => {
    if (!mapRef.current || !mapReady) return;

    const bounds = new window.google.maps.LatLngBounds();
    let hasLocations = false;

    if (restaurantLoc?.lat && restaurantLoc?.lng) {
      bounds.extend({ lat: restaurantLoc.lat, lng: restaurantLoc.lng });
      hasLocations = true;
    }
    if (clientLoc?.lat && clientLoc?.lng) {
      bounds.extend({ lat: clientLoc.lat, lng: clientLoc.lng });
      hasLocations = true;
    }
    if (driverLoc?.lat && driverLoc?.lng) {
      bounds.extend({ lat: driverLoc.lat, lng: driverLoc.lng });
      hasLocations = true;
    }

    if (hasLocations) {
      mapRef.current.fitBounds(bounds, { top: 50, right: 50, bottom: 100, left: 50 });
    }
  }, [driverLoc, restaurantLoc, clientLoc, mapReady]);

  const defaultCenter = { lat: -23.5505, lng: -46.6333 };
  const center = driverLoc?.lat ? { lat: driverLoc.lat, lng: driverLoc.lng } : 
                 restaurantLoc?.lat ? { lat: restaurantLoc.lat, lng: restaurantLoc.lng } :
                 clientLoc?.lat ? { lat: clientLoc.lat, lng: clientLoc.lng } : defaultCenter;

  const distToCli = driverLoc && clientLoc ? calculateDistance(driverLoc.lat, driverLoc.lng, clientLoc.lat, clientLoc.lng) : 0;
  const distToRes = driverLoc && restaurantLoc ? calculateDistance(driverLoc.lat, driverLoc.lng, restaurantLoc.lat, restaurantLoc.lng) : 0;

  if (loadError) {
    return (
      <div className="relative h-[300px] w-full rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl bg-slate-100 flex items-center justify-center">
        <p className="text-sm text-black/50">Erro ao carregar Google Maps</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="relative h-[300px] w-full rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl bg-slate-100 flex items-center justify-center">
        <div className="text-center p-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-black border-t-transparent mx-auto mb-2" />
          <p className="text-xs text-black/40">Carregando mapa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[300px] w-full rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl bg-white">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={15}
        onLoad={onLoad}
        options={mapOptions}
      >
        {restaurantLoc?.lat && (
          <MarkerF
            position={{ lat: restaurantLoc.lat, lng: restaurantLoc.lng }}
            icon={MARKER_ICONS.restaurant}
          />
        )}
        {clientLoc?.lat && (
          <MarkerF
            position={{ lat: clientLoc.lat, lng: clientLoc.lng }}
            icon={MARKER_ICONS.client}
          />
        )}
        {driverLoc?.lat && (
          <MarkerF
            position={{ lat: driverLoc.lat, lng: driverLoc.lng }}
            icon={MARKER_ICONS.driver}
          />
        )}
      </GoogleMap>
      
      <div className="absolute top-4 left-4 z-20">
         <div className="bg-black/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[10px] font-black text-white uppercase tracking-widest">
              {(distToCli < 0.1 && distToCli > 0) ? "Pedido Entregue" : (distToCli < 0.5 && distToCli > 0) ? "O entregador está na sua rua!" : "Acompanhando em tempo real"}
            </p>
         </div>
      </div>

      <div className="absolute bottom-4 left-4 right-4 flex gap-3 z-20">
         {restaurantLoc && (
           <Card className="flex-1 bg-white/80 backdrop-blur-md p-3 border-none flex items-center justify-between shadow-xl">
              <div>
                 <p className="text-[8px] font-black text-black/40 uppercase">Para Loja</p>
                 <p className="text-xs font-black">{distToRes.toFixed(2)} km</p>
              </div>
              <Store size={12} className="text-black/20" />
           </Card>
         )}
         {clientLoc && (
           <Card className="flex-1 bg-white/80 backdrop-blur-md p-3 border-none flex items-center justify-between shadow-xl">
              <div>
                 <p className="text-[8px] font-black text-black/40 uppercase">Para Cliente</p>
                 <p className="text-xs font-black">{distToCli.toFixed(2)} km</p>
              </div>
              <User size={12} className="text-emerald-500/40" />
           </Card>
         )}
      </div>
    </div>
  );
}

function AdminLiveMap({ drivers, locations }: { drivers: any[], locations: Record<string, any> }) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script-admin',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  });

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    setMapReady(true);
  }, []);

  useEffect(() => {
    if (!mapRef.current || !mapReady) return;

    const bounds = new window.google.maps.LatLngBounds();
    let hasLocations = false;

    Object.keys(locations).forEach(id => {
      const loc = locations[id];
      if (loc.lat && loc.lng) {
        bounds.extend({ lat: loc.lat, lng: loc.lng });
        hasLocations = true;
      }
    });

    if (hasLocations) {
      mapRef.current.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
    }
  }, [locations, mapReady]);

  const defaultCenter = { lat: -23.5505, lng: -46.6333 };
  const activeIds = Object.keys(locations);
  const center = activeIds.length > 0 && locations[activeIds[0]]?.lat 
    ? { lat: locations[activeIds[0]].lat, lng: locations[activeIds[0]].lng }
    : defaultCenter;

  if (loadError) {
    return (
      <Card className="relative h-[500px] w-full bg-slate-100 rounded-[2rem] overflow-hidden border-none shadow-inner flex items-center justify-center">
        <p className="text-sm text-black/50">Erro ao carregar Google Maps</p>
      </Card>
    );
  }

  if (!isLoaded) {
    return (
      <Card className="relative h-[500px] w-full bg-slate-100 rounded-[2rem] overflow-hidden border-none shadow-inner flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-black border-t-transparent" />
      </Card>
    );
  }

  return (
    <Card className="relative h-[500px] w-full bg-slate-100 rounded-[2rem] overflow-hidden border-none shadow-inner">
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={center}
        zoom={13}
        onLoad={onLoad}
        options={mapOptions}
      >
        {activeIds.map(id => {
          const loc = locations[id];
          const driver = drivers.find(d => d.id === id || d.id === parseInt(id));
          const isStale = Date.now() - loc.timestamp > 30000;
          
          return (
            <MarkerF
              key={id}
              position={{ lat: loc.lat, lng: loc.lng }}
              icon={{
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
                  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="${isStale ? '#9ca' : '#f59e0b'}" opacity="${isStale ? 0.5 : 1}"/>
                    <text x="50" y="65" font-size="40" text-anchor="middle">🏍️</text>
                  </svg>`
                ),
                scaledSize: { width: 36, height: 36 }
              }}
              title={driver?.name || 'Entregador'}
            />
          );
        })}
      </GoogleMap>

      <div className="absolute top-6 left-6 z-20">
         <div className="bg-black/80 backdrop-blur-md text-white px-4 py-2 rounded-2xl flex items-center gap-2 shadow-xl border border-white/10">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[10px] font-black uppercase tracking-widest">{activeIds.length} Entregadores Online</span>
         </div>
      </div>

      {activeIds.length === 0 && (
        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-black/20 z-10">
           <Truck size={48} className="mb-4 opacity-10" />
           <p className="font-black uppercase tracking-widest text-sm">Nenhum entregador transmitindo localização</p>
        </div>
      )}
    </Card>
  );
}

function APKDownload() {
  return (
    <div className="fixed bottom-6 right-6 z-[100] group">
      <div className="absolute -inset-2 bg-emerald-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
      <a 
        href="https://delivr.app/download" 
        target="_blank"
        rel="noreferrer"
        className="relative flex items-center gap-3 bg-black text-white px-6 py-4 rounded-3xl shadow-2xl hover:scale-110 active:scale-95 transition-all"
      >
        <div className="bg-emerald-500 p-2 rounded-xl">
          <Download size={20} />
        </div>
        <div className="text-left">
          <p className="text-[10px] font-black uppercase opacity-50">Mobile App</p>
          <p className="text-sm font-black">Baixar APK</p>
        </div>
      </a>
    </div>
  );
}

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
type Role = 'admin' | 'client' | 'restaurant' | 'driver';
type Status = 'pending' | 'approved';

interface UserData {
  id: number;
  username: string;
  role: Role;
  status: Status;
  name: string;
  id_document?: string;
  selfie?: string;
  avatar?: string;
  phone?: string;
  cpf?: string;
}

interface Restaurant {
  id: number;
  userId: number;
  name: string;
  address: string;
  category: string;
}

interface MenuItem {
  id: number;
  restaurantId: number;
  name: string;
  description: string;
  price: number;
  image: string;
}

interface Order {
  id: number;
  clientId: number;
  restaurantId: number;
  driverId: number | null;
  status: 'pending' | 'preparing' | 'out_for_delivery' | 'delivered';
  total_price: number;
  client_lat: number;
  client_lng: number;
  address?: string;
  created_at: string;
  restaurantName?: string;
  clientName?: string;
  restaurantAddress?: string;
  delivery_type?: 'own' | 'platform';
  restaurantLat?: number;
  restaurantLng?: number;
}

// --- Components ---

const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'ghost' | 'default', size?: 'default' | 'icon' | 'sm' }>(({ className, variant = 'default', size = 'default', ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
      variant === 'default' ? "bg-black text-white hover:bg-black/90" : "bg-transparent text-black hover:bg-black/5",
      size === 'icon' ? "h-10 w-10 p-0" : size === 'sm' ? "h-8 px-3 text-xs" : "h-10 px-4",
      className
    )}
    {...props}
  />
));

const Card = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("rounded-2xl border border-black/5 bg-white p-6 shadow-sm", className)} {...props}>
    {children}
  </div>
);

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<UserData | null>(null);
  const [view, setView] = useState<'login' | 'register' | 'dashboard'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        // If the saved user has large image fields (from previous versions), clear it
        if (parsedUser.id_document || parsedUser.selfie) {
          localStorage.removeItem('user');
          return;
        }
        setUser(parsedUser);
        setView('dashboard');
      }
    } catch (e) {
      console.error('Error loading user from localStorage:', e);
      localStorage.removeItem('user');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setView('login');
  };

  if (view === 'login') return (
    <LoginView 
      onLogin={(u) => { 
        setUser(u); 
        setView('dashboard'); 
        try {
          localStorage.setItem('user', JSON.stringify(u)); 
        } catch (e) {
          console.error('Failed to save user to localStorage:', e);
          // If it fails, we still have the user in memory, but they'll have to login again next time
        }
      }} 
      onGoToRegister={() => setView('register')} 
    />
  );
  if (view === 'register') return <RegisterView onRegister={() => setView('login')} onGoToLogin={() => setView('login')} />;

  return (
    <div className="min-h-screen bg-[#f5f5f5] font-sans text-black">
      <nav className="sticky top-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
              <ShoppingBag size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight">DelivR</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-black/50 capitalize">{user?.role}</p>
            </div>
            {user?.avatar ? (
              <img src={user.avatar} alt="Avatar" className="h-10 w-10 rounded-full object-cover shadow-sm bg-black/5 border border-black/10" referrerPolicy="no-referrer" />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/5 text-sm font-bold text-black/40">
                {user?.name?.charAt(0) || 'U'}
              </div>
            )}
            <Button variant="ghost" size="icon" onClick={handleLogout} className="rounded-full hover:bg-black/5 ml-2">
              <LogOut size={18} />
            </Button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl p-4 md:p-8">
        {user?.role === 'admin' && <AdminDashboard user={user} />}
        {user?.role === 'restaurant' && <RestaurantDashboard user={user} />}
        {user?.role === 'driver' && <DriverDashboard user={user} />}
        {user?.role === 'client' && <ClientDashboard user={user} />}
      </main>
      <APKDownload />
    </div>
  );
}

// --- Auth Views ---

function LoginView({ onLogin, onGoToRegister }: { onLogin: (u: UserData) => void, onGoToRegister: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (res.ok) onLogin(data);
    else setError(data.error);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f5f5] p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Card className="p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white">
              <ShoppingBag size={24} />
            </div>
            <h1 className="text-2xl font-bold">Bem-vindo de volta</h1>
            <p className="text-black/50">Entre na sua conta DelivR</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Usuário</label>
              <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-black/10 px-4 py-2 focus:border-black focus:outline-none" 
                required 
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Senha</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-black/10 px-4 py-2 focus:border-black focus:outline-none" 
                required 
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full py-3">Entrar</Button>
          </form>
          <div className="mt-6 text-center">
            <button onClick={onGoToRegister} className="text-sm font-medium hover:underline">Não tem conta? Cadastre-se</button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

function RegisterView({ onRegister, onGoToLogin }: { onRegister: () => void, onGoToLogin: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('client');
  const [idDoc, setIdDoc] = useState<string | null>(null);
  const [selfie, setSelfie] = useState<string | null>(null);
  const [idDocBack, setIdDocBack] = useState<string | null>(null);
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');
  const [error, setError] = useState('');
  const [showCamera, setShowCamera] = useState<'selfie' | 'docFront' | 'docBack' | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const openCamera = async (type: 'selfie' | 'docFront' | 'docBack') => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: type === 'selfie' ? 'user' : 'environment' } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setShowCamera(type);
    } catch (err) {
      alert('Erro ao acessar câmera. Verifique as permissões.');
      console.error(err);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && streamRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        if (showCamera === 'selfie') {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        
        if (showCamera === 'selfie') setSelfie(dataUrl);
        else if (showCamera === 'docFront') setIdDoc(dataUrl);
        else if (showCamera === 'docBack') setIdDocBack(dataUrl);
        
        closeCamera();
      }
    }
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setter(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (role === 'client' && (!idDoc || !selfie || !idDocBack)) {
      setError('Selfie, documento frente e verso são obrigatórios.');
      return;
    }
    const combinedDoc = idDoc && idDocBack ? `${idDoc}|||${idDocBack}` : idDoc;
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, name, role, id_document: combinedDoc, selfie, phone, cpf })
    });
    const data = await res.json();
    if (res.ok) onRegister();
    else setError(data.error);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f5f5] p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Card className="p-8">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold">Criar conta</h1>
            <p className="text-black/50">Junte-se à comunidade DelivR</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Nome Completo</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-black/10 px-4 py-2 focus:border-black focus:outline-none" 
                required 
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Usuário</label>
              <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-black/10 px-4 py-2 focus:border-black focus:outline-none" 
                required 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">CPF</label>
                <input 
                  type="text" 
                  placeholder="000.000.000-00"
                  value={cpf} 
                  onChange={(e) => setCpf(e.target.value)}
                  className="w-full rounded-xl border border-black/10 px-4 py-2 focus:border-black focus:outline-none" 
                  required 
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Telefone</label>
                <input 
                  type="text" 
                  placeholder="(00) 00000-0000"
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-black/10 px-4 py-2 focus:border-black focus:outline-none" 
                  required 
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Senha</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-black/10 px-4 py-2 focus:border-black focus:outline-none" 
                required 
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Tipo de Conta</label>
              <select 
                value={role} 
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full rounded-xl border border-black/10 px-4 py-2 focus:border-black focus:outline-none"
              >
                <option value="client">Cliente (Requer Aprovação)</option>
                <option value="restaurant">Restaurante</option>
                <option value="driver">Entregador</option>
              </select>
            </div>

            {role === 'client' && (
              <div className="space-y-4 rounded-xl bg-emerald-50 p-4 border border-emerald-100">
                <p className="text-xs font-black uppercase text-emerald-600 tracking-widest">Verificação Obrigatória</p>
                <p className="text-[10px] text-emerald-700/60">Tire fotos com a câmera do seu celular</p>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] font-bold text-black/50 mb-2 uppercase">1. Selfie</p>
                    {selfie ? (
                      <div className="relative">
                        <img src={selfie} alt="Selfie" className="w-full h-24 object-cover rounded-xl border-2 border-emerald-500" />
                        <button onClick={() => setSelfie(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X size={12} /></button>
                      </div>
                    ) : (
                      <button onClick={() => openCamera('selfie')} className="w-full h-24 rounded-xl border-2 border-dashed border-emerald-300 flex flex-col items-center justify-center text-emerald-600 hover:bg-emerald-100 transition-colors">
                        <User size={24} />
                        <span className="text-[10px] font-bold mt-1">Tirar Foto</span>
                      </button>
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-black/50 mb-2 uppercase">2. Doc Frente</p>
                    {idDoc ? (
                      <div className="relative">
                        <img src={idDoc} alt="Documento Frente" className="w-full h-24 object-cover rounded-xl border-2 border-emerald-500" />
                        <button onClick={() => setIdDoc(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X size={12} /></button>
                      </div>
                    ) : (
                      <button onClick={() => openCamera('docFront')} className="w-full h-24 rounded-xl border-2 border-dashed border-emerald-300 flex flex-col items-center justify-center text-emerald-600 hover:bg-emerald-100 transition-colors">
                        <Store size={24} />
                        <span className="text-[10px] font-bold mt-1">Tirar Foto</span>
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-black/50 mb-2 uppercase">3. Doc Verso</p>
                  {idDocBack ? (
                    <div className="relative">
                      <img src={idDocBack} alt="Documento Verso" className="w-full h-24 object-cover rounded-xl border-2 border-emerald-500" />
                      <button onClick={() => setIdDocBack(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X size={12} /></button>
                    </div>
                  ) : (
                    <button onClick={() => openCamera('docBack')} className="w-full h-24 rounded-xl border-2 border-dashed border-emerald-300 flex flex-col items-center justify-center text-emerald-600 hover:bg-emerald-100 transition-colors">
                      <Store size={24} />
                      <span className="text-[10px] font-bold mt-1">Tirar Foto</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full py-3">Cadastrar</Button>
          </form>
          <div className="mt-6 text-center">
            <button onClick={onGoToLogin} className="text-sm font-medium hover:underline">Já tem conta? Entre aqui</button>
          </div>
        </Card>
      </motion.div>

      {showCamera && (
        <div className="fixed inset-0 z-[200] bg-black flex flex-col">
          <div className="flex-1 relative">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className={cn("w-full h-full object-cover", showCamera === 'selfie' && "scale-x-[-1]")}
            />
            <div className="absolute top-4 left-4 text-white">
              <p className="font-black text-lg uppercase">
                {showCamera === 'selfie' && 'Tire uma selfie'}
                {showCamera === 'docFront' && 'Foto da Frente do Documento'}
                {showCamera === 'docBack' && 'Foto do Verso do Documento'}
              </p>
            </div>
          </div>
          <div className="bg-black p-6 flex items-center justify-center gap-6">
            <button onClick={closeCamera} className="w-16 h-16 rounded-full bg-white/10 text-white flex items-center justify-center">
              <X size={32} />
            </button>
            <button onClick={capturePhoto} className="w-20 h-20 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-2xl shadow-emerald-500/50">
              <div className="w-16 h-16 rounded-full bg-white/20" />
            </button>
            <div className="w-16 h-16" />
          </div>
        </div>
      )}
    </div>
  );
}

// --- Admin Dashboard ---

function AdminDashboard({ user }: { user: UserData }) {
  const [pendingClients, setPendingClients] = useState<UserData[]>([]);
  const [allRestaurants, setAllRestaurants] = useState<any[]>([]);
  const [allDrivers, setAllDrivers] = useState<any[]>([]);
  const [allClients, setAllClients] = useState<any[]>([]);
  const [stats, setStats] = useState<{ restaurantStats: any[], driverStats: any[] } | null>(null);
  const [activeTab, setActiveTab] = useState<'approvals' | 'stats' | 'register' | 'restaurants' | 'drivers' | 'clients' | 'map'>('approvals');
  const [driverLocations, setDriverLocations] = useState<Record<string, any>>({});
  const socketRef = useRef<WebSocket | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();

    // Setup WebSocket for Admin Tracking
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}`);
    socketRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'update_location') {
          setDriverLocations(prev => ({
            ...prev,
            [data.driverId]: { lat: data.lat, lng: data.lng, timestamp: Date.now() }
          }));
        }
      } catch (e) {}
    };

    return () => ws.close();
  }, [activeTab]);

  const fetchData = async () => {
    setFetching(true);
    setError(null);
    try {
      const urls = [
        '/api/admin/pending-clients',
        '/api/admin/restaurants',
        '/api/admin/drivers',
        '/api/admin/clients',
        '/api/admin/stats'
      ];
      
      const responses = await Promise.all(urls.map(url => fetch(url)));
      const results = await Promise.all(responses.map(async (r, i) => {
        if (!r.ok) {
          const body = await r.json().catch(() => ({}));
          throw new Error(`Erro ao carregar ${urls[i]}: ${body.error || r.statusText}`);
        }
        return r.json();
      }));

      const [pending, restaurants, drivers, clients, statistics] = results;

      setPendingClients(pending);
      setAllRestaurants(restaurants);
      setAllDrivers(drivers);
      setAllClients(clients);
      setStats(statistics);
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message);
    } finally {
      setFetching(false);
    }
  };

  const approveClient = async (userId: number) => {
    await fetch('/api/admin/approve-client', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    fetchData(); // Refresh everything
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex flex-wrap gap-3">
          {[
            { id: 'approvals', label: 'Aprovações', count: pendingClients.length, icon: <Users size={18} /> },
            { id: 'restaurants', label: 'Restaurantes', count: allRestaurants.length, icon: <Store size={18} /> },
            { id: 'drivers', label: 'Entregadores', count: allDrivers.length, icon: <Truck size={18} /> },
            { id: 'clients', label: 'Clientes', count: allClients.length, icon: <Users size={18} /> },
            { id: 'map', label: 'Mapa ao Vivo', icon: <MapPin size={18} /> },
            { id: 'register', label: 'Novo Cadastro', icon: <Plus size={18} /> },
          ].map(tab => (
            <Button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)} 
              className={cn("rounded-2xl px-6 py-6 transition-all", activeTab === tab.id ? "bg-black text-white shadow-xl scale-105" : "bg-white text-black/60 border border-black/5 hover:bg-black/5")}
            >
              <div className="flex items-center gap-2 font-black uppercase tracking-widest text-[10px]">
                {tab.icon}
                {tab.label}
                {tab.count !== undefined && (
                  <span className={cn("ml-1 px-2 py-0.5 rounded-full text-[8px]", activeTab === tab.id ? "bg-white/20" : "bg-black/5")}>
                    {tab.count}
                  </span>
                )}
              </div>
            </Button>
          ))}
        </div>
        
        <Button size="icon" onClick={fetchData} disabled={fetching} className="rounded-2xl bg-white text-black border border-black/5 hover:bg-black/5 shadow-sm">
          <RefreshCw size={18} className={cn(fetching && "animate-spin")} />
        </Button>
      </div>

      {error && (
        <Card className="p-6 border-none bg-red-50 text-red-600 flex items-center gap-3">
          <AlertCircle size={24} />
          <div>
            <p className="font-bold">Erro ao carregar dados</p>
            <p className="text-sm opacity-80">{error}</p>
          </div>
        </Card>
      )}

      {fetching && (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-black border-t-transparent" />
        </div>
      )}

      {!fetching && activeTab === 'approvals' && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pendingClients.map(client => (
            <Card key={client.id} className="group relative overflow-hidden p-6 hover:shadow-2xl transition-all border-none shadow-sm cursor-pointer" onClick={() => setSelectedProfile(client)}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-black flex items-center justify-center text-white">
                    <User size={24} />
                  </div>
                  <div>
                    <p className="font-bold">{client.name}</p>
                    <p className="text-xs text-black/40">@{client.username}</p>
                  </div>
                </div>
                <Button size="icon" onClick={() => approveClient(client.id)} className="rounded-2xl bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-200">
                  <Check size={18} />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <img src={client.id_document} className="h-24 w-full rounded-xl object-cover border border-black/5" />
                <img src={client.selfie} className="h-24 w-full rounded-xl object-cover border border-black/5" />
              </div>
            </Card>
          ))}
          {pendingClients.length === 0 && <p className="col-span-full py-20 text-center text-black/30 font-bold">Nenhuma aprovação pendente.</p>}
        </div>
      )}

      {!fetching && activeTab === 'restaurants' && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {allRestaurants.map(restaurant => (
            <Card key={restaurant.id} className="p-6 hover:shadow-xl transition-all border-none shadow-sm cursor-pointer group" onClick={() => setSelectedProfile(restaurant)}>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-black/5 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                  <Store size={32} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-lg truncate tracking-tight">{restaurant.name}</p>
                  <p className="text-xs text-black/40 font-bold uppercase">{restaurant.category}</p>
                  <div className="flex items-center gap-1 mt-1 text-emerald-600">
                    <MapPin size={10} />
                    <p className="text-[10px] font-black uppercase truncate">{restaurant.address}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          {allRestaurants.length === 0 && <p className="col-span-full py-20 text-center text-black/30 font-bold">Nenhum restaurante cadastrado.</p>}
        </div>
      )}

      {!fetching && activeTab === 'drivers' && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {allDrivers.map(driver => (
            <Card key={driver.id} className="p-6 hover:shadow-xl transition-all border-none shadow-sm cursor-pointer group" onClick={() => setSelectedProfile(driver)}>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-black/5 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                  <Truck size={32} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-lg truncate tracking-tight">{driver.name}</p>
                  <p className="text-xs text-black/40 font-bold uppercase">@{driver.username}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={cn("px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest", 
                      driver.status === 'approved' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
                      {driver.status === 'approved' ? 'Ativo' : 'Pendente'}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          {allDrivers.length === 0 && <p className="col-span-full py-20 text-center text-black/30 font-bold">Nenhum entregador cadastrado.</p>}
        </div>
      )}

      {!fetching && activeTab === 'clients' && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {allClients.map(client => (
            <Card key={client.id} className="p-6 hover:shadow-xl transition-all border-none shadow-sm cursor-pointer group" onClick={() => setSelectedProfile(client)}>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-black/5 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                  <User size={32} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-lg truncate tracking-tight">{client.name}</p>
                  <p className="text-xs text-black/40 font-bold uppercase">@{client.username}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={cn("px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest", 
                      client.status === 'approved' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
                      {client.status === 'approved' ? 'Ativo' : 'Pendente'}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          {allClients.length === 0 && <p className="col-span-full py-20 text-center text-black/30 font-bold">Nenhum cliente cadastrado.</p>}
        </div>
      )}

      {!fetching && activeTab === 'stats' && stats && (
        <div className="grid gap-8 md:grid-cols-2">
          <Card className="border-none shadow-sm h-fit">
            <h3 className="mb-6 flex items-center gap-3 text-xl font-black tracking-tight">
              <div className="h-8 w-8 rounded-xl bg-black text-white flex items-center justify-center">
                <Store size={18} />
              </div> 
              Ganhos por Restaurante
            </h3>
            <div className="space-y-4">
              {stats.restaurantStats.map((s, i) => (
                <div 
                  key={i} 
                  className="flex items-center justify-between group cursor-pointer hover:bg-black/5 p-2 rounded-xl transition-all"
                  onClick={() => {
                    const r = allRestaurants.find(res => res.id === s.id);
                    if (r) setSelectedProfile(r);
                  }}
                >
                  <span className="font-bold text-black/60 group-hover:text-black transition-colors">{s.name}</span>
                  <div className="h-px flex-1 mx-4 bg-black/5" />
                  <span className="font-mono font-black text-emerald-600">R$ {s.total_earnings.toFixed(2)}</span>
                </div>
              ))}
              {stats.restaurantStats.length === 0 && <p className="text-center py-4 text-black/30 text-sm">Nenhum dado financeiro disponível.</p>}
            </div>
          </Card>
          <Card className="border-none shadow-sm h-fit">
            <h3 className="mb-6 flex items-center gap-3 text-xl font-black tracking-tight">
              <div className="h-8 w-8 rounded-xl bg-black text-white flex items-center justify-center">
                <Truck size={18} />
              </div>
              Entregas por Entregador
            </h3>
            <div className="space-y-4">
              {stats.driverStats.map((s, i) => (
                <div 
                  key={i} 
                  className="flex items-center justify-between group cursor-pointer hover:bg-black/5 p-2 rounded-xl transition-all"
                  onClick={() => {
                    const d = allDrivers.find(drv => drv.id === s.id);
                    if (d) setSelectedProfile(d);
                  }}
                >
                  <span className="font-bold text-black/60 group-hover:text-black transition-colors">{s.name}</span>
                  <div className="h-px flex-1 mx-4 bg-black/5" />
                  <span className="font-black bg-black text-white px-3 py-1 rounded-lg text-[10px]">{s.total_deliveries} entregas</span>
                </div>
              ))}
              {stats.driverStats.length === 0 && <p className="text-center py-4 text-black/30 text-sm">Nenhum dado de entrega disponível.</p>}
            </div>
          </Card>
        </div>
      )}

      {!fetching && activeTab === 'map' && (
        <AdminLiveMap drivers={allDrivers} locations={driverLocations} />
      )}

      {!fetching && activeTab === 'register' && <AdminRegisterForm onRegisterSuccess={fetchData} />}

      {selectedProfile && (
        <ProfileModal 
          data={selectedProfile} 
          onClose={() => setSelectedProfile(null)} 
          onUpdate={fetchData}
        />
      )}
    </div>
  );
}

function ProfileModal({ data, onClose, onUpdate }: { data: any, onClose: () => void, onUpdate: () => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editData, setEditData] = useState({ ...data });
  const [newPassword, setNewPassword] = useState('');

  const handlePasswordChange = async () => {
    if (!newPassword) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${data.id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword })
      });
      if (!res.ok) throw new Error('Falha ao atualizar senha');
      alert('Senha atualizada com sucesso!');
      setNewPassword('');
    } catch (e) {
      alert('Erro ao atualizar senha');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      let type = '';
      if (data.userId) type = 'restaurants';
      else if (data.role === 'driver') type = 'drivers';
      else if (data.role === 'client') type = 'clients';
      
      const id = data.id;
      const res = await fetch(`/api/admin/${type}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      });
      if (!res.ok) throw new Error('Falha ao atualizar');
      setIsEditing(false);
      onUpdate();
      onClose();
    } catch (e) {
      alert('Erro ao atualizar');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este cadastro permanentemente?')) return;
    setLoading(true);
    try {
      let type = '';
      if (data.userId) type = 'restaurants';
      else if (data.role === 'driver') type = 'drivers';
      else if (data.role === 'client') type = 'clients';
      
      const res = await fetch(`/api/admin/${type}/${data.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Falha ao excluir');
      onUpdate();
      onClose();
    } catch (e) {
      alert('Erro ao excluir');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!confirm('Deseja suspender este cadastro e enviá-lo de volta para aprovação pendente?')) return;
    setLoading(true);
    try {
      let type = '';
      if (data.userId) type = 'restaurants';
      else if (data.role === 'driver') type = 'drivers';
      else if (data.role === 'client') type = 'clients';
      
      const res = await fetch(`/api/admin/${type}/${data.id}/reject`, { method: 'POST' });
      if (!res.ok) throw new Error('Falha ao rejeitar');
      onUpdate();
      onClose();
    } catch (e) {
      alert('Erro ao rejeitar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg overflow-y-auto max-h-[90vh]">
        <Card className="p-8 relative overflow-hidden border-none shadow-2xl">
          <Button variant="ghost" size="icon" onClick={onClose} className="absolute right-4 top-4 rounded-full z-10">
            <X size={20} />
          </Button>
          
          <div className="flex items-center gap-6 mb-8">
            <div className="h-24 w-24 rounded-[2rem] bg-black flex items-center justify-center overflow-hidden shadow-2xl shrink-0">
              {data.avatar || data.ownerAvatar ? (
                <img src={data.avatar || data.ownerAvatar} className="h-full w-full object-cover" />
              ) : (
                <User size={40} className="text-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <input 
                  className="text-2xl font-black tracking-tighter w-full bg-black/5 rounded-lg px-2 py-1 outline-none"
                  value={editData.name}
                  onChange={e => setEditData({...editData, name: e.target.value})}
                />
              ) : (
                <h2 className="text-2xl font-black tracking-tighter truncate mb-1">{data.name}</h2>
              )}
              <p className="text-black/50 font-bold uppercase tracking-widest text-[10px]">@{data.username || data.ownerUsername}</p>
              
              {!isEditing && (
                <div className="mt-4 flex gap-2">
                  <span className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest", 
                    data.status === 'approved' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
                    {data.status === 'approved' ? 'Ativa' : 'Pendente'}
                  </span>
                  {data.delivery_type && (
                    <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-black text-white">
                      {data.delivery_type === 'own' ? 'Própria' : 'App'}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-3xl bg-black/[0.03] border border-black/5">
                <p className="text-[10px] font-black uppercase text-black/30 mb-2 tracking-widest">WhatsApp</p>
                {isEditing ? (
                  <input 
                    className="font-black text-sm w-full bg-transparent border-none outline-none"
                    value={editData.phone}
                    onChange={e => setEditData({...editData, phone: e.target.value})}
                  />
                ) : (
                  <p className="font-black text-sm">{data.phone || '(n/a)'}</p>
                )}
              </div>
              <div className="p-6 rounded-3xl bg-black/[0.03] border border-black/5">
                <p className="text-[10px] font-black uppercase text-black/30 mb-2 tracking-widest">Documento CPF</p>
                {isEditing ? (
                  <input 
                    className="font-black text-sm w-full bg-transparent border-none outline-none"
                    value={editData.cpf}
                    onChange={e => setEditData({...editData, cpf: e.target.value})}
                  />
                ) : (
                  <p className="font-black text-sm">{data.cpf || '(n/a)'}</p>
                )}
              </div>
            </div>

            {(data.address || isEditing) && (
              <div className="p-6 rounded-3xl bg-black/[0.03] border border-black/5">
                <p className="text-[10px] font-black uppercase text-black/30 mb-2 tracking-widest">Endereço / Localização</p>
                {isEditing ? (
                  <input 
                    className="font-black text-sm w-full bg-transparent border-none outline-none"
                    value={editData.address}
                    onChange={e => setEditData({...editData, address: e.target.value})}
                  />
                ) : (
                  <p className="font-black text-sm">{data.address || '(n/a)'}</p>
                )}
              </div>
            )}

            <div className="p-6 rounded-3xl bg-amber-50 border border-amber-100">
              <p className="text-[10px] font-black uppercase text-amber-900/40 mb-3 tracking-widest">Segurança / Senha</p>
              <div className="flex gap-2">
                <input 
                  type="text"
                  placeholder="Nova senha poderosa"
                  className="flex-1 bg-white border border-amber-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-amber-400"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                />
                <Button onClick={handlePasswordChange} disabled={loading || !newPassword} className="bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-200">
                  {loading ? '...' : 'Redefinir'}
                </Button>
              </div>
              <p className="mt-2 text-[8px] text-amber-900/50 font-bold uppercase">Cuidado: A troca é instantânea e o usuário precisará da nova senha.</p>
            </div>

            {isEditing && data.userId && (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 rounded-3xl bg-black/[0.03] border border-black/5">
                  <p className="text-[10px] font-black uppercase text-black/30 mb-2 tracking-widest">Categoria</p>
                  <input 
                    className="font-black text-sm w-full bg-transparent border-none outline-none"
                    value={editData.category}
                    onChange={e => setEditData({...editData, category: e.target.value})}
                  />
                </div>
                <div className="p-6 rounded-3xl bg-black/[0.03] border border-black/5">
                  <p className="text-[10px] font-black uppercase text-black/30 mb-2 tracking-widest">Tipo Entrega</p>
                  <select 
                    className="font-black text-sm w-full bg-transparent border-none outline-none appearance-none cursor-pointer"
                    value={editData.delivery_type}
                    onChange={e => setEditData({...editData, delivery_type: e.target.value})}
                  >
                    <option value="platform">Plataforma</option>
                    <option value="own">Própria</option>
                  </select>
                </div>
              </div>
            )}

            {isEditing && data.userId && (
              <div className="p-6 rounded-3xl bg-black/[0.03] border border-black/5">
                <p className="text-[10px] font-black uppercase text-black/30 mb-2 tracking-widest">Proprietário</p>
                <input 
                  className="font-black text-sm w-full bg-transparent border-none outline-none"
                  value={editData.ownerName}
                  onChange={e => setEditData({...editData, ownerName: e.target.value})}
                />
              </div>
            )}

            {!isEditing && (data.id_document || data.selfie) && (
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <p className="text-[10px] font-black uppercase text-black/30 mb-3 tracking-widest">Foto do Doc</p>
                  <img src={data.id_document} className="h-40 w-full rounded-3xl object-cover border border-black/5" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-black/30 mb-3 tracking-widest">Selfie Verif.</p>
                  <img src={data.selfie} className="h-40 w-full rounded-3xl object-cover border border-black/5" />
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-6">
              {isEditing ? (
                <>
                  <Button disabled={loading} onClick={handleUpdate} className="flex-1 rounded-2xl bg-black py-6">
                    {loading ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                  <Button disabled={loading} variant="outline" onClick={() => setIsEditing(false)} className="px-6 rounded-2xl py-6 border-black/10">
                    Cancelar
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={() => setIsEditing(true)} className="flex-1 rounded-2xl bg-black py-6 text-xs font-black uppercase tracking-widest">
                    <Edit2 size={16} className="mr-2" /> Editar
                  </Button>
                  {data.status === 'approved' && (
                    <Button onClick={handleReject} variant="outline" className="rounded-2xl py-6 aspect-square border-black/10 hover:bg-amber-50 hover:text-amber-600">
                      <ShieldAlert size={18} />
                    </Button>
                  )}
                  <Button onClick={handleDelete} variant="outline" className="rounded-2xl py-6 aspect-square border-black/10 hover:bg-red-50 hover:text-red-600">
                    <Trash2 size={18} />
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

function AdminRegisterForm({ onRegisterSuccess }: { onRegisterSuccess: () => void }) {
  const [type, setType] = useState<'restaurant' | 'driver'>('restaurant');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, name, role: type })
      });
      const userData = await res.json();
      
      if (!res.ok) throw new Error(userData.error || 'Erro no cadastro de usuário');

      if (type === 'restaurant') {
        const resRes = await fetch('/api/restaurants', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: userData.id, name, address, category })
        });
        const resData = await resRes.json();
        if (!resRes.ok) throw new Error(resData.error || 'Erro ao criar perfil do restaurante');
      }

      setMsg('✅ Cadastrado com sucesso!');
      setName(''); setUsername(''); setPassword(''); setAddress(''); setCategory('');
      onRegisterSuccess(); // Trigger re-fetch in parent
    } catch (err: any) {
      setMsg(`❌ Erro: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
      setTimeout(() => setMsg(m => m.startsWith('✅') ? '' : m), 5000);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto border-none shadow-sm p-10">
      <div className="text-center mb-10">
        <h3 className="text-3xl font-black tracking-tighter mb-2">Novo Cadastro</h3>
        <p className="text-black/40 text-sm font-medium">Adicione parceiros manualmente ao sistema</p>
      </div>

      <div className="mb-10 flex p-1.5 bg-black/5 rounded-2xl">
        <button 
          onClick={() => setType('restaurant')} 
          className={cn("flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all", type === 'restaurant' ? "bg-white text-black shadow-sm" : "text-black/40 hover:text-black/60")}
        >
          Restaurante
        </button>
        <button 
          onClick={() => setType('driver')} 
          className={cn("flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all", type === 'driver' ? "bg-white text-black shadow-sm" : "text-black/40 hover:text-black/60")}
        >
          Entregador
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-black/40">Nome Completo / Fantasia</label>
            <input value={name} onChange={e => setName(e.target.value)} className="w-full rounded-2xl border-none bg-black/5 px-6 py-4 font-bold focus:ring-2 focus:ring-black" required />
          </div>
          <div>
            <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-black/40">Usuário (Login)</label>
            <input value={username} onChange={e => setUsername(e.target.value)} className="w-full rounded-2xl border-none bg-black/5 px-6 py-4 font-bold focus:ring-2 focus:ring-black" required />
          </div>
          <div>
            <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-black/40">Senha Inicial</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded-2xl border-none bg-black/5 px-6 py-4 font-bold focus:ring-2 focus:ring-black" required />
          </div>
          {type === 'restaurant' && (
            <>
              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-black/40">Endereço</label>
                <input value={address} onChange={e => setAddress(e.target.value)} className="w-full rounded-2xl border-none bg-black/5 px-6 py-4 font-bold focus:ring-2 focus:ring-black" required />
              </div>
              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-black/40">Categoria (ex: Pizza)</label>
                <input value={category} onChange={e => setCategory(e.target.value)} className="w-full rounded-2xl border-none bg-black/5 px-6 py-4 font-bold focus:ring-2 focus:ring-black" required />
              </div>
            </>
          )}
        </div>
        
        <div className="pt-4">
          <Button type="submit" disabled={loading} className="w-full py-8 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-black/10">
            {loading ? 'Cadastrando...' : `Confirmar Cadastro de ${type === 'restaurant' ? 'Restaurante' : 'Entregador'}`}
          </Button>
          {msg && (
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 text-center text-emerald-500 font-bold">
              {msg}
            </motion.p>
          )}
        </div>
      </form>
    </Card>
  );
}

// --- Restaurant Dashboard ---

function RestaurantDashboard({ user }: { user: UserData }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'finance'>('orders');
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setFetching(true);
    try {
      const resRest = await fetch('/api/restaurants');
      const rests = await resRest.json();
      const myRest = rests.find((r: any) => r.userId === user.id);
      if (myRest) {
        setRestaurant(myRest);
        const [resOrders, resMenu, resStats] = await Promise.all([
          fetch(`/api/orders/restaurant/${user.id}`),
          fetch(`/api/restaurants/${myRest.id}/menu`),
          fetch(`/api/stats/restaurant/${user.id}`)
        ]);
        setOrders(await resOrders.json());
        setMenu(await resMenu.json());
        setStats(await resStats.json());
      }
    } catch (e) {
      console.error('Failed to fetch restaurant data:', e);
    } finally {
      setFetching(false);
    }
  };

  const updateOrderStatus = async (orderId: number, status: string) => {
    await fetch(`/api/orders/${orderId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    fetchData();
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-3">
        {[
          { id: 'orders', label: 'Pedidos', icon: ClipboardList },
          { id: 'menu', label: 'Cardápio', icon: Plus },
          { id: 'finance', label: 'Finanças', icon: Wallet },
          { id: 'settings', label: 'Config', icon: Settings },
        ].map(tab => (
          <Button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)} 
            className={cn(
              "rounded-2xl px-6 py-4 font-black uppercase tracking-widest text-[10px] transition-all",
              activeTab === tab.id 
                ? "bg-black text-white shadow-xl shadow-black/20" 
                : "bg-white text-black/60 border border-black/5 hover:bg-black/5"
            )}
          >
            <tab.icon size={16} className="mr-2" /> {tab.label}
          </Button>
        ))}
      </div>

      {!fetching && !restaurant && (
        <RestaurantSetupForm userId={user.id} onComplete={fetchData} />
      )}

      {!fetching && restaurant && activeTab === 'orders' && (
        <div className="grid gap-4">
          {orders.map(order => (
            <Card key={order.id} className={cn("flex items-center justify-between p-5 hover:shadow-lg transition-all border-none", 
              order.status === 'pending' && "border-l-4 border-l-amber-500",
              order.status === 'preparing' && "border-l-4 border-l-blue-500", 
              order.status === 'out_for_delivery' && "border-l-4 border-l-emerald-500"
            )}>
              <div className="flex items-start gap-4">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center",
                  order.status === 'pending' && "bg-amber-100",
                  order.status === 'preparing' && "bg-blue-100", 
                  order.status === 'out_for_delivery' && "bg-emerald-100"
                )}>
                  <span className="font-black text-lg">#{order.id}</span>
                </div>
                <div>
                  <p className="font-black text-lg">{order.clientName}</p>
                  <p className="text-sm text-black/50 flex items-center gap-1"><Clock size={12} /> {new Date(order.created_at).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}</p>
                  <p className="text-lg font-bold text-emerald-600 mt-1">R$ {order.total_price.toFixed(2)}</p>
                  <div className="flex gap-2 mt-2">
                    <span className={cn(
                      "inline-block rounded-full px-3 py-1 text-xs font-black uppercase tracking-widest",
                      order.status === 'pending' && "bg-amber-100 text-amber-700",
                      order.status === 'preparing' && "bg-blue-100 text-blue-700",
                      order.status === 'out_for_delivery' && "bg-emerald-100 text-emerald-700",
                      order.status === 'delivered' && "bg-black text-white"
                    )}>
                      {order.status === 'pending' && 'Pendente'}
                      {order.status === 'preparing' && 'Preparando'}
                      {order.status === 'out_for_delivery' && 'Saiu para Entrega'}
                      {order.status === 'delivered' && 'Entregue'}
                    </span>
                    {restaurant.delivery_type === 'own' && (
                      <span className="inline-block rounded-full px-2 py-1 text-[10px] bg-black text-white font-black uppercase tracking-widest">Própria</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {order.status === 'pending' && (
                  <Button size="sm" onClick={() => updateOrderStatus(order.id, 'preparing')} className="bg-blue-600 hover:bg-blue-500 font-bold rounded-xl">
                    <ChefHat size={14} className="mr-1" /> Preparar
                  </Button>
                )}
                {order.status === 'preparing' && restaurant.delivery_type === 'own' && (
                  <Button size="sm" onClick={() => updateOrderStatus(order.id, 'out_for_delivery')} className="bg-emerald-600 hover:bg-emerald-500 font-bold rounded-xl">
                    <Truck size={14} className="mr-1" /> Sair
                  </Button>
                )}
                {order.status === 'out_for_delivery' && restaurant.delivery_type === 'own' && (
                  <Button size="sm" onClick={() => updateOrderStatus(order.id, 'delivered')} className="bg-black hover:bg-black/80 font-bold rounded-xl">
                    <Check size={14} className="mr-1" /> Entregue
                  </Button>
                )}
                {order.status === 'preparing' && restaurant.delivery_type === 'platform' && (
                  <p className="text-sm text-black/50 italic px-3">Aguardando entregador...</p>
                )}
              </div>
            </Card>
          ))}
          {orders.length === 0 && <Card className="py-16 text-center border-none shadow-md"><p className="text-black/40">Nenhum pedido recebido ainda.</p></Card>}
        </div>
      )}

      {!fetching && restaurant && activeTab === 'finance' && stats && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-gradient-to-br from-slate-800 to-black text-white p-8 shadow-xl shadow-black/10">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-white/60 font-bold uppercase tracking-widest">Faturamento</p>
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <TrendingUp size={18} className="text-emerald-400" />
                </div>
              </div>
              <p className="text-4xl font-black">R$ {stats.gross.toFixed(2)}</p>
              <div className="mt-4 flex items-center text-xs text-white/40">
                Total vendido na plataforma
              </div>
            </Card>
            <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-8 shadow-xl shadow-emerald-200">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-white/60 font-bold uppercase tracking-widest">Receber</p>
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Wallet size={18} />
                </div>
              </div>
              <p className="text-4xl font-black">R$ {stats.net.toFixed(2)}</p>
              <div className="mt-4 flex items-center text-xs text-white/40">
                Após descontar 13% de taxa
              </div>
            </Card>
            <Card className="p-8 bg-gradient-to-br from-slate-50 to-white">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-black/40 font-bold uppercase tracking-widest">Pedidos</p>
                <div className="w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center">
                  <ShoppingBag size={18} className="text-black/40" />
                </div>
              </div>
              <p className="text-4xl font-black">{stats.count}</p>
              <div className="mt-4 flex items-center text-xs text-black/30">
                Entregas finalizadas
              </div>
            </Card>
          </div>

          <Card>
            <h3 className="mb-6 font-bold flex items-center gap-2">
              <TrendingUp size={18} /> Performance Diária (Últimos 7 dias)
            </h3>
            <div className="space-y-4">
              {stats.daily.length > 0 ? stats.daily.map((d: any, i: number) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span>{d.day}</span>
                    <span className="font-mono">R$ {d.gross.toFixed(2)}</span>
                  </div>
                  <div className="h-2 w-full bg-black/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-black rounded-full" 
                      style={{ width: `${Math.min(100, (d.gross / (stats.gross || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              )) : (
                <p className="text-center py-4 text-black/30">Dados insuficientes para gerar gráfico.</p>
              )}
            </div>
          </Card>

          <Card className="h-64 flex items-center justify-center border-dashed">
            <div className="text-center">
              <MapPin size={32} className="mx-auto mb-2 text-black/20" />
              <p className="text-sm text-black/50">Mapa de Calor e Logística em breve</p>
            </div>
          </Card>
        </div>
      )}

      {!fetching && restaurant && activeTab === 'menu' && (
        <div className="space-y-8">
          <AddMenuItemForm restaurantId={restaurant.id} onAdded={fetchData} />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {menu.map(item => (
              <Card key={item.id} className="overflow-hidden p-0">
                <img src={item.image} alt={item.name} className="h-40 w-full object-cover" referrerPolicy="no-referrer" />
                <div className="p-4">
                  <p className="font-bold">{item.name}</p>
                  <p className="text-sm text-black/50 line-clamp-2">{item.description}</p>
                  <p className="mt-2 font-mono font-bold text-emerald-600">R$ {item.price.toFixed(2)}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {!fetching && restaurant && activeTab === 'settings' && (
        <Card className="max-w-2xl mx-auto p-8">
           <h3 className="text-2xl font-black mb-6">Configurações de Entrega</h3>
           <div className="space-y-6">
              <div className="flex flex-col gap-4">
                 <button 
                  onClick={async () => {
                    await fetch(`/api/restaurants/${restaurant.id}/settings`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ delivery_type: 'platform' })
                    });
                    fetchData();
                  }}
                  className={cn("flex items-center gap-4 p-6 rounded-2xl border-2 transition-all text-left", restaurant.delivery_type === 'platform' ? "border-emerald-500 bg-emerald-50" : "border-black/5 hover:border-black/20")}
                 >
                    <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center", restaurant.delivery_type === 'platform' ? "bg-emerald-600 text-white" : "bg-black/5 text-black/40")}>
                       <Truck size={24} />
                    </div>
                    <div>
                        <p className="font-bold">Entregadores da DashApp</p>
                        <p className="text-xs text-black/50">Usa os entregadores parceiros da nossa rede (Repasse Automático).</p>
                    </div>
                 </button>

                 <button 
                   onClick={async () => {
                    await fetch(`/api/restaurants/${restaurant.id}/settings`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ delivery_type: 'own' })
                    });
                    fetchData();
                  }}
                  className={cn("flex items-center gap-4 p-6 rounded-2xl border-2 transition-all text-left", restaurant.delivery_type === 'own' ? "border-emerald-500 bg-emerald-50" : "border-black/5 hover:border-black/20")}
                 >
                    <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center", restaurant.delivery_type === 'own' ? "bg-emerald-600 text-white" : "bg-black/5 text-black/40")}>
                       <Users size={24} />
                    </div>
                    <div>
                        <p className="font-bold">Entrega Própria</p>
                        <p className="text-xs text-black/50">Você gerencia seus próprios entregadores.</p>
                    </div>
                 </button>
              </div>
           </div>
        </Card>
      )}
    </div>
  );
}

function RestaurantSetupForm({ userId, onComplete }: { userId: number, onComplete: () => void }) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState('');
  const [deliveryType, setDeliveryType] = useState('platform');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/restaurants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, name, address, category, delivery_type: deliveryType })
      });
      if (res.ok) {
        onComplete();
      }
    } catch (err) {
      console.error('Failed to setup restaurant:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-xl mx-auto border-emerald-500 bg-emerald-50/10">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg">
          <Store size={32} />
        </div>
        <h3 className="text-2xl font-black tracking-tight">Configure seu Restaurante</h3>
        <p className="text-sm text-black/50">Você precisa criar um perfil antes de gerenciar o cardápio.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-black/30 ml-2">Nome do Estabelecimento</label>
          <input placeholder="Ex: Central Burger" value={name} onChange={e => setName(e.target.value)} className="w-full rounded-2xl border-none bg-white p-4 text-sm shadow-sm focus:ring-2 focus:ring-emerald-500" required />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-black/30 ml-2">Endereço Completo</label>
          <input placeholder="Rua, Número, Bairro" value={address} onChange={e => setAddress(e.target.value)} className="w-full rounded-2xl border-none bg-white p-4 text-sm shadow-sm focus:ring-2 focus:ring-emerald-500" required />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-black/30 ml-2">Categoria</label>
          <input placeholder="Ex: 🍔 Burger, 🍕 Pizza" value={category} onChange={e => setCategory(e.target.value)} className="w-full rounded-2xl border-none bg-white p-4 text-sm shadow-sm focus:ring-2 focus:ring-emerald-500" required />
        </div>

        <div className="space-y-1 pt-2">
           <label className="text-[10px] font-black uppercase text-black/30 ml-2">Logística de Entrega</label>
           <div className="flex gap-2">
              <button 
                type="button"
                onClick={() => setDeliveryType('platform')}
                className={cn("flex-1 rounded-2xl p-4 text-sm font-bold border-2 transition-all", deliveryType === 'platform' ? "border-emerald-500 bg-white" : "border-transparent bg-white/50 opacity-60")}
              >
                🚴 Plataforma
              </button>
              <button 
                type="button"
                onClick={() => setDeliveryType('own')}
                className={cn("flex-1 rounded-2xl p-4 text-sm font-bold border-2 transition-all", deliveryType === 'own' ? "border-emerald-500 bg-white" : "border-transparent bg-white/50 opacity-60")}
              >
                🏠 Própria
              </button>
           </div>
        </div>
        <Button type="submit" disabled={loading} className="h-14 w-full bg-emerald-600 text-white hover:bg-emerald-500 font-black uppercase tracking-widest transition-all">
          {loading ? "Criando Perfil..." : "Começar Agora"}
        </Button>
      </form>
    </Card>
  );
}

function AddMenuItemForm({ restaurantId, onAdded }: { restaurantId: number, onAdded: () => void }) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/restaurants/${restaurantId}/menu`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description: desc, price: parseFloat(price), image })
      });
      if (res.ok) {
        setName(''); setDesc(''); setPrice(''); setImage('');
        onAdded();
      } else {
        const data = await res.json();
        setError(data.error || 'Erro ao adicionar item');
      }
    } catch (err) {
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-xl border-none bg-black/5">
      <h3 className="mb-4 text-xl font-black tracking-tight">Adicionar ao Cardápio</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-black/30 ml-2">Nome do prato</label>
          <input placeholder="Ex: Burger Gourmet" value={name} onChange={e => setName(e.target.value)} className="w-full rounded-2xl border-none bg-white p-4 text-sm shadow-sm focus:ring-2 focus:ring-black" required />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-black/30 ml-2">Descrição</label>
          <textarea placeholder="Ingredientes e detalhes..." value={desc} onChange={e => setDesc(e.target.value)} className="w-full rounded-2xl border-none bg-white p-4 text-sm shadow-sm focus:ring-2 focus:ring-black min-h-[100px]" required />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-black/30 ml-2">Preço (R$)</label>
            <input type="number" step="0.01" placeholder="0.00" value={price} onChange={e => setPrice(e.target.value)} className="w-full rounded-2xl border-none bg-white p-4 text-sm shadow-sm focus:ring-2 focus:ring-black" required />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-black/30 ml-2">URL da Imagem</label>
            <input placeholder="https://..." value={image} onChange={e => setImage(e.target.value)} className="w-full rounded-2xl border-none bg-white p-4 text-sm shadow-sm focus:ring-2 focus:ring-black" required />
          </div>
        </div>
        {error && <p className="text-xs font-bold text-red-500 flex items-center gap-1"><AlertCircle size={14} /> {error}</p>}
        <Button type="submit" disabled={loading} className="h-14 w-full bg-black text-white hover:scale-[1.02] active:scale-95 transition-all font-black uppercase tracking-widest">
          {loading ? "Adicionando..." : "Cadastrar Produto"}
        </Button>
      </form>
    </Card>
  );
}

// --- Driver Dashboard ---

function DriverDashboard({ user }: { user: UserData }) {
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [driverLoc, setDriverLoc] = useState<{lat: number, lng: number} | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'orders' | 'stats'>('orders');
  const socketRef = useRef<WebSocket | null>(null);
  // Ref so watchPosition closure always has the latest orderId
  const activeOrderRef = useRef<Order | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // Keep ref in sync with state
  useEffect(() => {
    activeOrderRef.current = activeOrder;
  }, [activeOrder]);

  // Setup WebSocket with auto-reconnect
  const connectWS = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}`);
    socketRef.current = ws;
    ws.onclose = () => {
      // Reconnect after 3s if we're still supposed to be online
      setTimeout(() => { if (activeOrderRef.current || isOnlineRef.current) connectWS(); }, 3000);
    };
    return ws;
  };
  const isOnlineRef = useRef(false);

  // Restore active order and online status after page refresh
  useEffect(() => {
    const restoreActiveOrder = async () => {
      try {
        const [resOrder, resStats] = await Promise.all([
          fetch(`/api/orders/driver/${user.id}/active`),
          fetch(`/api/stats/driver/${user.id}`)
        ]);
        const order = await resOrder.json();
        if (order && order.id) {
          setActiveOrder(order);
          activeOrderRef.current = order;
          isOnlineRef.current = true;
          setIsOnline(true);
        }
        setStats(await resStats.json());
      } catch (e) {
        console.error('Failed to restore driver state:', e);
      }
    };
    restoreActiveOrder();
    // Setup WebSocket on mount
    connectWS();
    
    // Auto-online on mount
    goOnline();

    return () => {
      socketRef.current?.close();
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [user.id]);

  useEffect(() => {
    isOnlineRef.current = isOnline;
    if (isOnline) {
      fetchAvailable();
      const interval = setInterval(fetchAvailable, 3000);

      // Start GPS tracking — uses ref so orderId is always fresh
      if (navigator.geolocation) {
        if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = navigator.geolocation.watchPosition(async (pos) => {
          console.log('GPS update:', pos.coords.latitude, pos.coords.longitude);
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setDriverLoc(loc);
          
          // Enviar para Supabase Realtime
          try {
            await supabase.from('entregadores_localizacao').upsert({
              id: user.id,
              posicao: `POINT(${loc.lng} ${loc.lat})`,
              ultima_atualizacao: new Date().toISOString()
            }, { onConflict: 'id' });
            console.log('Location sent to Supabase');
          } catch (err) {
            console.error('Failed to send location:', err);
          }
        }, (err) => {
          console.error('Geolocation error:', err);
        }, { enableHighAccuracy: true, maximumAge: 3000, timeout: 2000 });
      }

      return () => {
        clearInterval(interval);
        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
        }
      };
    }
  }, [isOnline]);

  const goOnline = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          console.log('GPS inicial OK:', pos.coords.latitude, pos.coords.longitude);
          setIsOnline(true);
          setLocationError(null);
          try {
            const resStats = await fetch(`/api/stats/driver/${user.id}`);
            setStats(await resStats.json());
          } catch (e) {
            console.error('Failed to fetch stats:', e);
          }
        },
        (err) => {
          console.error('GPS erro:', err);
          setLocationError('Permissão de localização negada. É necessário para trabalhar.');
        }
      );
    } else {
      setLocationError('Geolocalização não suportada pelo seu navegador.');
    }
  };

  const updateAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        try {
          const res = await fetch(`/api/users/${user.id}/avatar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ avatar: base64 })
          });
          if (res.ok) {
            const updatedUser = { ...user, avatar: base64 };
            try { localStorage.setItem('user', JSON.stringify(updatedUser)); } catch {}
            // To force update we can do a full reload, or we rely on the parent component state. 
            // For now, reload window to update the nav bar safely with the new localStorage user
            window.location.reload(); 
          }
        } catch (err) {
          console.error('Failed to update avatar', err);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchAvailable = async () => {
    const res = await fetch('/api/orders/driver/available');
    setAvailableOrders(await res.json());
    // Refresh stats too
    const resStats = await fetch(`/api/stats/driver/${user.id}`);
    setStats(await resStats.json());
  };

  const acceptOrder = async (orderId: number) => {
    await fetch(`/api/orders/${orderId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'out_for_delivery', driverId: user.id })
    });
    const order = availableOrders.find(o => o.id === orderId);
    if (order) setActiveOrder({ ...order, status: 'out_for_delivery' });
    fetchAvailable();
  };

  const completeOrder = async (orderId: number) => {
    await fetch(`/api/orders/${orderId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'delivered' })
    });
    setActiveOrder(null);
    fetchAvailable();
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Driver Profile Header */}
      <Card className="flex flex-col md:flex-row items-center gap-6 p-8 border-none shadow-2xl bg-gradient-to-br from-slate-900 via-black to-slate-800 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 blur-3xl rounded-full" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-amber-500/10 blur-3xl rounded-full" />
        <div className="relative group cursor-pointer z-10 w-28 h-28 shrink-0">
          {user.avatar ? (
             <img src={user.avatar} alt="Perfil" className="w-full h-full object-cover rounded-3xl border-4 border-emerald-500 shadow-2xl" referrerPolicy="no-referrer" />
          ) : (
             <div className="w-full h-full flex items-center justify-center rounded-3xl border-4 border-dashed border-white/20 bg-white/5 text-white/50 group-hover:bg-white/10 group-hover:border-emerald-500 transition-all">
                <User size={36} />
             </div>
          )}
          <div className="absolute inset-0 bg-black/70 rounded-3xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
             <span className="text-[10px] font-black uppercase text-white tracking-widest text-center px-2">Atualizar<br/>Foto</span>
          </div>
          <input type="file" accept="image/*" onChange={updateAvatar} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
        </div>
        <div className="text-center md:text-left z-10 flex-1">
          <h2 className="text-3xl font-black tracking-tight">{user.name}</h2>
          <p className="text-emerald-400 font-bold text-sm tracking-widest uppercase mb-3">Entregador Parceiro</p>
          <div className="flex items-center justify-center md:justify-start gap-3">
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-2xl">
              <Star size={14} className="text-amber-400" />
              <span className="font-bold text-sm">4.9</span>
              <span className="text-white/40 text-xs">nota</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-2xl">
              <Truck size={14} className="text-emerald-400" />
              <span className="font-bold text-sm">{stats?.count || 0}</span>
              <span className="text-white/40 text-xs">entregas</span>
            </div>
            <div className="flex items-center gap-2 bg-emerald-500/20 px-4 py-2 rounded-2xl">
              <Wallet size={14} className="text-emerald-400" />
              <span className="font-bold text-sm">R$ {(stats?.earnings || 0).toFixed(2)}</span>
              <span className="text-white/40 text-xs">ganhos</span>
            </div>
          </div>
        </div>
      </Card>

      {isOnline && (
        <div className="flex gap-4">
          <Button onClick={() => setActiveTab('orders')} className={cn(activeTab !== 'orders' && "bg-transparent text-black hover:bg-black/5")}>
            <MapPin size={18} className="mr-2" /> Entregas Disponíveis
          </Button>
          <Button onClick={() => setActiveTab('stats')} className={cn(activeTab !== 'stats' && "bg-transparent text-black hover:bg-black/5")}>
            <BarChart3 size={18} className="mr-2" /> Meus Ganhos
          </Button>
        </div>
      )}

      {!isOnline ? (
        <Card className="py-16 text-center border-none shadow-2xl bg-gradient-to-br from-slate-50 to-white">
          <div className="relative w-40 h-40 mx-auto bg-gradient-to-br from-emerald-100 to-amber-100 rounded-[3rem] flex items-center justify-center mb-8 shadow-inner">
            <div className="absolute inset-4 bg-white rounded-[2.5rem] flex items-center justify-center">
              <Truck size={48} className="text-emerald-600" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full animate-pulse" />
          </div>
          <h3 className="mb-3 text-3xl font-black tracking-tight">Pronto para ganhar?</h3>
          <p className="mb-8 text-black/50 max-w-md mx-auto font-medium">Ative sua localização para receber pedidos em tempo real e comece a fazer entregas agora mesmo.</p>
          {locationError && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold flex items-center justify-center gap-2"><AlertCircle size={16}/> {locationError}</div>}
          <Button onClick={goOnline} className="h-16 px-16 text-lg font-black uppercase tracking-widest bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 hover:scale-[1.02] shadow-2xl shadow-emerald-200 transition-all rounded-3xl">
            <Bike size={20} className="mr-2" /> Ficar Online
          </Button>
        </Card>
      ) : activeTab === 'stats' && stats ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-emerald-600 text-white p-6">
              <p className="text-sm text-white/60 mb-1">Total de Ganhos</p>
              <p className="text-3xl font-bold">R$ {stats.earnings.toFixed(2)}</p>
              <div className="mt-4 flex items-center text-xs text-white/40">
                <DollarSign size={14} className="mr-1" /> Seu lucro acumulado
              </div>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-black/50 mb-1">Corridas Finalizadas</p>
              <p className="text-3xl font-bold">{stats.count}</p>
              <div className="mt-4 flex items-center text-xs text-black/30">
                <Truck size={14} className="mr-1" /> Entregas bem-sucedidas
              </div>
            </Card>
          </div>
          
          <Card>
            <h3 className="mb-4 font-bold">Últimas Atividades</h3>
            <p className="text-center py-8 text-black/30 italic">O histórico detalhado de corridas aparecerá aqui.</p>
          </Card>
        </div>
      ) : activeOrder ? (
        <Card className="border-emerald-500 bg-emerald-50/10 p-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                <Truck size={24} />
              </div>
              <h3 className="text-xl font-bold">Entrega em Andamento</h3>
            </div>
            <span className="rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-black text-white uppercase tracking-wider">Ativo</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <div className="relative pl-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-black/10">
                <div className="relative mb-4">
                  <div className="absolute -left-[1.35rem] top-1 w-2.5 h-2.5 rounded-full bg-black ring-4 ring-white" />
                  <p className="text-xs text-black/40 uppercase font-bold tracking-tight">Retirada</p>
                  <p className="font-medium text-sm">{activeOrder.restaurantName}</p>
                  <p className="text-[10px] text-black/50">{activeOrder.restaurantAddress}</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[1.35rem] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-white" />
                  <p className="text-xs text-emerald-500/60 uppercase font-bold tracking-tight">Entrega</p>
                  <p className="font-medium text-sm">{activeOrder.address}</p>
                </div>
              </div>
            </div>
            
            <div className="md:col-span-2 mt-4 overflow-hidden rounded-3xl border border-black/5">
               <DeliveryMap 
                  driverLoc={driverLoc} 
                  restaurantLoc={{ lat: activeOrder.restaurantLat, lng: activeOrder.restaurantLng }}
                  clientLoc={{ lat: activeOrder.client_lat, lng: activeOrder.client_lng }}
                />
            </div>
          </div>
          <div className="mt-8 flex gap-3">
             <Button variant="outline" className="flex-1" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeOrder.address)}`)}>
               <MapPin size={16} className="mr-2" /> Ver Rota
             </Button>
            <Button onClick={() => completeOrder(activeOrder.id)} className="flex-[2] bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200">
              Marcar como Entregue
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">Pedidos Disponíveis</h3>
            {stats && (
              <div className="px-3 py-1 bg-black/5 rounded-full text-xs font-medium">
                Hoje: <span className="font-bold">R$ {stats.earnings.toFixed(2)}</span>
              </div>
            )}
          </div>
          {availableOrders.map(order => (
            <Card key={order.id} className="flex items-center justify-between p-4 hover:shadow-xl transition-all border-none shadow-md">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="font-black text-lg">{order.restaurantName}</p>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="text-black/60 flex items-center gap-1"><Store size={12} /> {order.restaurantAddress}</p>
                  <p className="text-black/60 flex items-center gap-1"><MapPin size={12} /> {order.address}</p>
                </div>
                <div className="flex items-center gap-4 mt-3">
                  <div className="bg-emerald-100 px-3 py-1.5 rounded-xl">
                    <p className="text-xs text-emerald-600 font-bold uppercase">Ganho</p>
                    <p className="text-emerald-700 font-black">R$ {order.delivery_fee?.toFixed(2)}</p>
                  </div>
                  <div className="bg-black/5 px-3 py-1.5 rounded-xl">
                    <p className="text-xs text-black/40 font-bold uppercase">Total</p>
                    <p className="text-black/70 font-bold">R$ {order.total_price.toFixed(2)}</p>
                  </div>
                </div>
              </div>
              <Button onClick={() => acceptOrder(order.id)} className="h-12 px-6 bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-200 font-bold rounded-xl">
                <Check size={18} className="mr-1" /> Aceitar
              </Button>
            </Card>
          ))}
          {availableOrders.length === 0 && <p className="py-8 text-center text-black/50">Nenhum pedido disponível no momento.</p>}
        </div>
      )}
    </div>
  );
}

// --- Client Dashboard ---

function ClientDashboard({ user }: { user: UserData }) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<{ item: MenuItem, quantity: number }[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [address, setAddress] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [showProfileUpdate, setShowProfileUpdate] = useState(false);
  const [tempCpf, setTempCpf] = useState(user.cpf || '');
  const [tempPhone, setTempPhone] = useState(user.phone || '');
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
  const [driverLocation, setDriverLocation] = useState<{lat: number, lng: number} | null>(null);
  const [trackingDriverId, setTrackingDriverId] = useState<number | null>(null);
  const [pixData, setPixData] = useState<{ orderId: number, pixText: string, qrCodeBase64: string } | null>(null);
  const [pixStatus, setPixStatus] = useState<'awaiting' | 'paid' | 'error'>('awaiting');
  const [pixCountdown, setPixCountdown] = useState(600); // 10 minutes
  const [pixCopied, setPixCopied] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'dinheiro' | 'cartao'>('pix');
  const [deliveryDistance, setDeliveryDistance] = useState<number | null>(null);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [clientCoords, setClientCoords] = useState<{lat: number, lng: number} | null>(null);
  const clientWatchRef = useRef<number | null>(null);
  const trackingDriverIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (selectedRestaurant && selectedRestaurant.lat && selectedRestaurant.lng) {
      if (navigator.geolocation) {
        if (clientWatchRef.current !== null) navigator.geolocation.clearWatch(clientWatchRef.current);
        clientWatchRef.current = navigator.geolocation.watchPosition((pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setClientCoords(coords);
          const dist = calculateDistance(
            selectedRestaurant.lat, 
            selectedRestaurant.lng, 
            pos.coords.latitude, 
            pos.coords.longitude
          );
          setDeliveryDistance(dist);
          setDeliveryFee(dist * 1.45);
        }, (err) => console.error('Geolocation error:', err), { enableHighAccuracy: true, maximumAge: 3000 });
      }
    }
    return () => {
      if (clientWatchRef.current !== null) {
        navigator.geolocation.clearWatch(clientWatchRef.current);
        clientWatchRef.current = null;
      }
    };
  }, [selectedRestaurant]);

  useEffect(() => {
    fetchRestaurants();
    fetchOrders();
    
    // Listen to Supabase Realtime for driver locations
    const channel = supabase
      .channel('entregadores_localizacao')
      .on('postgres_changes', { 
        event: 'UPDATE' as const, 
        schema: 'public', 
        table: 'entregadores_localizacao' 
      }, (payload: any) => {
        console.log('Supabase Realtime update:', payload);
        
        if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
          const newLoc = payload.new;
          if (newLoc && newLoc.posicao) {
            // Parse POINT geometry
            const pointMatch = newLoc.posicao.match(/POINT\(([^)]+)\)/);
            if (pointMatch) {
              const [lng, lat] = pointMatch[1].split(' ').map(Number);
              console.log('Driver location from Supabase:', lat, lng);
              
              // Track by driverId if we're already tracking this driver
              if (trackingDriverIdRef.current && newLoc.id === trackingDriverIdRef.current) {
                setDriverLocation({ lat, lng });
              }
              
              // Also check if we have an order for this driver
              setOrders(prev => {
                const match = prev.find(o => o.driverId === newLoc.id && o.status === 'out_for_delivery');
                if (match) {
                  console.log('Setting driver location from Supabase order match');
                  setTrackingOrder(match);
                  setTrackingDriverId(newLoc.id);
                  trackingDriverIdRef.current = newLoc.id;
                  setDriverLocation({ lat, lng });
                }
                return prev;
              });
            }
          }
        }
      })
      .subscribe((status) => {
        console.log('Supabase channel status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Update distance when restaurant or location changes
  useEffect(() => {
    if (selectedRestaurant && selectedRestaurant.lat && selectedRestaurant.lng) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
          const dist = calculateDistance(
            selectedRestaurant.lat, 
            selectedRestaurant.lng, 
            pos.coords.latitude, 
            pos.coords.longitude
          );
          setDeliveryDistance(dist);
          setDeliveryFee(dist * 1.45);
        });
      }
    } else {
      setDeliveryDistance(null);
      setDeliveryFee(0);
    }
  }, [selectedRestaurant]);

  const fetchRestaurants = async () => {
    const res = await fetch('/api/restaurants');
    setRestaurants(await res.json());
  };

  const handleUpdateProfile = async () => {
    if (!tempCpf || !tempPhone) {
      alert('Por favor, preencha CPF e Telefone.');
      return;
    }
    const res = await fetch(`/api/users/${user.id}/info`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cpf: tempCpf, phone: tempPhone })
    });
    if (res.ok) {
      const updatedUser = { ...user, cpf: tempCpf, phone: tempPhone };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      alert('Dados atualizados com sucesso!');
      setShowProfileUpdate(false);
      window.location.reload(); // Refresh to update user context globally
    } else {
      alert('Erro ao atualizar dados.');
    }
  };

  const fetchOrders = async () => {
    const res = await fetch(`/api/orders/client/${user.id}`);
    const data: Order[] = await res.json();
    setOrders(data);
    // Auto-track any order currently out for delivery
    const activeDelivery = data.find(o => o.status === 'out_for_delivery');
    if (activeDelivery) {
      setTrackingOrder(activeDelivery);
      if (activeDelivery.driverId) {
        setTrackingDriverId(activeDelivery.driverId);
        trackingDriverIdRef.current = activeDelivery.driverId;
      }
    }
  };

  const selectRestaurant = async (r: Restaurant) => {
    setSelectedRestaurant(r);
    const res = await fetch(`/api/restaurants/${r.id}/menu`);
    setMenu(await res.json());
  };

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.item.id === item.id);
      if (existing) return prev.map(i => i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: number) => {
    setCart(prev => prev.filter(p => p.item.id !== itemId));
  };

  const totalPrice = cart.reduce((sum, i) => sum + i.item.price * i.quantity, 0);

  const placeOrder = async () => {
    if (user.status !== 'approved') {
      alert('Sua conta ainda não foi aprovada pelo administrador.');
      return;
    }

    if (!address.trim()) {
      alert('Por favor, informe seu endereço de entrega.');
      return;
    }

    if (!user.cpf || !user.phone) {
      alert('Para gerar o PIX, precisamos do seu CPF e Telefone. Por favor, atualize seus dados.');
      setShowProfileUpdate(true);
      return;
    }

    setShowConfirm(true);
  };

  const confirmOrder = async () => {
    if (checkoutLoading) return;
    setCheckoutLoading(true);

    const doRequest = async (lat: number, lng: number) => {
      if (paymentMethod === 'pix') {
        const res = await fetch('/api/payment/pix', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientId: user.id,
            restaurantId: selectedRestaurant!.id,
            items: cart.map(i => ({ id: i.item.id, quantity: i.quantity, price: i.item.price })),
            totalPrice: totalPrice + deliveryFee,
            deliveryFee,
            distance: deliveryDistance,
            lat, lng, address
          })
        });
        const data = await res.json();
        if (res.ok) {
          setPixData({ orderId: data.orderId, pixText: data.pixText, qrCodeBase64: data.qrCodeBase64 });
          setPixStatus('awaiting');
          setPixCountdown(600);
          setShowConfirm(false);
          setCart([]);
          setSelectedRestaurant(null);
          setAddress('');

          const interval = setInterval(async () => {
            try {
              const r = await fetch(`/api/payment/status/${data.orderId}`);
              const s = await r.json();
              if (s.status === 'paid') {
                setPixStatus('paid');
                clearInterval(interval);
                fetchOrders();
              }
            } catch {}
          }, 3000);

          const timer = setInterval(() => {
            setPixCountdown(prev => {
              if (prev <= 1) { clearInterval(timer); return 0; }
              return prev - 1;
            });
          }, 1000);
        } else {
          alert(data.error || 'Erro ao gerar PIX');
        }
        setCheckoutLoading(false);
      } else {
        const res = await fetch('/api/payment/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientId: user.id,
            restaurantId: selectedRestaurant!.id,
            items: cart.map(i => ({ id: i.item.id, quantity: i.quantity, price: i.item.price })),
            totalPrice: totalPrice + deliveryFee,
            deliveryFee,
            distance: deliveryDistance,
            lat, lng, address, method: paymentMethod
          })
        });
        const data = await res.json();
        if (res.ok) {
          alert('Pedido realizado com sucesso!');
          setCart([]);
          setSelectedRestaurant(null);
          setAddress('');
          fetchOrders();
        } else {
          alert(data.error || 'Erro ao realizar pedido');
        }
        setCheckoutLoading(false);
      }
    };

    if (clientCoords) {
      doRequest(clientCoords.lat, clientCoords.lng);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => doRequest(pos.coords.latitude, pos.coords.longitude),
        () => doRequest(0, 0)
      );
    } else {
      doRequest(0, 0);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {showProfileUpdate && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm">
            <Card className="p-8 border-none shadow-2xl bg-white text-black">
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-white shadow-xl">
                  <User size={28} />
                </div>
                <h3 className="text-2xl font-black tracking-tight text-black">Atualizar Dados</h3>
                <p className="text-black/50 text-sm">Necessário para gerar o PIX</p>
              </div>
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-black uppercase tracking-widest text-black/40">CPF</label>
                  <input 
                    type="text" 
                    placeholder="000.000.000-00"
                    value={tempCpf} 
                    onChange={e => setTempCpf(e.target.value)}
                    className="w-full rounded-2xl border-none bg-black/5 px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-black text-black"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-black uppercase tracking-widest text-black/40">Telefone</label>
                  <input 
                    type="text" 
                    placeholder="(00) 00000-0000"
                    value={tempPhone} 
                    onChange={e => setTempPhone(e.target.value)}
                    className="w-full rounded-2xl border-none bg-black/5 px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-black text-black"
                  />
                </div>
                <div className="pt-4 flex flex-col gap-3">
                  <Button onClick={handleUpdateProfile} className="h-14 font-black uppercase tracking-widest bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-200">Salvar e Continuar</Button>
                  <Button variant="ghost" onClick={() => setShowProfileUpdate(false)} className="h-14 font-bold text-black/40 hover:text-black">Cancelar</Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Tracking Banner */}
      {trackingOrder && (
        <Card className="border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-100 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 animate-pulse items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-200">
                <Truck size={24} />
              </div>
                <div>
                <p className="font-black text-emerald-900 tracking-tight">
                  {trackingOrder.delivery_type === 'own' ? 'O restaurante estáendendo!' : 'Seu pedido está chegando!'}
                </p>
                <div className="flex items-center gap-2 text-xs text-emerald-700/60">
                   <MapPin size={12} />
                   <span>
                     {trackingOrder.delivery_type === 'own' 
                       ? 'Entrega realizada pela equipe própria do restaurante' 
                       : (driverLocation ? `Entregador localizado - dist: ${trackingOrder.client_lat ? calculateDistance(driverLocation.lat, driverLocation.lng, trackingOrder.client_lat, trackingOrder.client_lng).toFixed(1) + 'km' : '...'}` : 'Aguardando localização do entregador...')}
                   </span>
                </div>
              </div>
            </div>
            <Button size="sm" variant="ghost" onClick={() => { setTrackingOrder(null); setDriverLocation(null); trackingDriverIdRef.current = null; }} className="hover:bg-emerald-100 text-emerald-600">
              <X size={18} />
            </Button>
          </div>
          {/* Debug info */}
          <div className="text-[10px] text-black/40 bg-white p-2 rounded">
            trackingOrder: {trackingOrder.id} | driverId: {trackingOrder.driverId} | driverLoc: {driverLocation ? 'ok' : 'null'} | client_lat: {trackingOrder.client_lat} | restaurantLat: {trackingOrder.restaurantLat}
          </div>
          {/* Live map */}
          <DeliveryMap
            driverLoc={driverLocation}
            restaurantLoc={trackingOrder.restaurantLat ? { lat: trackingOrder.restaurantLat, lng: trackingOrder.restaurantLng } : null}
            clientLoc={trackingOrder.client_lat ? { lat: trackingOrder.client_lat, lng: trackingOrder.client_lng } : null}
          />
        </Card>
      )}

      {/* PIX Modal */}
      {pixData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <Card className="w-full max-w-md overflow-hidden bg-white p-0 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="bg-emerald-600 p-8 text-center text-white">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/20">
                <Check size={40} className={cn(pixStatus === 'paid' ? 'scale-100' : 'scale-0')} />
                {pixStatus !== 'paid' && <DollarSign size={40} />}
              </div>
              <h3 className="text-2xl font-black">
                {pixStatus === 'paid' ? 'Pagamento Confirmado!' : 'Aguardando Pagamento'}
              </h3>
              <p className="text-white/60">Delivr • Pagamento PIX</p>
            </div>
            
            <div className="p-8">
              {pixStatus === 'paid' ? (
                <div className="text-center animate-in fade-in slide-in-from-bottom-4">
                  <p className="mb-6 text-black/60">O restaurante já foi notificado e está preparando seu pedido com carinho.</p>
                  <Button onClick={() => setPixData(null)} className="w-full bg-black">Entendido</Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex flex-col items-center">
                    <img src={pixData.qrCodeBase64} alt="QR Code PIX" className="mb-4 h-48 w-48 rounded-xl border border-black/5 p-2 shadow-inner" />
                    <div className="flex items-center gap-2 text-sm font-bold text-black/40">
                      <Clock size={16} />
                      Expira em {Math.floor(pixCountdown / 60)}:{(pixCountdown % 60).toString().padStart(2, '0')}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-black/40">Código Copia e Cola</label>
                    <div className="flex gap-2">
                      <input 
                        readOnly 
                        value={pixData.pixText} 
                        className="flex-1 rounded-xl bg-black/5 px-4 py-2 text-xs font-mono" 
                      />
                      <Button size="sm" onClick={() => {
                        navigator.clipboard.writeText(pixData.pixText);
                        setPixCopied(true);
                        setTimeout(() => setPixCopied(false), 2000);
                      }}>
                        {pixCopied ? <Check size={16} /> : <Plus size={16} />}
                      </Button>
                    </div>
                    {pixCopied && <p className="text-center text-[10px] text-emerald-600 font-bold">Copiado para a área de transferência!</p>}
                  </div>
                  
                  <div className="flex items-center justify-center gap-2 rounded-xl bg-amber-50 p-4 text-xs font-medium text-amber-700">
                    <Star size={14} />
                    <span>Não feche esta página até o pagamento ser confirmado.</span>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {!selectedRestaurant && !pixData && (
        <>
          <section className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-slate-900 via-black to-slate-800 p-10 text-white md:p-16 shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 blur-3xl rounded-full" />
            <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-amber-500/10 blur-3xl rounded-full" />
            <div className="relative z-10 max-w-xl">
              <span className="mb-4 inline-block rounded-full bg-emerald-500/20 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-emerald-400">Delivery Premium</span>
              <h2 className="mb-6 text-5xl font-black leading-none tracking-tighter md:text-7xl">
                O melhor da cidade <span className="text-emerald-500">na sua mão.</span>
              </h2>
              <p className="text-white/60 text-lg mb-8 font-medium">Peça agora e receba rapidinho no conforto da sua casa.</p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="relative flex-1">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={20} />
                  <input 
                    placeholder="Qual seu endereço?" 
                    value={address} 
                    onChange={e => setAddress(e.target.value)}
                    className="w-full rounded-2xl border-none bg-white/10 pl-12 pr-6 py-5 text-white placeholder:text-white/30 focus:ring-2 focus:ring-emerald-500/50 backdrop-blur-sm"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-3xl font-black tracking-tighter">Escolha seu Restaurante</h3>
              <div className="hidden gap-2 md:flex">
                {['Tudo', '🍕 Pizza', '🍔 Burger', '🇯🇵 Japa', '🇮🇹 Massa'].map(cat => (
                  <button key={cat} className="rounded-full bg-black/5 px-6 py-2.5 text-xs font-black uppercase transition-all hover:bg-black hover:text-white">
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {restaurants.map(r => (
                <div 
                  key={r.id} 
                  onClick={() => selectRestaurant(r)} 
                  className="group cursor-pointer space-y-4"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2rem] bg-black/5 shadow-xl transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-black/10">
                    <img 
                      src={`https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600&auto=format&fit=crop`} 
                      alt={r.name} 
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    <div className="absolute bottom-4 left-4 flex gap-2">
                       <span className="rounded-full bg-white/90 backdrop-blur px-3 py-1 text-[10px] font-black uppercase text-black">{r.category}</span>
                    </div>
                  </div>
                  <div className="px-2">
                    <div className="mb-1 flex items-center justify-between">
                      <h4 className="text-lg font-black tracking-tight">{r.name}</h4>
                      <div className="flex items-center text-xs font-black text-amber-500">
                        <Star size={14} className="mr-1 fill-amber-500" /> 4.9
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-bold text-black/30">
                      <span className="flex items-center"><Clock size={12} className="mr-1" /> 25-40 min</span>
                      <span className="flex items-center"><DollarSign size={12} className="mr-1" /> Grátis</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {orders.length > 0 && (
            <section className="rounded-[3rem] bg-gradient-to-br from-slate-50 to-white p-8 md:p-12 shadow-xl">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-3xl font-black tracking-tighter">Meus Pedidos</h3>
                <span className="bg-black text-white px-4 py-2 rounded-full text-xs font-black">{orders.length} pedidos</span>
              </div>
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {orders.map(order => (
                  <Card key={order.id} className={cn("group border-none bg-white p-6 shadow-lg shadow-black/5 transition-all hover:shadow-2xl hover:-translate-y-1", 
                    order.status === 'out_for_delivery' && "ring-2 ring-emerald-500"
                  )}>
                    <div className="mb-6 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-600 font-black">
                           #{order.id}
                        </div>
                        {order.status === 'out_for_delivery' && (
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs font-bold text-emerald-600">A caminho</span>
                          </div>
                        )}
                      </div>
                      <span className={cn(
                        "rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest",
                        order.status === 'pending' && order.payment_status !== 'paid' && "bg-amber-100 text-amber-600",
                        order.status === 'pending' && order.payment_status === 'paid' && "bg-blue-100 text-blue-600",
                        order.status === 'preparing' && "bg-blue-100 text-blue-600",
                        order.status === 'out_for_delivery' && "bg-emerald-500 text-white shadow-lg shadow-emerald-200",
                        order.status === 'delivered' && "bg-black/5 text-black/40"
                      )}>
                        {order.status === 'pending' && order.payment_status !== 'paid' && 'Aguardando PGTO'}
                        {order.status === 'pending' && order.payment_status === 'paid' && 'Pago'}
                        {order.status === 'preparing' && 'Preparando'}
                        {order.status === 'out_for_delivery' && 'A caminho'}
                        {order.status === 'delivered' && 'Entregue'}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xl font-black mb-1">{order.restaurantName}</h4>
                      <p className="text-xs font-medium text-black/40 mb-6">{new Date(order.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                      
                      <div className="flex items-center justify-between border-t border-black/5 pt-6">
                        <div>
                          <p className="text-xs text-black/40 font-bold uppercase">Total</p>
                          <p className="text-xl font-black text-emerald-600">R$ {order.total_price.toFixed(2)}</p>
                        </div>
                        {order.status === 'out_for_delivery' && (
                          <Button variant="outline" size="sm" onClick={() => { setTrackingOrder(order); setSelectedRestaurant(null); }} className="rounded-xl font-bold px-4 bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-500 hover:text-white">
                            <MapPin size={14} className="mr-1" /> Rastrear
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {selectedRestaurant && (
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-8 space-y-10">
            <button 
              onClick={() => setSelectedRestaurant(null)} 
              className="group flex items-center text-sm font-black uppercase tracking-widest text-black/40 transition-colors hover:text-black"
            >
              <Plus size={20} className="mr-2 rotate-45 transition-transform group-hover:rotate-0" /> Voltar
            </button>
            
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <h3 className="text-5xl font-black tracking-tighter mb-2">{selectedRestaurant.name}</h3>
                <p className="flex items-center text-black/40 font-bold">
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] text-emerald-600 mr-3">{selectedRestaurant.category}</span>
                  <MapPin size={14} className="mr-1" /> {selectedRestaurant.address}
                </p>
              </div>
              <div className="flex gap-4">
                 <div className="text-center bg-black/5 rounded-2xl p-4 min-w-[100px]">
                    <p className="text-[10px] font-black uppercase text-black/30">Avaliação</p>
                    <p className="text-xl font-black flex items-center justify-center gap-1">4.8 <Star size={14} className="fill-amber-400 text-amber-400"/></p>
                 </div>
                 <div className="text-center bg-black/5 rounded-2xl p-4 min-w-[100px]">
                    <p className="text-[10px] font-black uppercase text-black/30">Entrega</p>
                    <p className="text-xl font-black">25m</p>
                 </div>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {menu.map(item => (
                <Card key={item.id} className="group overflow-hidden border-none bg-black/5 p-0 transition-all hover:bg-white hover:shadow-2xl">
                  <div className="flex">
                    <div className="p-6 flex-1 space-y-4">
                      <div>
                        <h4 className="text-lg font-black tracking-tight">{item.name}</h4>
                        <p className="text-xs text-black/40 line-clamp-2 mt-1">{item.description}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-black text-emerald-600 tracking-tighter">R$ {item.price.toFixed(2)}</p>
                        <button 
                          onClick={() => addToCart(item)}
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white shadow-lg transition-transform active:scale-95"
                        >
                          <Plus size={20} />
                        </button>
                      </div>
                    </div>
                    <div className="aspect-square w-32 overflow-hidden">
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all" referrerPolicy="no-referrer" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4">
            <Card className="sticky top-24 overflow-hidden border-none bg-black text-white p-0 shadow-2xl">
              <div className="p-8 pb-4">
                <h3 className="text-2xl font-black tracking-tighter flex items-center gap-3">
                  <ShoppingBag size={24} className="text-emerald-500" /> Seu Pedido
                </h3>
              </div>
              
              <div className="p-8 pt-4 space-y-8">
                {cart.length === 0 ? (
                  <div className="py-12 text-center text-white/20">
                    <ShoppingBag size={64} className="mx-auto mb-4 opacity-5" />
                    <p className="text-sm font-bold uppercase tracking-widest">Carrinho Vazio</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-6 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                      {cart.map(c => (
                        <div key={c.item.id} className="flex justify-between items-center group animate-in slide-in-from-right-4">
                          <div className="flex items-center gap-4">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-xs font-black">
                               {c.quantity}
                            </div>
                            <div>
                              <p className="font-bold text-sm tracking-tight">{c.item.name}</p>
                              <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">R$ {c.item.price.toFixed(2)}</p>
                            </div>
                          </div>
                          <button onClick={() => removeFromCart(c.item.id)} className="p-2 text-white/20 hover:text-red-400 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-6 border-t border-white/10 pt-8">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Forma de Pagamento</label>
                          <div className="flex gap-2">
                            <button onClick={() => setPaymentMethod('pix')} className={cn("flex-1 rounded-xl py-3 text-sm font-bold transition-all", paymentMethod === 'pix' ? "bg-emerald-500 text-white" : "bg-white/10 text-white/60 hover:bg-white/20")}>PIX</button>
                            <button onClick={() => setPaymentMethod('dinheiro')} className={cn("flex-1 rounded-xl py-3 text-sm font-bold transition-all", paymentMethod === 'dinheiro' ? "bg-emerald-500 text-white" : "bg-white/10 text-white/60 hover:bg-white/20")}>Dinheiro</button>
                            <button onClick={() => setPaymentMethod('cartao')} className={cn("flex-1 rounded-xl py-3 text-sm font-bold transition-all", paymentMethod === 'cartao' ? "bg-emerald-500 text-white" : "bg-white/10 text-white/60 hover:bg-white/20")}>Cartão</button>
                          </div>
                        </div>

                        <div className="space-y-2 border-t border-white/10 pt-4">
                          <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Endereço de Entrega</label>
                          <div className="flex gap-2">
                            <input 
                              placeholder="Digite o endereço..." 
                              value={address} 
                              onChange={e => setAddress(e.target.value)} 
                              className="flex-1 rounded-xl border-none bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/20 focus:ring-2 focus:ring-emerald-500/50" 
                            />
                            <Button 
                              type="button" 
                              onClick={() => {
                                if (navigator.geolocation) {
                                  navigator.geolocation.getCurrentPosition((pos) => {
                                    const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                                    setClientCoords(coords);
                                    const dist = calculateDistance(pos.coords.latitude, pos.coords.longitude, selectedRestaurant.lat, selectedRestaurant.lng);
                                    setDeliveryDistance(dist);
                                    setDeliveryFee(dist * 1.45);
                                  });
                                }
                              }}
                              className={cn("rounded-xl border-none text-white hover:bg-white/20 h-[44px] w-[44px] p-0 transition-all", clientCoords ? "bg-emerald-500" : "bg-white/10")}
                            >
                              <MapPin size={20} className={cn(clientCoords && "animate-pulse")} />
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 border-t border-white/10 pt-6">
                        <div className="flex justify-between text-xs font-bold text-white/40 uppercase tracking-widest">
                          <span>Subtotal</span>
                          <span>R$ {totalPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold text-emerald-500/80 uppercase tracking-widest">
                          <span>Taxa de Manutenção ({deliveryDistance?.toFixed(1)} km)</span>
                          <span>R$ {deliveryFee.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="flex items-end justify-between border-t border-white/10 pt-4">
                        <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Total Geral</p>
                        <p className="text-4xl font-black text-emerald-500 tracking-tighter">R$ {(totalPrice + deliveryFee).toFixed(2)}</p>
                      </div>

                      <Button 
                        onClick={confirmOrder} 
                        className="h-16 w-full bg-emerald-600 text-lg font-black uppercase tracking-widest shadow-xl shadow-emerald-900/20 hover:bg-emerald-500 hover:scale-[1.02] active:scale-95 transition-all" 
                        disabled={checkoutLoading}
                      >
                        {checkoutLoading ? "Processando..." : "Confirmar e Pagar"}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

