import { FormEvent, type ReactNode, useEffect, useMemo, useState } from 'react';
import { Link, Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import {
  Activity,
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Download,
  FileCheck2,
  Gauge,
  KeyRound,
  LayoutDashboard,
  Pencil,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Upload,
  UsersRound,
  X,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import {
  createPlatformTenant,
  PlatformDashboardSnapshot,
  PlatformTenant,
  subscribePlatformDashboard,
} from './platformAdmin.service';
import TenantManagementDrawer from './TenantManagementDrawer';

const initialForm = {
  name: '',
  slug: '',
  shortName: '',
  plan: 'professional',
  status: 'active',
  primaryColor: '#071827',
  secondaryColor: '#c6a15b',
  website: '',
  domain: '',
  email: '',
  phone: '',
};

const statusLabel: Record<string, string> = {
  active: 'Activa',
  suspended: 'Suspendida',
  expired: 'Expirada',
};

const planLabel: Record<string, string> = {
  starter: 'Starter',
  professional: 'Profesional',
  enterprise: 'Enterprise',
};

type ManageTab = 'general' | 'members' | 'license';

function formatCount(value: number) {
  return new Intl.NumberFormat('es-NI').format(Number(value || 0));
}

function asDate(value: any) {
  if (!value) return null;
  try {
    if (typeof value?.toDate === 'function') return value.toDate();
    if (value?.seconds) return new Date(value.seconds * 1000);
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  } catch {
    return null;
  }
}

function recordDate(row: any) {
  return asDate(row?.createdAt) || asDate(row?.createdAtClient);
}

function PlatformBrand({ compact = false }: { compact?: boolean }) {
  return <div className={`platform-v2-brand ${compact ? 'is-compact' : ''}`}>
    <img className='platform-v2-wordmark' src='/avalnic-logo.svg' alt='AVALNIC' />
    <img className='platform-v2-mark' src='/avalnic-favicon.svg' alt='' aria-hidden='true' />
  </div>;
}

function MetricCard({ icon, label, value, note, detail }: any) {
  return <article className='platform-metric'>
    <div className='platform-metric-top'>
      <span className='platform-metric-icon'>{icon}</span>
      <span className='platform-metric-label'>{label}</span>
    </div>
    <strong>{value}</strong>
    <small>{note}</small>
    <div className='platform-trend'>{detail}</div>
  </article>;
}

function PageHeader({ eyebrow, title, description, actions }: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return <div className='platform-page-header'>
    <div>
      <p>{eyebrow}</p>
      <h1>{title}</h1>
      <span>{description}</span>
    </div>
    {actions && <div className='platform-page-actions'>{actions}</div>}
  </div>;
}

function OrganizationRow({ tenant, valuationCount, onManage }: {
  tenant: PlatformTenant;
  valuationCount: number;
  onManage: (tenant: PlatformTenant, tab: ManageTab) => void;
}) {
  const branding = tenant.branding || {};
  const initials = String(branding.shortName || tenant.name || tenant.slug || 'AP')
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 3)
    .toUpperCase();
  const accent = branding.secondaryColor || '#c6a15b';

  return <div className='platform-org-row'>
    <div className='platform-org-name'>
      <div className='platform-org-logo' style={{ '--tenant-accent': accent } as any}>{branding.logoUrl ? <img src={branding.logoUrl} alt='' /> : initials}</div>
      <div><strong>{tenant.name || tenant.slug}</strong><small>{tenant.website || tenant.domain || tenant.slug}</small></div>
    </div>
    <div><span className={`platform-status is-${tenant.status || 'active'}`}><i />{statusLabel[tenant.status || 'active'] || tenant.status}</span></div>
    <div className='platform-plan'><Sparkles /> {planLabel[tenant.plan || tenant.license?.plan || 'professional'] || 'Profesional'}</div>
    <div className='platform-domain'>{tenant.domain || 'Sin dominio'}</div>
    <div className='platform-members'><UsersRound /> {formatCount(Number(tenant.membersCount || 0))}</div>
    <div className='platform-valuations'>{formatCount(valuationCount)}</div>
    <div className='platform-row-actions'>
      <button type='button' onClick={() => onManage(tenant, 'general')} aria-label='Editar organización'><Pencil /></button>
      <button type='button' onClick={() => onManage(tenant, 'members')} aria-label='Gestionar usuarios'><UsersRound /></button>
      <button type='button' className='is-gold' onClick={() => onManage(tenant, 'license')} aria-label='Gestionar licencia'><KeyRound /></button>
    </div>
  </div>;
}

function DashboardPage({
  data,
  loading,
  activeTenants,
  activeLicenses,
  thisMonthAvaluos,
  monthlySeries,
  error,
  onCreate,
}: any) {
  return <>
    <PageHeader
      eyebrow='CONTROL EJECUTIVO'
      title='Centro de valoración corporativa'
      description='Supervisa operación, clientes, licencias y producción desde un entorno diseñado para escalar como firma de valoración internacional.'
      actions={<button type='button' className='platform-primary-button' onClick={onCreate}><Plus /> Nueva organización</button>}
    />

    <div className='platform-metric-grid'>
      <MetricCard icon={<Building2 />} label='Organizaciones' value={loading ? '—' : formatCount(data.tenants.length)} note={`${activeTenants} activas actualmente`} detail={`${formatCount(data.tenants.length - activeTenants)} pausadas o vencidas`} />
      <MetricCard icon={<FileCheck2 />} label='Avalúos procesados' value={loading ? '—' : formatCount(data.avaluos.length)} note='Histórico de toda la plataforma' detail={`${formatCount(thisMonthAvaluos)} creados este mes`} />
      <MetricCard icon={<UsersRound />} label='Usuarios registrados' value={loading ? '—' : formatCount(data.users.length)} note='Identidades conectadas' detail='Asignables a cualquier organización' />
      <MetricCard icon={<Gauge />} label='Licencias activas' value={loading ? '—' : formatCount(activeLicenses)} note={`de ${formatCount(data.tenants.length)} organizaciones`} detail='Estado calculado en tiempo real' />
    </div>

    <section className='platform-panel platform-activity-panel'>
      <div className='platform-panel-heading'>
        <div><p>OPERACIÓN GLOBAL</p><h2>Actividad de valoración</h2></div>
        <span><Activity /> Últimos 12 meses</span>
      </div>
      <div className='platform-activity-grid'>
        <div className='platform-activity-chart'>
          <div className='platform-chart-copy'><strong>{formatCount(thisMonthAvaluos)}</strong><span>avalúos este mes</span></div>
          <div className='platform-bars' aria-label='Avalúos por mes de los últimos 12 meses'>
            {monthlySeries.map((item: any) => <i key={`${item.year}-${item.month}`} style={{ height: `${item.height}%` }} title={`${new Date(item.year, item.month, 1).toLocaleDateString('es-NI', { month: 'short', year: 'numeric' })}: ${item.count}`} />)}
          </div>
        </div>
        <div className='platform-health'>
          <div><span>Organizaciones activas</span><strong>{activeTenants}/{data.tenants.length || 0}</strong><i style={{ width: `${data.tenants.length ? (activeTenants / data.tenants.length) * 100 : 0}%` }} /></div>
          <div><span>Licencias operativas</span><strong>{activeLicenses}/{data.tenants.length || 0}</strong><i style={{ width: `${data.tenants.length ? (activeLicenses / data.tenants.length) * 100 : 0}%` }} /></div>
          <div><span>Persistencia</span><strong>{error ? 'Revisar' : 'Firestore OK'}</strong><i style={{ width: error ? '20%' : '100%' }} /></div>
        </div>
      </div>
    </section>

    <div className='platform-dashboard-split'>
      <section className='platform-panel platform-compact-panel'>
        <div className='platform-panel-heading'><div><p>PORTAFOLIO</p><h2>Organizaciones recientes</h2></div><Link to='/platform-admin/organizations'>Ver todas <ChevronRight /></Link></div>
        <div className='platform-mini-list'>
          {data.tenants.slice(0, 5).map((tenant: PlatformTenant) => <div key={tenant.id}>
            <span className='platform-mini-avatar'>{String(tenant.branding?.shortName || tenant.name || tenant.slug).slice(0, 2).toUpperCase()}</span>
            <div><strong>{tenant.name || tenant.slug}</strong><small>{planLabel[tenant.plan || tenant.license?.plan || 'professional']}</small></div>
            <span className={`platform-status is-${tenant.status || 'active'}`}><i />{statusLabel[tenant.status || 'active']}</span>
          </div>)}
          {!data.tenants.length && <div className='platform-empty-inline'>No hay organizaciones registradas.</div>}
        </div>
      </section>

      <section className='platform-panel platform-compact-panel'>
        <div className='platform-panel-heading'><div><p>INFRAESTRUCTURA</p><h2>Controles operativos</h2></div><Link to='/platform-admin/system'>Abrir sistema <ChevronRight /></Link></div>
        <div className='platform-control-grid'>
          <article><ShieldCheck /><span><strong>Seguridad multiempresa</strong><small>Aislamiento por tenantId</small></span><b>Activo</b></article>
          <article><Upload /><span><strong>Evidencia digital</strong><small>Firebase Storage</small></span><b>Activo</b></article>
          <article><KeyRound /><span><strong>Enforcement de licencia</strong><small>Planes, límites y módulos</small></span><b>Activo</b></article>
        </div>
      </section>
    </div>
  </>;
}

function OrganizationsPage({
  data,
  loading,
  query,
  setQuery,
  statusFilter,
  setStatusFilter,
  planFilter,
  setPlanFilter,
  filtersOpen,
  setFiltersOpen,
  pagedTenants,
  filteredTenants,
  pageSize,
  setPageSize,
  safePage,
  totalPages,
  setPage,
  valuationByTenant,
  openManager,
  onCreate,
}: any) {
  return <>
    <PageHeader
      eyebrow='GESTIÓN MULTIEMPRESA'
      title='Organizaciones'
      description='Administra cada firma, inmobiliaria o cliente desde un expediente corporativo independiente.'
      actions={<button type='button' className='platform-primary-button' onClick={onCreate}><Plus /> Nueva organización</button>}
    />
    <section className='platform-panel platform-organizations-panel'>
      <div className='platform-organizations-toolbar'>
        <div className='platform-org-heading'><Building2 /><div><h2>Portafolio de clientes</h2><span>Branding, miembros, dominios y licencias.</span></div></div>
        <div className='platform-toolbar-actions'>
          <div className='platform-search'><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder='Buscar organización…' /></div>
          <button type='button' className={`platform-filter-button ${filtersOpen || statusFilter !== 'all' || planFilter !== 'all' ? 'is-active' : ''}`} onClick={() => setFiltersOpen((value: boolean) => !value)}><SlidersHorizontal /> Filtros</button>
        </div>
      </div>

      {filtersOpen && <div className='platform-filter-panel'>
        <label><span>Estado</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value='all'>Todos</option><option value='active'>Activas</option><option value='suspended'>Suspendidas</option><option value='expired'>Expiradas</option></select></label>
        <label><span>Plan</span><select value={planFilter} onChange={(event) => setPlanFilter(event.target.value)}><option value='all'>Todos</option><option value='starter'>Starter</option><option value='professional'>Profesional</option><option value='enterprise'>Enterprise</option></select></label>
        <button type='button' onClick={() => { setStatusFilter('all'); setPlanFilter('all'); }}>Limpiar filtros</button>
      </div>}

      <div className='platform-org-table'>
        <div className='platform-org-header'><span>Organización</span><span>Estado</span><span>Plan</span><span>Dominio</span><span>Miembros</span><span>Avalúos</span><span>Acciones</span></div>
        {loading ? <div className='platform-loading'>Sincronizando organizaciones…</div> : pagedTenants.length ? pagedTenants.map((tenant: PlatformTenant) => <OrganizationRow key={tenant.id} tenant={tenant} valuationCount={valuationByTenant[tenant.id] || 0} onManage={openManager} />) : <div className='platform-empty'><Building2 /><h3>No hay organizaciones que coincidan.</h3><p>Crea una nueva organización o cambia la búsqueda/filtros.</p></div>}
      </div>

      <div className='platform-table-footer'>
        <span>Mostrando {pagedTenants.length} de {filteredTenants.length} organizaciones</span>
        <div>
          <select value={pageSize} onChange={(event) => setPageSize(Number(event.target.value))}><option value='5'>5 por página</option><option value='10'>10 por página</option><option value='25'>25 por página</option></select>
          <button type='button' disabled={safePage <= 1} onClick={() => setPage((value: number) => Math.max(1, value - 1))}><ChevronLeft /></button>
          <button type='button' className='is-page'>{safePage}</button>
          <span>de {totalPages}</span>
          <button type='button' disabled={safePage >= totalPages} onClick={() => setPage((value: number) => Math.min(totalPages, value + 1))}><ChevronRight /></button>
        </div>
      </div>
    </section>
  </>;
}

function UsersPage({ users }: { users: any[] }) {
  return <>
    <PageHeader eyebrow='IDENTIDADES Y ACCESO' title='Usuarios' description='Directorio central de cuentas registradas y disponibles para asignación a organizaciones.' />
    <section className='platform-panel'>
      <div className='platform-panel-heading'><div><p>DIRECTORIO</p><h2>{users.length} identidades registradas</h2></div><span><UsersRound /> Firebase Authentication</span></div>
      <div className='platform-user-directory'>
        {users.map((item: any) => <article key={item.id}>
          {item.photoURL ? <img src={item.photoURL} alt='' referrerPolicy='no-referrer' /> : <span>{String(item.displayName || item.email || 'U').slice(0, 1).toUpperCase()}</span>}
          <div><strong>{item.displayName || 'Usuario'}</strong><small>{item.email || 'Sin correo'}</small><em>ID: {item.id}</em></div>
          <span className='platform-user-ready'><i /> Registrado</span>
        </article>)}
        {!users.length && <div className='platform-empty'><UsersRound /><h3>Aún no hay usuarios registrados.</h3><p>Las cuentas aparecerán aquí después de su primer inicio de sesión.</p></div>}
      </div>
    </section>
  </>;
}

function LicensesPage({ tenants, activeLicenses, currentMonthByTenant, openManager }: any) {
  return <>
    <PageHeader eyebrow='CONTROL COMERCIAL' title='Licencias' description='Administra planes, límites de usuarios, capacidad mensual y módulos habilitados por organización.' />
    <div className='platform-license-summary'>
      <MetricCard icon={<KeyRound />} label='Licencias activas' value={formatCount(activeLicenses)} note={`de ${formatCount(tenants.length)} organizaciones`} detail='Estado en tiempo real' />
      <MetricCard icon={<Building2 />} label='Starter' value={formatCount(tenants.filter((tenant: PlatformTenant) => (tenant.plan || tenant.license?.plan) === 'starter').length)} note='Licencias iniciales' detail='Control comercial' />
      <MetricCard icon={<Sparkles />} label='Profesional' value={formatCount(tenants.filter((tenant: PlatformTenant) => (tenant.plan || tenant.license?.plan || 'professional') === 'professional').length)} note='Plan principal' detail='Operación multiusuario' />
      <MetricCard icon={<ShieldCheck />} label='Enterprise' value={formatCount(tenants.filter((tenant: PlatformTenant) => (tenant.plan || tenant.license?.plan) === 'enterprise').length)} note='Operación ampliada' detail='Escalabilidad corporativa' />
    </div>
    <section className='platform-panel'>
      <div className='platform-panel-heading'><div><p>PORTAFOLIO COMERCIAL</p><h2>Consumo y vigencia</h2></div><span><CircleDollarSign /> Gestión por tenant</span></div>
      <div className='platform-license-grid'>
        {tenants.map((tenant: PlatformTenant) => {
          const license = tenant.license || {};
          const limit = Math.max(1, Number(license.limits?.monthlyAvaluos || 200));
          const used = currentMonthByTenant[tenant.id] || 0;
          const expires = asDate(license.expiresAt);
          return <article className='platform-license-card' key={tenant.id}>
            <div><strong>{tenant.name}</strong><span className={`platform-status is-${tenant.status || 'active'}`}><i />{statusLabel[tenant.status || 'active']}</span></div>
            <p>{planLabel[tenant.plan || license.plan || 'professional']} · {tenant.membersCount || 0}/{license.limits?.maxUsers || 10} usuarios</p>
            <div className='platform-license-progress'><i style={{ width: `${Math.min(100, (used / limit) * 100)}%` }} /></div>
            <small>{used} de {limit} avalúos este mes{expires ? ` · vence ${expires.toLocaleDateString('es-NI')}` : ' · sin vencimiento'}</small>
            <button type='button' onClick={() => openManager(tenant, 'license')}>Administrar licencia <ChevronRight /></button>
          </article>;
        })}
        {!tenants.length && <div className='platform-empty'><KeyRound /><h3>No hay licencias registradas.</h3><p>Crea una organización para iniciar.</p></div>}
      </div>
    </section>
  </>;
}

function ReportsPage({ data, thisMonthAvaluos, activeTenants, exportReport }: any) {
  const houses = data.avaluos.filter((row: any) => String(row.type || row.tipo || '').toLowerCase().includes('casa')).length;
  const land = data.avaluos.length - houses;
  return <>
    <PageHeader
      eyebrow='INTELIGENCIA Y REPORTES'
      title='Reportes'
      description='Lectura ejecutiva del volumen de valoración y exportación del portafolio comercial.'
      actions={<button type='button' className='platform-primary-button' onClick={exportReport}><Download /> Exportar organizaciones CSV</button>}
    />
    <div className='platform-report-grid'>
      <article className='platform-report-hero'>
        <span>PRODUCCIÓN TOTAL</span>
        <strong>{formatCount(data.avaluos.length)}</strong>
        <p>avalúos registrados en toda la plataforma</p>
        <div><small>{formatCount(thisMonthAvaluos)} este mes</small><small>{formatCount(activeTenants)} organizaciones activas</small></div>
      </article>
      <article className='platform-report-card'><FileCheck2 /><div><span>Avalúos de terreno / otros</span><strong>{formatCount(land)}</strong><small>{data.avaluos.length ? Math.round((land / data.avaluos.length) * 100) : 0}% del histórico</small></div></article>
      <article className='platform-report-card'><Building2 /><div><span>Avalúos de vivienda</span><strong>{formatCount(houses)}</strong><small>{data.avaluos.length ? Math.round((houses / data.avaluos.length) * 100) : 0}% del histórico</small></div></article>
    </div>
    <section className='platform-panel'>
      <div className='platform-panel-heading'><div><p>EXPORTACIÓN</p><h2>Datos administrativos</h2><small>El reporte conserva organización, plan, estado, miembros y producción histórica.</small></div><span><Download /> CSV UTF-8</span></div>
      <div className='platform-report-export'>
        <div><ShieldCheck /><span><strong>Sin modificar Firestore</strong><small>La exportación se genera en el navegador usando el snapshot actual.</small></span></div>
        <button type='button' className='platform-secondary-button' onClick={exportReport}><Download /> Descargar reporte</button>
      </div>
    </section>
  </>;
}

function SystemPage({ error, data }: any) {
  return <>
    <PageHeader eyebrow='INFRAESTRUCTURA' title='Sistema' description='Estado de los servicios que sostienen autenticación, aislamiento multiempresa, datos y archivos.' />
    <section className='platform-panel'>
      <div className='platform-panel-heading'><div><p>ESTADO OPERATIVO</p><h2>Servicios principales</h2></div><span><Settings2 /> Plataforma central</span></div>
      <div className='platform-system-grid platform-system-grid-v2'>
        <article><ShieldCheck /><div><strong>Autorización multiempresa</strong><small>Miembros + userTenants activos</small></div><span>Operativo</span></article>
        <article><FileCheck2 /><div><strong>Persistencia de avalúos</strong><small>Firestore aislado por tenantId</small></div><span>{error ? 'Revisar' : 'Operativo'}</span></article>
        <article><Upload /><div><strong>Archivos y evidencia</strong><small>Firebase Storage por tenant</small></div><span>Configurado</span></article>
        <article><KeyRound /><div><strong>Enforcement de licencia</strong><small>Módulos, usuarios y avalúos mensuales</small></div><span>Activo</span></article>
      </div>
    </section>
    <section className='platform-panel'>
      <div className='platform-panel-heading'><div><p>HUELLA ACTUAL</p><h2>Inventario de plataforma</h2></div><span><Gauge /> Tiempo real</span></div>
      <div className='platform-system-stats'>
        <div><span>Organizaciones</span><strong>{formatCount(data.tenants.length)}</strong></div>
        <div><span>Avalúos</span><strong>{formatCount(data.avaluos.length)}</strong></div>
        <div><span>Usuarios</span><strong>{formatCount(data.users.length)}</strong></div>
        <div><span>Base de datos</span><strong>Firestore</strong></div>
      </div>
    </section>
  </>;
}

export default function PlatformAdminPage() {
  const { user } = useAuth();
  const location = useLocation();
  const [data, setData] = useState<PlatformDashboardSnapshot>({ tenants: [], avaluos: [], users: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [manageTenant, setManageTenant] = useState<PlatformTenant | null>(null);
  const [manageTab, setManageTab] = useState<ManageTab>('general');

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribePlatformDashboard((snapshot) => {
      setData(snapshot);
      setLoading(false);
      setError('');
    }, (cause) => {
      console.error(cause);
      setError('No fue posible cargar la administración central. Verifica las reglas de Firestore para Platform Admin.');
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const valuationByTenant = useMemo(() => data.avaluos.reduce((acc: Record<string, number>, row: any) => {
    const tenantId = row.tenantId || 'sin-tenant';
    acc[tenantId] = (acc[tenantId] || 0) + 1;
    return acc;
  }, {}), [data.avaluos]);

  const currentMonthByTenant = useMemo(() => {
    const now = new Date();
    return data.avaluos.reduce((acc: Record<string, number>, row: any) => {
      const date = recordDate(row);
      if (!date || date.getFullYear() !== now.getFullYear() || date.getMonth() !== now.getMonth()) return acc;
      const tenantId = row.tenantId || 'sin-tenant';
      acc[tenantId] = (acc[tenantId] || 0) + 1;
      return acc;
    }, {});
  }, [data.avaluos]);

  const monthlySeries = useMemo(() => {
    const now = new Date();
    const months = Array.from({ length: 12 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (11 - index), 1);
      return { year: date.getFullYear(), month: date.getMonth(), count: 0 };
    });
    data.avaluos.forEach((row: any) => {
      const date = recordDate(row);
      if (!date) return;
      const bucket = months.find((item) => item.year === date.getFullYear() && item.month === date.getMonth());
      if (bucket) bucket.count += 1;
    });
    const max = Math.max(1, ...months.map((item) => item.count));
    return months.map((item) => ({ ...item, height: item.count ? Math.max(14, Math.round((item.count / max) * 100)) : 5 }));
  }, [data.avaluos]);

  const activeTenants = data.tenants.filter((tenant) => tenant.status === 'active').length;
  const activeLicenses = data.tenants.filter((tenant) => {
    const expiresAt = asDate(tenant.license?.expiresAt);
    return tenant.status === 'active' && tenant.license?.status !== 'suspended' && tenant.license?.status !== 'expired' && (!expiresAt || expiresAt.getTime() >= Date.now());
  }).length;
  const thisMonthAvaluos = Object.values(currentMonthByTenant).reduce((sum, value) => sum + value, 0);

  const filteredTenants = useMemo(() => data.tenants.filter((tenant) => {
    const haystack = `${tenant.name || ''} ${tenant.slug || ''} ${tenant.domain || ''} ${tenant.website || ''}`.toLowerCase();
    const matchesQuery = haystack.includes(query.trim().toLowerCase());
    const matchesStatus = statusFilter === 'all' || tenant.status === statusFilter;
    const tenantPlan = tenant.plan || tenant.license?.plan || 'professional';
    const matchesPlan = planFilter === 'all' || tenantPlan === planFilter;
    return matchesQuery && matchesStatus && matchesPlan;
  }), [data.tenants, query, statusFilter, planFilter]);

  useEffect(() => setPage(1), [query, statusFilter, planFilter, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredTenants.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pagedTenants = filteredTenants.slice((safePage - 1) * pageSize, safePage * pageSize);

  const createTenant = async (event: FormEvent) => {
    event.preventDefault();
    if (!user?.uid || saving) return;
    setSaving(true);
    setError('');
    try {
      await createPlatformTenant(form, user.uid);
      setForm(initialForm);
      setModalOpen(false);
    } catch (cause) {
      console.error(cause);
      setError(cause instanceof Error ? cause.message : 'No fue posible crear la organización.');
    } finally {
      setSaving(false);
    }
  };

  const openManager = (tenant: PlatformTenant, tab: ManageTab) => {
    setManageTenant(tenant);
    setManageTab(tab);
  };

  const exportReport = () => {
    const headers = ['Organización', 'Slug', 'Estado', 'Plan', 'Dominio', 'Miembros', 'Avalúos históricos', 'Avalúos este mes'];
    const rows = data.tenants.map((tenant) => [
      tenant.name || tenant.slug,
      tenant.slug,
      statusLabel[tenant.status] || tenant.status,
      planLabel[tenant.plan || tenant.license?.plan || 'professional'],
      tenant.domain || '',
      tenant.membersCount || 0,
      valuationByTenant[tenant.id] || 0,
      currentMonthByTenant[tenant.id] || 0,
    ]);
    const csv = [headers, ...rows].map((row) => row.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `avaluos-platform-organizaciones-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const routeName = location.pathname.includes('/organizations') ? 'Organizaciones'
    : location.pathname.includes('/users') ? 'Usuarios'
      : location.pathname.includes('/licenses') ? 'Licencias'
        : location.pathname.includes('/reports') ? 'Reportes'
          : location.pathname.includes('/system') ? 'Sistema'
            : 'Dashboard';

  return <div className='platform-admin-shell platform-admin-v2'>
    <aside className='platform-sidebar'>
      <PlatformBrand />
      <div className='platform-central-card'><ShieldCheck /><span><strong>Control Center</strong><small>Root administration</small></span></div>

      <nav aria-label='Administración central'>
        <small className='platform-nav-label'>OPERACIÓN</small>
        <NavLink to='/platform-admin/dashboard' className={({ isActive }) => isActive ? 'is-active' : ''}><LayoutDashboard /><span>Dashboard</span></NavLink>
        <NavLink to='/platform-admin/organizations' className={({ isActive }) => isActive ? 'is-active' : ''}><Building2 /><span>Organizaciones</span></NavLink>
        <NavLink to='/platform-admin/users' className={({ isActive }) => isActive ? 'is-active' : ''}><UsersRound /><span>Usuarios</span></NavLink>
        <NavLink to='/platform-admin/licenses' className={({ isActive }) => isActive ? 'is-active' : ''}><CircleDollarSign /><span>Licencias</span></NavLink>
        <small className='platform-nav-label platform-nav-label-second'>INTELIGENCIA</small>
        <NavLink to='/platform-admin/reports' className={({ isActive }) => isActive ? 'is-active' : ''}><Download /><span>Reportes</span></NavLink>
        <NavLink to='/platform-admin/system' className={({ isActive }) => isActive ? 'is-active' : ''}><Settings2 /><span>Sistema</span></NavLink>
      </nav>

      <div className='platform-sidebar-bottom'>
        <Link to='/avaluos/terrenos'><ChevronLeft /> Volver a avalúos</Link>
        <div className='platform-profile-card'>
          {user?.photoURL ? <img src={user.photoURL} alt='' referrerPolicy='no-referrer' /> : <div className='platform-avatar'>NG</div>}
          <span><strong>{user?.displayName || 'Root Admin'}</strong><small>Superadministrador</small></span>
        </div>
      </div>
    </aside>

    <main className='platform-main'>
      <header className='platform-topbar'>
        <div><span>AVALNIC / Administración</span><strong>{routeName}</strong></div>
        <div className='platform-topbar-actions'>
          <div className='platform-live'><i /> {error ? 'Revisar conexión' : loading ? 'Sincronizando' : 'Sistema operativo'}</div>
          <button type='button' className='platform-topbar-create' onClick={() => setModalOpen(true)}><Plus /> Nueva organización</button>
          {user?.photoURL ? <img src={user.photoURL} alt='' referrerPolicy='no-referrer' /> : <div className='platform-avatar'>NG</div>}
        </div>
      </header>

      <section className='platform-content'>
        {error && <div className='platform-error'>{error}</div>}
        <Routes>
          <Route index element={<Navigate to='dashboard' replace />} />
          <Route path='dashboard' element={<DashboardPage data={data} loading={loading} activeTenants={activeTenants} activeLicenses={activeLicenses} thisMonthAvaluos={thisMonthAvaluos} monthlySeries={monthlySeries} error={error} onCreate={() => setModalOpen(true)} />} />
          <Route path='organizations' element={<OrganizationsPage data={data} loading={loading} query={query} setQuery={setQuery} statusFilter={statusFilter} setStatusFilter={setStatusFilter} planFilter={planFilter} setPlanFilter={setPlanFilter} filtersOpen={filtersOpen} setFiltersOpen={setFiltersOpen} pagedTenants={pagedTenants} filteredTenants={filteredTenants} pageSize={pageSize} setPageSize={setPageSize} safePage={safePage} totalPages={totalPages} setPage={setPage} valuationByTenant={valuationByTenant} openManager={openManager} onCreate={() => setModalOpen(true)} />} />
          <Route path='users' element={<UsersPage users={data.users} />} />
          <Route path='licenses' element={<LicensesPage tenants={data.tenants} activeLicenses={activeLicenses} currentMonthByTenant={currentMonthByTenant} openManager={openManager} />} />
          <Route path='reports' element={<ReportsPage data={data} thisMonthAvaluos={thisMonthAvaluos} activeTenants={activeTenants} exportReport={exportReport} />} />
          <Route path='system' element={<SystemPage error={error} data={data} />} />
          <Route path='*' element={<Navigate to='/platform-admin/dashboard' replace />} />
        </Routes>
      </section>
    </main>

    {modalOpen && <div className='platform-modal-backdrop' role='presentation' onMouseDown={() => !saving && setModalOpen(false)}>
      <aside className='platform-modal' role='dialog' aria-modal='true' aria-label='Crear organización' onMouseDown={(event) => event.stopPropagation()}>
        <header>
          <div><p>NUEVO CLIENTE</p><h2>Nueva organización</h2><span>Crea un espacio independiente con identidad, dominio y licencia propios.</span></div>
          <button type='button' onClick={() => setModalOpen(false)} disabled={saving}><X /></button>
        </header>

        <form onSubmit={createTenant}>
          <section className='platform-form-card'>
            <div className='platform-form-card-heading'><strong>Identidad corporativa</strong><small>Datos base de la organización.</small></div>
            <label><span>Nombre de la organización *</span><input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder='Ej. Firma Valuadora' /></label>
            <div className='platform-form-grid'>
              <label><span>Nombre corto</span><input value={form.shortName} onChange={(event) => setForm({ ...form, shortName: event.target.value })} placeholder='FV' /></label>
              <label><span>Plan</span><select value={form.plan} onChange={(event) => setForm({ ...form, plan: event.target.value })}><option value='starter'>Starter</option><option value='professional'>Profesional</option><option value='enterprise'>Enterprise</option></select></label>
            </div>
            <label><span>Color de marca</span><div className='platform-color-input'><input type='color' value={form.secondaryColor} onChange={(event) => setForm({ ...form, secondaryColor: event.target.value })} /><input value={form.secondaryColor} onChange={(event) => setForm({ ...form, secondaryColor: event.target.value })} /></div></label>
          </section>

          <section className='platform-form-card'>
            <div className='platform-form-card-heading'><strong>Contacto y presencia digital</strong><small>Información institucional y dominio del portal.</small></div>
            <div className='platform-form-grid'>
              <label><span>Correo electrónico</span><input type='email' value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder='contacto@organizacion.com' /></label>
              <label><span>Teléfono</span><input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder='+505 0000 0000' /></label>
            </div>
            <label><span>Identificador / slug *</span><input required value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} placeholder='firma-valuadora' /></label>
            <label><span>Dominio personalizado</span><input value={form.domain} onChange={(event) => setForm({ ...form, domain: event.target.value })} placeholder='avaluos.empresa.com' /></label>
            <label><span>Sitio web</span><input value={form.website} onChange={(event) => setForm({ ...form, website: event.target.value })} placeholder='https://empresa.com' /></label>
          </section>

          <footer className='platform-drawer-footer'>
            <button type='button' onClick={() => setModalOpen(false)} disabled={saving}>Cancelar</button>
            <button type='submit' className='platform-primary-button' disabled={saving}>{saving ? 'Creando…' : <><Check /> Crear organización</>}</button>
          </footer>
        </form>
      </aside>
    </div>}

    {manageTenant && <TenantManagementDrawer tenant={manageTenant} users={data.users} initialTab={manageTab} onClose={() => setManageTenant(null)} />}
  </div>;
}
