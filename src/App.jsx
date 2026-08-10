import { Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { History, Home, KeyRound, LogOut, MapPinned, ShieldCheck, Sparkles } from 'lucide-react';
import TerrenoWorkspace from './features/avaluos/components/TerrenoWorkspace';
import CasaWorkspace from './features/avaluos/components/CasaWorkspace';
import HistoryPage from './features/history/HistoryPage';
import AccessLanding from './auth/AccessLanding';
import AuthGate from './auth/AuthGate';
import { useAuth } from './auth/AuthContext';
import { TenantProvider, useTenant } from './tenants/TenantContext';
import PlatformAdminGate from './platform/PlatformAdminGate';
import PlatformAdminPage from './platform/PlatformAdminPage';
import { isRootPlatformAdmin } from './platform/platformAdminAccess';

function TenantGate({ children }) {
  const { loading, tenantId, error, licenseActive, licenseExpired, licenseStatus } = useTenant();
  if (loading) return <div className='tenant-gate'><div><span>Preparando organización</span><h1>Conectando tu espacio de avalúos...</h1></div></div>;
  if (!tenantId) return <div className='tenant-gate'><div><span>Acceso pendiente</span><h1>No hay una organización activa para esta cuenta.</h1><p>{error || 'Solicita acceso al administrador de la plataforma.'}</p><a href='/'>Cambiar cuenta de acceso</a></div></div>;
  if (!licenseActive) return <div className='tenant-gate'><div><span>LICENCIA NO DISPONIBLE</span><h1>{licenseExpired || licenseStatus === 'expired' ? 'La licencia de esta organización ha vencido.' : 'La licencia de esta organización está suspendida.'}</h1><p>Contacta al administrador de Avalúos Platform para reactivar el servicio.</p><a href='/'>Volver a la pantalla de acceso</a></div></div>;
  return children;
}

function DisabledFeature({ label }) {
  return <main className='feature-disabled-page'><div><KeyRound /><span>MÓDULO NO INCLUIDO</span><h1>{label} no está habilitado en esta licencia.</h1><p>El administrador de la organización puede solicitar la activación de este módulo desde su plan.</p></div></main>;
}

function AppWorkspace() {
  const { user, signOutUser } = useAuth();
  const { tenant, membership, features } = useTenant();
  const location = useLocation();
  const platformAdmin = isRootPlatformAdmin(user);
  const defaultRoute = features.terrenos ? '/avaluos/terrenos' : features.casas ? '/avaluos/casas' : '/historial';
  const branding = tenant?.branding || {};
  const accent = branding.secondaryColor || '#c8a85b';
  const initials = String(branding.shortName || tenant?.name || 'AP').split(/\s+/).filter(Boolean).map((part) => part[0]).join('').slice(0, 3).toUpperCase();
  const currentSection = location.pathname.includes('/casas') ? 'Avalúo de casa' : location.pathname.includes('/historial') ? 'Historial' : 'Avalúo de terreno';

  return (
    <div className='avaluos-app client-workspace' style={{ '--client-accent': accent }}>
      <aside className='client-sidebar'>
        <div className='client-brand'>
          <div className='client-brand-mark'>{branding.logoUrl ? <img src={branding.logoUrl} alt={`Logo ${tenant?.name || 'organización'}`} /> : <span>{initials}</span>}</div>
          <div><strong>{tenant?.name || 'Avalúos Platform'}</strong><small>Workspace de valoración</small></div>
        </div>

        <div className='client-sidebar-intro'>
          <span><Sparkles /> Plataforma profesional</span>
          <p>Valora, documenta y conserva cada expediente desde un solo espacio.</p>
        </div>

        <nav className='client-nav' aria-label='Módulos de avalúos'>
          <small>MÓDULOS</small>
          {features.terrenos && <NavLink to='/avaluos/terrenos' className={({ isActive }) => isActive ? 'is-active' : ''}><MapPinned /><span><strong>Terrenos</strong><em>Valoración de suelo</em></span></NavLink>}
          {features.casas && <NavLink to='/avaluos/casas' className={({ isActive }) => isActive ? 'is-active' : ''}><Home /><span><strong>Casas</strong><em>Terreno + construcción</em></span></NavLink>}
          <NavLink to='/historial' className={({ isActive }) => isActive ? 'is-active' : ''}><History /><span><strong>Historial</strong><em>Expedientes guardados</em></span></NavLink>
        </nav>

        <div className='client-sidebar-footer'>
          {platformAdmin && <NavLink to='/platform-admin' className='client-platform-link'><ShieldCheck /> Administración central</NavLink>}
          <div className='client-user-card'>
            {user?.photoURL ? <img src={user.photoURL} alt='' referrerPolicy='no-referrer' /> : <span className='client-user-avatar'>{String(user?.displayName || user?.email || 'U').slice(0, 1).toUpperCase()}</span>}
            <div><strong>{user?.displayName || 'Usuario'}</strong><small>{membership?.role || 'miembro'}</small></div>
            <button type='button' onClick={signOutUser} aria-label='Cerrar sesión'><LogOut /></button>
          </div>
        </div>
      </aside>

      <section className='client-main'>
        <header className='client-topbar'>
          <div className='client-breadcrumb'><small>{tenant?.name || 'Organización'} / Avalúos</small><strong>{currentSection}</strong></div>
          <div className='client-topbar-right'>
            <span className='client-status-pill'><i /> Sistema activo</span>
            <div className='client-top-user'>
              {user?.photoURL ? <img src={user.photoURL} alt='' referrerPolicy='no-referrer' /> : null}
              <span><strong>{user?.displayName || 'Usuario'}</strong><small>{user?.email}</small></span>
            </div>
          </div>
        </header>

        <div className='client-page-stage'>
          <Routes>
            <Route path='/avaluos' element={<Navigate to={defaultRoute} replace />} />
            <Route path='/avaluos/terrenos' element={features.terrenos ? <TerrenoWorkspace /> : <DisabledFeature label='Terrenos' />} />
            <Route path='/avaluos/casas' element={features.casas ? <CasaWorkspace /> : <DisabledFeature label='Casas' />} />
            <Route path='/historial' element={<HistoryPage />} />
            <Route path='*' element={<Navigate to={defaultRoute} replace />} />
          </Routes>
        </div>
      </section>
    </div>
  );
}

function TenantWorkspaceRoute() {
  return <AuthGate><TenantProvider><TenantGate><AppWorkspace /></TenantGate></TenantProvider></AuthGate>;
}

function RoutedApp() {
  return <Routes>
    <Route path='/' element={<AccessLanding />} />
    <Route path='/platform-admin/*' element={<PlatformAdminGate><PlatformAdminPage /></PlatformAdminGate>} />
    <Route path='*' element={<TenantWorkspaceRoute />} />
  </Routes>;
}

export default function App() {
  return <RoutedApp />;
}
