import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
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
  Grid2X2,
  KeyRound,
  LayoutDashboard,
  List,
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
  primaryColor: '#ffffff',
  secondaryColor: '#d4af37',
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

function MetricCard({ icon, label, value, note, trend }: any) {
  return <article className='platform-metric'>
    <div className='platform-metric-top'>
      <span className='platform-metric-icon'>{icon}</span>
      <span className='platform-metric-label'>{label}</span>
    </div>
    <strong>{value}</strong>
    <small>{note}</small>
    <div className='platform-trend'><i>↑</i> {trend}</div>
  </article>;
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
  const accent = branding.secondaryColor || '#d4af37';

  return <div className='platform-org-row'>
    <div className='platform-org-name'>
      <div className='platform-org-logo' style={{ '--tenant-accent': accent } as any}>{initials}</div>
      <div><strong>{tenant.name || tenant.slug}</strong><small>{tenant.website || tenant.domain || tenant.slug}</small></div>
    </div>
    <div><span className={`platform-status is-${tenant.status || 'active'}`}><i />{statusLabel[tenant.status || 'active'] || tenant.status}</span></div>
    <div className='platform-plan'><Sparkles /> {planLabel[tenant.plan || tenant.license?.plan || 'professional'] || 'Profesional'}</div>
    <div className='platform-domain'>{tenant.domain || 'Sin dominio'}</div>
    <div className='platform-members'><UsersRound /> {tenant.membersCount ?? '—'}</div>
    <div className='platform-valuations'>{formatCount(valuationCount)}</div>
    <div className='platform-row-actions'>
      <button type='button' onClick={() => onManage(tenant, 'general')} aria-label='Editar organización'><Pencil /></button>
      <button type='button' onClick={() => onManage(tenant, 'members')} aria-label='Gestionar usuarios'><UsersRound /></button>
      <button type='button' className='is-gold' onClick={() => onManage(tenant, 'license')} aria-label='Gestionar licencia'><KeyRound /></button>
    </div>
  </div>;
}

export default function PlatformAdminPage() {
  const { user } = useAuth();
  const [data, setData] = useState<PlatformDashboardSnapshot>({ tenants: [], avaluos: [], users: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
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

  const activeTenants = data.tenants.filter((tenant) => tenant.status === 'active').length;
  const filteredTenants = data.tenants.filter((tenant) => {
    const haystack = `${tenant.name || ''} ${tenant.slug || ''} ${tenant.domain || ''} ${tenant.website || ''}`.toLowerCase();
    return haystack.includes(query.trim().toLowerCase());
  });

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

  return <div className='platform-admin-shell'>
    <aside className='platform-sidebar'>
      <div className='platform-sidebar-brand'>
        <span className='platform-brand-mark'>A</span>
        <div><strong>Avalúos Platform</strong><small>Administration Suite</small></div>
      </div>

      <div className='platform-central-card'><ShieldCheck /><span><strong>Administración central</strong><small>Platform Control Center</small></span><ChevronRight /></div>

      <nav>
        <a className='is-active' href='#overview'><LayoutDashboard /> <span>Overview</span></a>
        <a href='#organizations'><Building2 /> <span>Organizaciones</span></a>
        <a href='#users'><UsersRound /> <span>Usuarios</span></a>
        <a href='#licenses'><CircleDollarSign /> <span>Licencias</span></a>
        <a href='#system'><Settings2 /> <span>Sistema</span></a>
      </nav>

      <div className='platform-sidebar-bottom'>
        <Link to='/avaluos/terrenos'><ChevronLeft /> Volver a avalúos</Link>
        <div className='platform-profile-card'>
          {user?.photoURL ? <img src={user.photoURL} alt='' referrerPolicy='no-referrer' /> : <div className='platform-avatar'>NG</div>}
          <span><strong>Root Admin</strong><small>Superadministrador</small></span>
          <ChevronRight />
        </div>
      </div>
    </aside>

    <main className='platform-main'>
      <header className='platform-topbar'>
        <div><span>Administración central</span><strong>Platform Control Center</strong></div>
        <div className='platform-topbar-actions'>
          <div className='platform-live'><i /> Sistema operativo</div>
          {user?.photoURL ? <img src={user.photoURL} alt='' referrerPolicy='no-referrer' /> : <div className='platform-avatar'>NG</div>}
        </div>
      </header>

      <section className='platform-content' id='overview'>
        <div className='platform-hero'>
          <div>
            <p>CONTROL MULTIEMPRESA</p>
            <h1>Una plataforma.<br /><em>Múltiples organizaciones.</em></h1>
            <span>Administra clientes, actividad, licencias y crecimiento desde un entorno central diseñado para escalar.</span>
          </div>
          <div className='platform-hero-actions'>
            <button type='button' className='platform-primary-button' onClick={() => setModalOpen(true)}><Plus /> Nueva organización</button>
            <button type='button' className='platform-secondary-button'><Download /> Exportar reporte</button>
          </div>
        </div>

        {error && <div className='platform-error'>{error}</div>}

        <div className='platform-metric-grid'>
          <MetricCard icon={<Building2 />} label='Organizaciones' value={loading ? '—' : formatCount(data.tenants.length)} note={`${activeTenants} activas actualmente`} trend='8% vs. mes anterior' />
          <MetricCard icon={<FileCheck2 />} label='Avalúos procesados' value={loading ? '—' : formatCount(data.avaluos.length)} note='Histórico de toda la plataforma' trend='15% vs. mes anterior' />
          <MetricCard icon={<UsersRound />} label='Usuarios registrados' value={loading ? '—' : formatCount(data.users.length)} note='Identidades conectadas' trend='12% vs. mes anterior' />
          <MetricCard icon={<Gauge />} label='Disponibilidad' value='99.98%' note='Infraestructura operativa' trend='0.02% vs. mes anterior' />
        </div>

        <section className='platform-panel platform-activity-panel'>
          <div className='platform-panel-heading'>
            <div><p>OPERACIÓN GLOBAL</p><h2>Actividad de la plataforma</h2></div>
            <span><Activity /> Tiempo real</span>
          </div>
          <div className='platform-activity-grid'>
            <div className='platform-activity-chart'>
              <div className='platform-chart-copy'><strong>{formatCount(data.avaluos.length)}</strong><span>avalúos registrados</span></div>
              <div className='platform-bars' aria-hidden='true'>
                {[34, 48, 43, 62, 56, 79, 68, 88, 74, 92, 82, 100].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}
              </div>
            </div>
            <div className='platform-health'>
              <div><span>Tenants activos</span><strong>{activeTenants}/{data.tenants.length || 0}</strong><i style={{ width: `${data.tenants.length ? (activeTenants / data.tenants.length) * 100 : 0}%` }} /></div>
              <div><span>Persistencia</span><strong>Firestore</strong><i style={{ width: '100%' }} /></div>
              <div><span>Archivos y evidencia</span><strong>Storage</strong><i style={{ width: '100%' }} /></div>
            </div>
          </div>
        </section>

        <section className='platform-panel platform-organizations-panel' id='organizations'>
          <div className='platform-organizations-toolbar'>
            <div className='platform-org-heading'><Building2 /><div><h2>Organizaciones</h2><span>Gestión central de clientes, miembros, branding y licencias.</span></div></div>
            <div className='platform-toolbar-actions'>
              <div className='platform-search'><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder='Buscar organización…' /></div>
              <button type='button' className='platform-filter-button'><SlidersHorizontal /> Filtros</button>
              <div className='platform-view-toggle'><button className='is-active' type='button'><Grid2X2 /></button><button type='button'><List /></button></div>
            </div>
          </div>

          <div className='platform-org-table'>
            <div className='platform-org-header'><span>Organización</span><span>Estado</span><span>Plan</span><span>Dominio</span><span>Miembros</span><span>Avalúos</span><span>Acciones</span></div>
            {loading ? <div className='platform-loading'>Sincronizando organizaciones…</div> : filteredTenants.length ? filteredTenants.map((tenant) => <OrganizationRow key={tenant.id} tenant={tenant} valuationCount={valuationByTenant[tenant.id] || 0} onManage={openManager} />) : <div className='platform-empty'><Building2 /><h3>No hay organizaciones que coincidan.</h3><p>Crea una nueva organización o cambia la búsqueda.</p></div>}
          </div>

          <div className='platform-table-footer'><span>Mostrando {filteredTenants.length} de {data.tenants.length} organizaciones</span><div><button type='button'>10 por página <ChevronRight /></button><button type='button' className='is-page'>1</button><button type='button'>2</button><button type='button'><ChevronRight /></button></div></div>
        </section>

        <section className='platform-panel platform-functional-summary' id='users'>
          <div className='platform-panel-heading'><div><p>USUARIOS</p><h2>Identidades registradas</h2><small>Las cuentas aparecen aquí desde su primer inicio de sesión y luego pueden asignarse a cualquier organización.</small></div><span><UsersRound /> {data.users.length} registradas</span></div>
          <div className='platform-user-preview-grid'>
            {data.users.slice(0, 6).map((item: any) => <div key={item.id} className='platform-user-preview'>{item.photoURL ? <img src={item.photoURL} alt='' referrerPolicy='no-referrer' /> : <span>{String(item.displayName || item.email || 'U').slice(0, 1)}</span>}<div><strong>{item.displayName || 'Usuario'}</strong><small>{item.email}</small></div></div>)}
            {!data.users.length && <p>Todavía no hay identidades registradas.</p>}
          </div>
        </section>

        <section className='platform-panel platform-functional-summary' id='licenses'>
          <div className='platform-panel-heading'><div><p>LICENCIAS</p><h2>Control comercial por organización</h2><small>Abre el icono de llave de cualquier organización para configurar plan, vencimiento, límites y módulos.</small></div><span><KeyRound /> Gestión activa</span></div>
        </section>
      </section>
    </main>

    {modalOpen && <div className='platform-modal-backdrop' role='presentation' onMouseDown={() => !saving && setModalOpen(false)}>
      <aside className='platform-modal' role='dialog' aria-modal='true' aria-label='Crear organización' onMouseDown={(event) => event.stopPropagation()}>
        <header>
          <div><h2>Nueva organización</h2><span>Crea una nueva organización en la plataforma</span></div>
          <button type='button' onClick={() => setModalOpen(false)} disabled={saving}><X /></button>
        </header>

        <form onSubmit={createTenant}>
          <section className='platform-form-card'>
            <div className='platform-form-card-heading'><strong>Branding</strong><small>Define la identidad visual de la organización.</small></div>
            <label><span>Nombre de la organización *</span><input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder='Ej. Mi Inmobiliaria' /></label>
            <div className='platform-upload-block'><span>Logo</span><div><div className='platform-upload-box'><Upload /></div><p><strong>Subir logo</strong><small>La carga directa se conectará en la siguiente fase.</small></p></div></div>
            <label><span>Color primario</span><div className='platform-color-input'><input type='color' value={form.secondaryColor} onChange={(event) => setForm({ ...form, secondaryColor: event.target.value })} /><input value={form.secondaryColor} onChange={(event) => setForm({ ...form, secondaryColor: event.target.value })} /></div></label>
          </section>

          <section className='platform-form-card'>
            <div className='platform-form-card-heading'><strong>Contacto</strong><small>Información de contacto principal.</small></div>
            <div className='platform-form-grid'>
              <label><span>Correo electrónico</span><input type='email' value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder='contacto@organizacion.com' /></label>
              <label><span>Teléfono</span><input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder='+505 0000 0000' /></label>
            </div>
          </section>

          <section className='platform-form-card'>
            <div className='platform-form-card-heading'><strong>Dominio</strong><small>Subdominio único para la organización.</small></div>
            <label><span>Identificador / slug *</span><input required value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} placeholder='mi-organizacion' /></label>
            <label><span>Dominio personalizado</span><input value={form.domain} onChange={(event) => setForm({ ...form, domain: event.target.value })} placeholder='avaluos.miempresa.com' /></label>
            <label><span>Sitio web</span><input value={form.website} onChange={(event) => setForm({ ...form, website: event.target.value })} placeholder='https://miempresa.com' /></label>
          </section>

          <section className='platform-form-card'>
            <div className='platform-form-card-heading'><strong>Plan</strong><small>Selecciona el plan inicial para la organización.</small></div>
            <div className='platform-form-grid'>
              <label><span>Plan</span><select value={form.plan} onChange={(event) => setForm({ ...form, plan: event.target.value })}><option value='starter'>Starter</option><option value='professional'>Professional</option><option value='enterprise'>Enterprise</option></select></label>
              <label><span>Nombre corto</span><input value={form.shortName} onChange={(event) => setForm({ ...form, shortName: event.target.value })} placeholder='DRG' /></label>
            </div>
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
