import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowUpRight,
  Building2,
  ChevronRight,
  CircleDollarSign,
  FileCheck2,
  Gauge,
  LayoutDashboard,
  MoreHorizontal,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  UsersRound,
  X,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import {
  createPlatformTenant,
  PlatformDashboardSnapshot,
  PlatformTenant,
  subscribePlatformDashboard,
  updatePlatformTenantStatus,
} from './platformAdmin.service';

const initialForm = {
  name: '',
  slug: '',
  shortName: '',
  plan: 'professional',
  status: 'active',
  primaryColor: '#0b1728',
  secondaryColor: '#d6b75d',
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
  professional: 'Professional',
  enterprise: 'Enterprise',
};

function MetricCard({ icon, label, value, note, accent = false }: any) {
  return <article className={`platform-metric ${accent ? 'is-accent' : ''}`}>
    <div className='platform-metric-icon'>{icon}</div>
    <div className='platform-metric-copy'>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </div>
    <ArrowUpRight className='platform-metric-arrow' />
  </article>;
}

function TenantCard({ tenant, valuationCount, busy, onToggle }: {
  tenant: PlatformTenant;
  valuationCount: number;
  busy: boolean;
  onToggle: (tenant: PlatformTenant) => void;
}) {
  const branding = tenant.branding || {};
  const initials = String(branding.shortName || tenant.name || tenant.slug || 'AP')
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 3)
    .toUpperCase();

  return <article className='platform-tenant-card'>
    <div className='platform-tenant-top'>
      <div className='platform-tenant-brand' style={{ '--tenant-accent': branding.secondaryColor || '#d6b75d' } as any}>
        <span>{initials}</span>
      </div>
      <div className='platform-tenant-title'>
        <div>
          <h3>{tenant.name || tenant.slug}</h3>
          <p>{tenant.domain || tenant.website || `tenant/${tenant.slug}`}</p>
        </div>
        <span className={`platform-status is-${tenant.status || 'active'}`}><i />{statusLabel[tenant.status || 'active'] || tenant.status}</span>
      </div>
      <button className='platform-icon-button' type='button' aria-label='Más opciones'><MoreHorizontal /></button>
    </div>

    <div className='platform-tenant-stats'>
      <div><span>Avalúos</span><strong>{valuationCount}</strong></div>
      <div><span>Plan</span><strong>{planLabel[tenant.plan || tenant.license?.plan || 'professional'] || tenant.plan || 'Professional'}</strong></div>
      <div><span>Usuarios</span><strong>{tenant.membersCount ?? '—'}</strong></div>
    </div>

    <div className='platform-tenant-footer'>
      <div className='platform-color-pair'>
        <i style={{ background: branding.primaryColor || '#0b1728' }} />
        <i style={{ background: branding.secondaryColor || '#d6b75d' }} />
        <span>{tenant.slug}</span>
      </div>
      <button type='button' className='platform-text-action' disabled={busy} onClick={() => onToggle(tenant)}>
        {busy ? 'Actualizando…' : tenant.status === 'active' ? 'Suspender' : 'Activar'} <ChevronRight />
      </button>
    </div>
  </article>;
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
  const [busyTenant, setBusyTenant] = useState('');

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

  const toggleTenant = async (tenant: PlatformTenant) => {
    setBusyTenant(tenant.id);
    setError('');
    try {
      await updatePlatformTenantStatus(tenant.id, tenant.status === 'active' ? 'suspended' : 'active');
    } catch (cause) {
      console.error(cause);
      setError(cause instanceof Error ? cause.message : 'No fue posible actualizar la organización.');
    } finally {
      setBusyTenant('');
    }
  };

  return <div className='platform-admin-shell'>
    <aside className='platform-sidebar'>
      <div className='platform-sidebar-brand'>
        <span><ShieldCheck /></span>
        <div><strong>Avalúos</strong><small>Platform OS</small></div>
      </div>
      <nav>
        <a className='is-active' href='#overview'><LayoutDashboard /> <span>Overview</span></a>
        <a href='#organizations'><Building2 /> <span>Organizaciones</span></a>
        <a href='#users'><UsersRound /> <span>Usuarios</span></a>
        <a href='#licenses'><CircleDollarSign /> <span>Licencias</span></a>
        <a href='#system'><Settings2 /> <span>Sistema</span></a>
      </nav>
      <div className='platform-sidebar-bottom'>
        <div className='platform-security-chip'><ShieldCheck /><span><strong>Root Admin</strong><small>Acceso central protegido</small></span></div>
        <Link to='/avaluos/terrenos'>Volver a avalúos <ChevronRight /></Link>
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
            <p><Sparkles /> CONTROL MULTIEMPRESA</p>
            <h1>Una plataforma.<br /><em>Múltiples organizaciones.</em></h1>
            <span>Administra clientes, actividad, licencias y crecimiento desde un entorno central diseñado para escalar.</span>
          </div>
          <button type='button' className='platform-primary-button' onClick={() => setModalOpen(true)}><Plus /> Nueva organización</button>
        </div>

        {error && <div className='platform-error'>{error}</div>}

        <div className='platform-metric-grid'>
          <MetricCard icon={<Building2 />} label='Organizaciones' value={loading ? '—' : data.tenants.length} note={`${activeTenants} activas actualmente`} accent />
          <MetricCard icon={<FileCheck2 />} label='Avalúos procesados' value={loading ? '—' : data.avaluos.length} note='Histórico de toda la plataforma' />
          <MetricCard icon={<UsersRound />} label='Usuarios registrados' value={loading ? '—' : data.users.length} note='Identidades conectadas' />
          <MetricCard icon={<Gauge />} label='Disponibilidad' value='100%' note='Firebase + Vercel operativos' />
        </div>

        <section className='platform-panel platform-activity-panel'>
          <div className='platform-panel-heading'>
            <div><p>OPERACIÓN GLOBAL</p><h2>Actividad de la plataforma</h2></div>
            <span><Activity /> Tiempo real</span>
          </div>
          <div className='platform-activity-grid'>
            <div className='platform-activity-chart'>
              <div className='platform-chart-copy'><strong>{data.avaluos.length}</strong><span>avalúos registrados</span></div>
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

        <section className='platform-panel' id='organizations'>
          <div className='platform-panel-heading platform-organizations-heading'>
            <div><p>PORTAFOLIO DE CLIENTES</p><h2>Organizaciones</h2><small>Cada espacio mantiene sus usuarios, avalúos, branding y licencia de forma independiente.</small></div>
            <div className='platform-search'><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder='Buscar organización…' /></div>
          </div>

          {loading ? <div className='platform-loading'>Sincronizando organizaciones…</div> : filteredTenants.length ? <div className='platform-tenant-grid'>
            {filteredTenants.map((tenant) => <TenantCard key={tenant.id} tenant={tenant} valuationCount={valuationByTenant[tenant.id] || 0} busy={busyTenant === tenant.id} onToggle={toggleTenant} />)}
          </div> : <div className='platform-empty'>
            <span><Building2 /></span><h3>No hay organizaciones que coincidan.</h3><p>Crea el siguiente tenant o cambia la búsqueda.</p>
          </div>}
        </section>
      </section>
    </main>

    {modalOpen && <div className='platform-modal-backdrop' role='presentation' onMouseDown={() => !saving && setModalOpen(false)}>
      <section className='platform-modal' role='dialog' aria-modal='true' aria-label='Crear organización' onMouseDown={(event) => event.stopPropagation()}>
        <header>
          <div><p>NUEVO TENANT</p><h2>Crear organización</h2><span>Configura identidad, licencia y presencia digital desde el primer día.</span></div>
          <button type='button' onClick={() => setModalOpen(false)} disabled={saving}><X /></button>
        </header>
        <form onSubmit={createTenant}>
          <div className='platform-form-section'>
            <div className='platform-form-title'><span>01</span><div><strong>Identidad</strong><small>Datos principales de la organización</small></div></div>
            <div className='platform-form-grid'>
              <label><span>Nombre comercial *</span><input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder='Diamantes Realty Group' /></label>
              <label><span>Identificador / slug *</span><input required value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} placeholder='diamantes' /></label>
              <label><span>Nombre corto</span><input value={form.shortName} onChange={(event) => setForm({ ...form, shortName: event.target.value })} placeholder='DRG' /></label>
              <label><span>Plan</span><select value={form.plan} onChange={(event) => setForm({ ...form, plan: event.target.value })}><option value='starter'>Starter</option><option value='professional'>Professional</option><option value='enterprise'>Enterprise</option></select></label>
            </div>
          </div>

          <div className='platform-form-section'>
            <div className='platform-form-title'><span>02</span><div><strong>Branding y contacto</strong><small>Base visual para interfaz e informes PDF</small></div></div>
            <div className='platform-form-grid'>
              <label><span>Color principal</span><div className='platform-color-input'><input type='color' value={form.primaryColor} onChange={(event) => setForm({ ...form, primaryColor: event.target.value })} /><input value={form.primaryColor} onChange={(event) => setForm({ ...form, primaryColor: event.target.value })} /></div></label>
              <label><span>Color secundario</span><div className='platform-color-input'><input type='color' value={form.secondaryColor} onChange={(event) => setForm({ ...form, secondaryColor: event.target.value })} /><input value={form.secondaryColor} onChange={(event) => setForm({ ...form, secondaryColor: event.target.value })} /></div></label>
              <label><span>Sitio web</span><input value={form.website} onChange={(event) => setForm({ ...form, website: event.target.value })} placeholder='https://...' /></label>
              <label><span>Dominio de avalúos</span><input value={form.domain} onChange={(event) => setForm({ ...form, domain: event.target.value })} placeholder='avaluos.empresa.com' /></label>
              <label><span>Email institucional</span><input type='email' value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder='contacto@empresa.com' /></label>
              <label><span>Teléfono</span><input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder='+505 ...' /></label>
            </div>
          </div>

          <footer>
            <div><ShieldCheck /><span><strong>Aislamiento automático</strong><small>El tenant se crea separado del resto de organizaciones.</small></span></div>
            <div className='platform-modal-actions'><button type='button' onClick={() => setModalOpen(false)} disabled={saving}>Cancelar</button><button type='submit' className='platform-primary-button' disabled={saving}>{saving ? 'Creando…' : <><Plus /> Crear organización</>}</button></div>
          </footer>
        </form>
      </section>
    </div>}
  </div>;
}
