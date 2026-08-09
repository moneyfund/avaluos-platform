import { Navigate, NavLink, Route, Routes } from 'react-router-dom';
import { History, KeyRound, LogOut, ShieldCheck } from 'lucide-react';
import TerrenoWorkspace from './features/avaluos/components/TerrenoWorkspace';
import CasaWorkspace from './features/avaluos/components/CasaWorkspace';
import HistoryPage from './features/history/HistoryPage';
import AuthGate from './auth/AuthGate';
import { useAuth } from './auth/AuthContext';
import { useTenant } from './tenants/TenantContext';
import PlatformAdminGate from './platform/PlatformAdminGate';
import PlatformAdminPage from './platform/PlatformAdminPage';
import { isRootPlatformAdmin } from './platform/platformAdminAccess';

function TenantGate({ children }) {
  const { loading, tenantId, error, licenseActive, licenseExpired, licenseStatus } = useTenant();
  if (loading) return <div className='tenant-gate'><div><span>Preparando organización</span><h1>Conectando tu espacio de avalúos...</h1></div></div>;
  if (!tenantId) return <div className='tenant-gate'><div><span>Acceso pendiente</span><h1>No hay una organización activa para esta cuenta.</h1><p>{error || 'Solicita acceso al administrador de la plataforma.'}</p></div></div>;
  if (!licenseActive) return <div className='tenant-gate'><div><span>LICENCIA NO DISPONIBLE</span><h1>{licenseExpired || licenseStatus === 'expired' ? 'La licencia de esta organización ha vencido.' : 'La licencia de esta organización está suspendida.'}</h1><p>Contacta al administrador de Avalúos Platform para reactivar el servicio.</p></div></div>;
  return children;
}

function DisabledFeature({ label }) {
  return <main className='feature-disabled-page'><div><KeyRound /><span>MÓDULO NO INCLUIDO</span><h1>{label} no está habilitado en esta licencia.</h1><p>El administrador de la organización puede solicitar la activación de este módulo desde su plan.</p></div></main>;
}

function AppWorkspace() {
  const { user, signOutUser } = useAuth();
  const { tenant, membership, features } = useTenant();
  const platformAdmin = isRootPlatformAdmin(user);
  const defaultRoute = features.terrenos ? '/avaluos/terrenos' : features.casas ? '/avaluos/casas' : '/historial';

  return (
    <div className='avaluos-app'>
      <nav className='avaluos-topnav' aria-label='Navegación de avalúos'>
        <div><strong>{tenant?.name || 'Avalúos Platform'}</strong><span>Avalúos Platform · {membership?.role || 'miembro'}</span></div>
        <div className='avaluos-topnav-links'>
          {features.terrenos && <NavLink to='/avaluos/terrenos' className={({ isActive }) => isActive ? 'is-active' : ''}>Terrenos</NavLink>}
          {features.casas && <NavLink to='/avaluos/casas' className={({ isActive }) => isActive ? 'is-active' : ''}>Casas</NavLink>}
          <NavLink to='/historial' className={({ isActive }) => isActive ? 'is-active' : ''}><History /> Historial</NavLink>
          {platformAdmin && <NavLink to='/platform-admin' className='platform-admin-nav-link'><ShieldCheck /> Plataforma</NavLink>}
        </div>
        <div className='avaluos-user-menu'>
          {user?.photoURL ? <img src={user.photoURL} alt='' referrerPolicy='no-referrer' /> : null}
          <span><strong>{user?.displayName || 'Usuario'}</strong><small>{user?.email}</small></span>
          <button type='button' onClick={signOutUser} aria-label='Cerrar sesión'><LogOut /></button>
        </div>
      </nav>
      <Routes>
        <Route path='/' element={<Navigate to={defaultRoute} replace />} />
        <Route path='/avaluos' element={<Navigate to={defaultRoute} replace />} />
        <Route path='/avaluos/terrenos' element={features.terrenos ? <TerrenoWorkspace /> : <DisabledFeature label='Terrenos' />} />
        <Route path='/avaluos/casas' element={features.casas ? <CasaWorkspace /> : <DisabledFeature label='Casas' />} />
        <Route path='/historial' element={<HistoryPage />} />
        <Route path='*' element={<Navigate to={defaultRoute} replace />} />
      </Routes>
    </div>
  );
}

function RoutedApp() {
  return <Routes>
    <Route path='/platform-admin/*' element={<PlatformAdminGate><PlatformAdminPage /></PlatformAdminGate>} />
    <Route path='*' element={<TenantGate><AppWorkspace /></TenantGate>} />
  </Routes>;
}

export default function App() {
  return <AuthGate><RoutedApp /></AuthGate>;
}