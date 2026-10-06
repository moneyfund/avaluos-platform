import { lazy, Suspense } from 'react';
import { Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { History, Home, KeyRound, LogOut, MapPinned, Palette, ShieldCheck, Sparkles } from 'lucide-react';
import TerrenoWorkspace from './features/avaluos/components/TerrenoWorkspace';
import CasaWorkspace from './features/avaluos/components/CasaWorkspace';
import HistoryPage from './features/history/HistoryPage';
import PersonalizationPage from './features/personalization/PersonalizationPage';
import AccessLanding from './auth/AccessLanding';
import AuthGate from './auth/AuthGate';
import { useAuth } from './auth/AuthContext';
import { TenantProvider, useTenant } from './tenants/TenantContext';
import PlatformAdminGate from './platform/PlatformAdminGate';
import PlatformAdminPage from './platform/PlatformAdminPage';
import { isRootPlatformAdmin } from './platform/platformAdminAccess';

const PublicSite = lazy(() => import('./public/PublicSite'));

function TenantGate({ children }) {
  const { loading, tenantId, error, licenseActive, licenseExpired, licenseStatus } = useTenant();
  if (loading) return <div className='tenant-gate'><div><span>Preparando organización</span><h1>Conectando tu espacio de avalúos...</h1></div></div>;
  if (!tenantId) return <div className='tenant-gate'><div><span>Acceso pendiente</span><h1>No hay una organización activa para esta cuenta.</h1><p>{error || 'Solicita acceso al administrador de la plataforma.'}</p><a href='/acceso'>Cambiar cuenta de acceso</a></div></div>;
  if (!licenseActive) return <div className='tenant-gate'><div><span>LICENCIA NO DISPONIBLE</span><h1>{licenseExpired || licenseStatus === 'expired' ? 'La licencia de esta organización ha vencido.' : 'La licencia de esta organización está suspendida.'}</h1><p>Contacta al administrador de AVALNIC para reactivar el servicio.</p><a href='/acceso'>Volver a la pantalla de acceso</a></div></div>;
  return children;
}

function DisabledFeature({ label }) {
  return <main className='feature-disabled-page'><div><KeyRound /><span>MÓDULO NO INCLUIDO</span><h1>{label} no está habilitado en esta licencia.</h1><p>El administrador de la organización puede solicitar la activación de este módulo desde su plan.</p></div></main>;
}

function AppWorkspace() {
  const { user, signOutUser } = useAuth();
  const { tenant, tenantId, membership, features, canAdmin } = useTenant();
  const location = useLocation();
  const platformAdmin = isRootPlatformAdmin(user);
  const canPersonalize = canAdmin || platformAdmin;
  const defaultRoute = features.terrenos ? '/avaluos/terrenos' : features.casas ? '/avaluos/casas' : '/historial';
  const branding = tenant?.branding || {};
  const portalTheme = branding.portalTheme || {};
  const isAmy = tenantId === 'amyblandon';
  const isDiamantes = tenantId === 'diamantes';
  const amyAdminTheme = {
    accentColor: '#2ba7a0',
    pageBackground: '#f4f7f9',
    sidebarBackground: '#071827',
    topbarBackground: '#f8fafb',
    cardBackground: '#ffffff',
    navActiveBackground: '#e9f6f5',
    textColor: '#14212e',
  };
  const avalnicDiamantesTheme = {
    accentColor: '#c8a85b',
    pageBackground: '#f5f4f0',
    sidebarBackground: '#ffffff',
    topbarBackground: '#faf9f6',
    cardBackground: '#ffffff',
    navActiveBackground: '#fff9eb',
    textColor: '#1d2430',
  };
  const activeTheme = isAmy ? amyAdminTheme : isDiamantes ? avalnicDiamantesTheme : portalTheme;
  const accent = activeTheme.accentColor || branding.secondaryColor || '#c8a85b';
  const tenantLogo = isAmy ? '/amy-blandon-logo.svg' : branding.logoUrl;
  const initials = String(branding.shortName || tenant?.name || 'AP').split(/\s+/).filter(Boolean).map((part) => part[0]).join('').slice(0, 3).toUpperCase();
  const currentSection = location.pathname.includes('/casas')
    ? 'Avalúo de casa'
    : location.pathname.includes('/historial')
      ? 'Historial'
      : location.pathname.includes('/personalizacion')
        ? 'Personalización'
        : 'Avalúo de terreno';
  const workspaceStyle = {
    '--client-accent': accent,
    '--client-page-bg': activeTheme.pageBackground || '#f5f4f0',
    '--client-sidebar-bg': activeTheme.sidebarBackground || '#ffffff',
    '--client-topbar-bg': activeTheme.topbarBackground || '#faf9f6',
    '--client-card-bg': activeTheme.cardBackground || '#ffffff',
    '--client-nav-active-bg': activeTheme.navActiveBackground || '#fff9eb',
    '--client-ink': activeTheme.textColor || '#1d2430',
  };

  const pathname = location.pathname.replace(/\/+$/, '') || '/';
  let workspaceContent;

  if (pathname === '/avaluos') {
    workspaceContent = <Navigate to={defaultRoute} replace />;
  } else if (pathname === '/avaluos/terrenos') {
    workspaceContent = features.terrenos ? <TerrenoWorkspace /> : <DisabledFeature label='Terrenos' />;
  } else if (pathname === '/avaluos/casas') {
    workspaceContent = features.casas ? <CasaWorkspace /> : <DisabledFeature label='Casas' />;
  } else if (pathname === '/historial') {
    workspaceContent = <HistoryPage />;
  } else if (pathname === '/personalizacion') {
    workspaceContent = <PersonalizationPage canEdit={canPersonalize} />;
  } else {
    workspaceContent = <Navigate to={defaultRoute} replace />;
  }

  return (
    <div className={`avaluos-app client-workspace${isAmy ? ' is-amy-tenant' : ''}`} style={workspaceStyle}>
      <aside className='client-sidebar'>
        <div className='client-brand'>
          <div className='client-brand-mark'>{tenantLogo ? <img src={tenantLogo} alt={`Logo ${tenant?.name || 'organización'}`} /> : <span>{initials}</span>}</div>
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
          {canPersonalize && <>
            <small className='client-nav-settings-label'>CONFIGURACIÓN</small>
            <NavLink to='/personalizacion' className={({ isActive }) => isActive ? 'is-active' : ''}><Palette /><span><strong>Personalización</strong><em>Colores y apariencia</em></span></NavLink>
          </>}
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
          {workspaceContent}
        </div>
      </section>
    </div>
  );
}

function TenantWorkspaceRoute() {
  return <AuthGate><TenantProvider><TenantGate><AppWorkspace /></TenantGate></TenantProvider></AuthGate>;
}

function PublicSiteRoute() {
  const location = useLocation();
  const tenant = new URLSearchParams(location.search).get('tenant');
  if (location.pathname === '/' && tenant) return <AccessLanding />;
  return <Suspense fallback={<div className='public-route-loader'><img src='/avalnic-favicon.svg' alt='AVALNIC' /></div>}><PublicSite /></Suspense>;
}

function RoutedApp() {
  return <Routes>
    <Route path='/acceso' element={<AccessLanding />} />
    <Route path='/platform-admin/*' element={<PlatformAdminGate><PlatformAdminPage /></PlatformAdminGate>} />
    <Route path='/avaluos/*' element={<TenantWorkspaceRoute />} />
    <Route path='/historial' element={<TenantWorkspaceRoute />} />
    <Route path='/personalizacion' element={<TenantWorkspaceRoute />} />
    <Route path='/*' element={<PublicSiteRoute />} />
  </Routes>;
}

export default function App() {
  return <RoutedApp />;
}
