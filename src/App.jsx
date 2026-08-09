import { Navigate, NavLink, Route, Routes } from 'react-router-dom';
import { History, LogOut } from 'lucide-react';
import TerrenoWorkspace from './features/avaluos/components/TerrenoWorkspace';
import CasaWorkspace from './features/avaluos/components/CasaWorkspace';
import HistoryPage from './features/history/HistoryPage';
import AuthGate from './auth/AuthGate';
import { useAuth } from './auth/AuthContext';
import { useTenant } from './tenants/TenantContext';

function TenantGate({ children }) {
  const { loading, tenantId, error } = useTenant();
  if (loading) return <div className='tenant-gate'><div><span>Preparando organización</span><h1>Conectando tu espacio de avalúos...</h1></div></div>;
  if (!tenantId) return <div className='tenant-gate'><div><span>Acceso pendiente</span><h1>No hay una organización activa para esta cuenta.</h1><p>{error || 'Solicita acceso al administrador de la plataforma.'}</p></div></div>;
  return children;
}

function AppWorkspace() {
  const { user, signOutUser } = useAuth();
  const { tenant, membership } = useTenant();

  return (
    <div className='avaluos-app'>
      <nav className='avaluos-topnav' aria-label='Navegación de avalúos'>
        <div><strong>{tenant?.name || 'Avalúos Platform'}</strong><span>Avalúos Platform · {membership?.role || 'miembro'}</span></div>
        <div className='avaluos-topnav-links'>
          <NavLink to='/avaluos/terrenos' className={({ isActive }) => isActive ? 'is-active' : ''}>Terrenos</NavLink>
          <NavLink to='/avaluos/casas' className={({ isActive }) => isActive ? 'is-active' : ''}>Casas</NavLink>
          <NavLink to='/historial' className={({ isActive }) => isActive ? 'is-active' : ''}><History /> Historial</NavLink>
        </div>
        <div className='avaluos-user-menu'>
          {user?.photoURL ? <img src={user.photoURL} alt='' referrerPolicy='no-referrer' /> : null}
          <span><strong>{user?.displayName || 'Usuario'}</strong><small>{user?.email}</small></span>
          <button type='button' onClick={signOutUser} aria-label='Cerrar sesión'><LogOut /></button>
        </div>
      </nav>
      <Routes>
        <Route path='/' element={<Navigate to='/avaluos/terrenos' replace />} />
        <Route path='/avaluos' element={<Navigate to='/avaluos/terrenos' replace />} />
        <Route path='/avaluos/terrenos' element={<TerrenoWorkspace />} />
        <Route path='/avaluos/casas' element={<CasaWorkspace />} />
        <Route path='/historial' element={<HistoryPage />} />
        <Route path='*' element={<Navigate to='/avaluos/terrenos' replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return <AuthGate><TenantGate><AppWorkspace /></TenantGate></AuthGate>;
}
