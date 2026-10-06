import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import {
  BadgeCheck,
  Building2,
  Check,
  ImagePlus,
  KeyRound,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
  UserRoundCog,
  UsersRound,
  X,
} from 'lucide-react';
import {
  addPlatformTenantMember,
  PlatformAccessGrant,
  PlatformMember,
  PlatformTenant,
  preauthorizeTenantAccess,
  removePlatformTenantMember,
  revokeTenantAccess,
  subscribeTenantAccessGrants,
  subscribeTenantMembers,
  updatePlatformTenantLicense,
  updatePlatformTenantMember,
  updatePlatformTenantProfile,
} from './platformAdmin.service';
import { uploadTenantBrandingLogo } from './tenantBrandingStorage.service';

type ManageTab = 'general' | 'members' | 'license';

type Props = {
  tenant: PlatformTenant;
  users: any[];
  initialTab?: ManageTab;
  onClose: () => void;
};

const roleLabel: Record<string, string> = {
  owner: 'Propietario',
  admin: 'Administrador',
  valuer: 'Evaluador',
  agent: 'Agente',
  viewer: 'Consulta',
};

function dateFromTimestamp(value: any) {
  if (!value) return '';
  try {
    const date = typeof value?.toDate === 'function' ? value.toDate() : new Date(value);
    return date.toISOString().slice(0, 10);
  } catch {
    return '';
  }
}

export default function TenantManagementDrawer({ tenant, users, initialTab = 'general', onClose }: Props) {
  const branding = tenant.branding || {};
  const license = tenant.license || {};
  const [tab, setTab] = useState<ManageTab>(initialTab);
  const [members, setMembers] = useState<PlatformMember[]>([]);
  const [accessGrants, setAccessGrants] = useState<PlatformAccessGrant[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [accessLoading, setAccessLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [accessEmail, setAccessEmail] = useState('');
  const [newRole, setNewRole] = useState<PlatformMember['role']>('agent');
  const [profile, setProfile] = useState({
    name: tenant.name || '',
    shortName: branding.shortName || '',
    website: tenant.website || branding.website || '',
    domain: tenant.domain || '',
    email: tenant.email || branding.email || '',
    phone: tenant.phone || branding.phone || '',
    primaryColor: branding.primaryColor || '#ffffff',
    secondaryColor: branding.secondaryColor || '#d4af37',
    logoUrl: branding.logoUrl || '',
    logoStoragePath: branding.logoStoragePath || '',
    footerText: branding.footerText || 'Avalúos profesionales',
    reportTitle: branding.reportTitle || 'Informe técnico de avalúo',
  });
  const [licenseForm, setLicenseForm] = useState({
    status: tenant.status || license.status || 'active',
    plan: tenant.plan || license.plan || 'professional',
    expiresAt: dateFromTimestamp(license.expiresAt),
    maxUsers: Number(license.limits?.maxUsers || 10),
    monthlyAvaluos: Number(license.limits?.monthlyAvaluos || 200),
    terrenos: license.features?.terrenos !== false,
    casas: license.features?.casas !== false,
    pdf: license.features?.pdf !== false,
  });

  useEffect(() => {
    setMembersLoading(true);
    return subscribeTenantMembers(tenant.id, (nextMembers) => {
      setMembers(nextMembers);
      setMembersLoading(false);
    }, (cause) => {
      console.error(cause);
      setError('No fue posible cargar los miembros de la organización.');
      setMembersLoading(false);
    });
  }, [tenant.id]);

  useEffect(() => {
    setAccessLoading(true);
    return subscribeTenantAccessGrants(tenant.id, (nextGrants) => {
      setAccessGrants(nextGrants);
      setAccessLoading(false);
    }, (cause) => {
      console.error(cause);
      setError('No fue posible cargar los accesos preautorizados.');
      setAccessLoading(false);
    });
  }, [tenant.id]);

  const availableUsers = useMemo(() => {
    const memberIds = new Set(members.map((member) => member.uid));
    return users.filter((candidate) => !memberIds.has(candidate.id));
  }, [users, members]);

  const selectedUser = users.find((candidate) => candidate.id === selectedUserId);
  const activeMemberEmails = useMemo(() => new Set(
    members.map((member) => String(member.email || '').trim().toLowerCase()).filter(Boolean),
  ), [members]);
  const pendingAccess = useMemo(
    () => accessGrants.filter((grant) => !activeMemberEmails.has(String(grant.email || '').trim().toLowerCase())),
    [accessGrants, activeMemberEmails],
  );
  const authorizedSeatCount = useMemo(() => {
    const emails = new Set<string>();
    members.forEach((member) => {
      const email = String(member.email || '').trim().toLowerCase();
      if (email) emails.add(email);
    });
    accessGrants.forEach((grant) => {
      const email = String(grant.email || '').trim().toLowerCase();
      if (email) emails.add(email);
    });
    return emails.size;
  }, [members, accessGrants]);

  const saveProfile = async (event: FormEvent) => {
    event.preventDefault();
    setBusy('profile');
    setError('');
    setMessage('');
    try {
      await updatePlatformTenantProfile(tenant.id, profile);
      setMessage('Identidad, contacto, branding y dominio actualizados correctamente.');
    } catch (cause) {
      console.error(cause);
      setError(cause instanceof Error ? cause.message : 'No fue posible guardar la organización.');
    } finally {
      setBusy('');
    }
  };

  const uploadLogo = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setBusy('logo');
    setError('');
    setMessage('');
    try {
      const uploaded = await uploadTenantBrandingLogo(tenant.id, file, profile.logoStoragePath);
      const nextProfile = { ...profile, logoUrl: uploaded.url, logoStoragePath: uploaded.path };
      setProfile(nextProfile);
      await updatePlatformTenantProfile(tenant.id, nextProfile);
      setMessage('Logo institucional actualizado correctamente.');
    } catch (cause) {
      console.error(cause);
      setError(cause instanceof Error ? cause.message : 'No fue posible subir el logo.');
    } finally {
      setBusy('');
    }
  };

  const saveLicense = async (event: FormEvent) => {
    event.preventDefault();
    setBusy('license');
    setError('');
    setMessage('');
    try {
      await updatePlatformTenantLicense(tenant.id, licenseForm);
      setMessage('Licencia, módulos y límites actualizados.');
    } catch (cause) {
      console.error(cause);
      setError(cause instanceof Error ? cause.message : 'No fue posible actualizar la licencia.');
    } finally {
      setBusy('');
    }
  };

  const authorizeEmail = async () => {
    setBusy('authorize-email');
    setError('');
    setMessage('');
    try {
      const email = await preauthorizeTenantAccess(tenant.id, accessEmail, newRole);
      setAccessEmail('');
      setMessage(`${email} quedó autorizado para ${tenant.name}. Al iniciar sesión con Google entrará directamente con rol ${roleLabel[newRole] || newRole}.`);
    } catch (cause) {
      console.error(cause);
      setError(cause instanceof Error ? cause.message : 'No fue posible autorizar el correo.');
    } finally {
      setBusy('');
    }
  };

  const revokePendingAccess = async (grant: PlatformAccessGrant) => {
    if (!window.confirm(`¿Revocar el acceso autorizado de ${grant.email}?`)) return;
    setBusy(`grant:${grant.email}`);
    setError('');
    setMessage('');
    try {
      await revokeTenantAccess(tenant.id, grant.email);
      setMessage('Acceso preautorizado revocado.');
    } catch (cause) {
      console.error(cause);
      setError(cause instanceof Error ? cause.message : 'No fue posible revocar el acceso.');
    } finally {
      setBusy('');
    }
  };

  const addMember = async () => {
    if (!selectedUser) return;
    setBusy('add-member');
    setError('');
    setMessage('');
    try {
      await addPlatformTenantMember(tenant.id, selectedUser, newRole);
      setSelectedUserId('');
      setMessage(`${selectedUser.displayName || selectedUser.email} fue asignado a ${tenant.name}.`);
    } catch (cause) {
      console.error(cause);
      setError(cause instanceof Error ? cause.message : 'No fue posible asignar el usuario.');
    } finally {
      setBusy('');
    }
  };

  const patchMember = async (member: PlatformMember, patch: any) => {
    setBusy(member.uid);
    setError('');
    setMessage('');
    try {
      await updatePlatformTenantMember(tenant.id, member.uid, patch);
    } catch (cause) {
      console.error(cause);
      setError(cause instanceof Error ? cause.message : 'No fue posible actualizar el miembro.');
    } finally {
      setBusy('');
    }
  };

  const removeMember = async (member: PlatformMember) => {
    if (!window.confirm(`¿Quitar a ${member.displayName || member.email} de ${tenant.name}?`)) return;
    setBusy(member.uid);
    setError('');
    setMessage('');
    try {
      await removePlatformTenantMember(tenant.id, member.uid);
      setMessage('Miembro retirado de la organización.');
    } catch (cause) {
      console.error(cause);
      setError(cause instanceof Error ? cause.message : 'No fue posible retirar el miembro.');
    } finally {
      setBusy('');
    }
  };

  return <div className='tenant-manager-backdrop' onMouseDown={onClose}>
    <aside className='tenant-manager' onMouseDown={(event) => event.stopPropagation()} aria-label={`Administrar ${tenant.name}`}>
      <header className='tenant-manager-header'>
        <div className='tenant-manager-identity'>
          {profile.logoUrl ? <img className='tenant-manager-logo' src={profile.logoUrl} alt={`Logo ${tenant.name}`} /> : <span><Building2 /></span>}
          <div><small>ORGANIZACIÓN</small><h2>{tenant.name}</h2><p>{tenant.slug}</p></div>
        </div>
        <button type='button' onClick={onClose} aria-label='Cerrar'><X /></button>
      </header>

      <nav className='tenant-manager-tabs'>
        <button type='button' className={tab === 'general' ? 'is-active' : ''} onClick={() => setTab('general')}><Building2 /> General</button>
        <button type='button' className={tab === 'members' ? 'is-active' : ''} onClick={() => setTab('members')}><UsersRound /> Miembros <span>{authorizedSeatCount}</span></button>
        <button type='button' className={tab === 'license' ? 'is-active' : ''} onClick={() => setTab('license')}><KeyRound /> Licencia</button>
      </nav>

      {(error || message) && <div className={`tenant-manager-notice ${error ? 'is-error' : 'is-success'}`}>{error || message}</div>}

      <div className='tenant-manager-body'>
        {tab === 'general' && <form onSubmit={saveProfile} className='tenant-manage-form'>
          <section>
            <div className='tenant-section-heading'><div><strong>Identidad institucional</strong><small>Información que verá el cliente y utilizarán los informes.</small></div><BadgeCheck /></div>
            <div className='tenant-form-grid'>
              <label><span>Nombre comercial</span><input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} required /></label>
              <label><span>Nombre corto</span><input value={profile.shortName} onChange={(e) => setProfile({ ...profile, shortName: e.target.value })} placeholder={tenant.id === 'norvin' ? 'NG' : 'DRG'} /></label>
              <label><span>Sitio web</span><input value={profile.website} onChange={(e) => setProfile({ ...profile, website: e.target.value })} placeholder='https://empresa.com' /></label>
              <label><span>Dominio de avalúos</span><input value={profile.domain} onChange={(e) => setProfile({ ...profile, domain: e.target.value })} placeholder='avaluos.empresa.com' /></label>
              <label><span>Email institucional</span><input type='email' value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} /></label>
              <label><span>Teléfono</span><input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /></label>
            </div>
          </section>

          <section>
            <div className='tenant-section-heading'><div><strong>Branding del informe</strong><small>Colores, logo y textos que alimentarán los PDFs por tenant.</small></div><ShieldCheck /></div>
            <div className='tenant-form-grid'>
              <label><span>Color principal</span><div className='tenant-color-field'><input type='color' value={profile.primaryColor} onChange={(e) => setProfile({ ...profile, primaryColor: e.target.value })} /><input value={profile.primaryColor} onChange={(e) => setProfile({ ...profile, primaryColor: e.target.value })} /></div></label>
              <label><span>Color secundario</span><div className='tenant-color-field'><input type='color' value={profile.secondaryColor} onChange={(e) => setProfile({ ...profile, secondaryColor: e.target.value })} /><input value={profile.secondaryColor} onChange={(e) => setProfile({ ...profile, secondaryColor: e.target.value })} /></div></label>
              <div className='tenant-logo-uploader is-wide'>
                <span>Logo institucional</span>
                <div>
                  <div className='tenant-logo-preview'>{profile.logoUrl ? <img src={profile.logoUrl} alt={`Logo ${tenant.name}`} /> : <ImagePlus />}</div>
                  <label className='tenant-logo-button'>
                    <ImagePlus /> {busy === 'logo' ? 'Subiendo…' : profile.logoUrl ? 'Cambiar logo' : 'Subir logo'}
                    <input type='file' accept='image/png,image/jpeg,image/webp' onChange={uploadLogo} disabled={busy === 'logo'} />
                  </label>
                  <small>PNG, JPG o WEBP · máximo 2 MB.</small>
                </div>
              </div>
              <label><span>Título del informe</span><input value={profile.reportTitle} onChange={(e) => setProfile({ ...profile, reportTitle: e.target.value })} /></label>
              <label><span>Texto de pie</span><input value={profile.footerText} onChange={(e) => setProfile({ ...profile, footerText: e.target.value })} /></label>
            </div>
          </section>

          <div className='tenant-manager-actions'><button type='submit' className='platform-primary-button' disabled={busy === 'profile' || busy === 'logo'}><Save /> {busy === 'profile' ? 'Guardando…' : 'Guardar cambios'}</button></div>
        </form>}

        {tab === 'members' && <div className='tenant-members-view'>
          <section className='tenant-add-member tenant-access-direct'>
            <div className='tenant-section-heading'><div><strong>Autorizar acceso directo por correo</strong><small>Uso actual: {authorizedSeatCount} de {licenseForm.maxUsers} usuarios permitidos por la licencia.</small></div><ShieldCheck /></div>
            <div className='tenant-add-member-controls'>
              <input type='email' value={accessEmail} onChange={(e) => setAccessEmail(e.target.value)} placeholder='usuario@empresa.com' autoComplete='off' />
              <select value={newRole} onChange={(e) => setNewRole(e.target.value as PlatformMember['role'])}>
                {Object.entries(roleLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
              <button type='button' className='platform-primary-button' disabled={!accessEmail.trim() || busy === 'authorize-email' || authorizedSeatCount >= licenseForm.maxUsers} onClick={authorizeEmail}><Plus /> Autorizar</button>
            </div>
            <p className='tenant-helper'>No necesita iniciar sesión antes. Registra aquí el mismo correo de Google que utilizará la persona; en su primer acceso AVALNIC validará la autorización y activará automáticamente su membresía con este rol.</p>
            {authorizedSeatCount >= licenseForm.maxUsers && <p className='tenant-helper is-warning'>La organización alcanzó el límite de usuarios de su licencia. Amplía el límite antes de autorizar otra cuenta.</p>}
          </section>

          {pendingAccess.length > 0 && <section className='tenant-member-list tenant-pending-access'>
            <div className='tenant-section-heading'><div><strong>Pendientes de primer acceso</strong><small>Correos autorizados que todavía no han activado su membresía iniciando sesión con Google.</small></div><KeyRound /></div>
            {pendingAccess.map((grant) => <div className='tenant-member-row is-pending' key={grant.email}>
              <div className='tenant-member-person'>
                <span>{grant.email.slice(0, 1).toUpperCase()}</span>
                <div><strong>{grant.email}</strong><small>Acceso preautorizado</small></div>
              </div>
              <select value={grant.role} disabled>
                <option>{roleLabel[grant.role] || grant.role}</option>
              </select>
              <span className='tenant-member-status is-pending'>Pendiente</span>
              <button type='button' className='tenant-remove-member' disabled={busy === `grant:${grant.email}`} onClick={() => revokePendingAccess(grant)} aria-label='Revocar acceso'><Trash2 /></button>
            </div>)}
          </section>}

          <section className='tenant-add-member'>
            <div className='tenant-section-heading'><div><strong>Asignar usuario ya registrado</strong><small>Opción secundaria para cuentas que ya iniciaron sesión anteriormente.</small></div><UserRoundCog /></div>
            <div className='tenant-add-member-controls'>
              <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)}>
                <option value=''>Selecciona un usuario…</option>
                {availableUsers.map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.displayName || candidate.email} · {candidate.email}</option>)}
              </select>
              <select value={newRole} onChange={(e) => setNewRole(e.target.value as PlatformMember['role'])}>
                {Object.entries(roleLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
              <button type='button' className='platform-primary-button' disabled={!selectedUserId || busy === 'add-member' || authorizedSeatCount >= licenseForm.maxUsers} onClick={addMember}><Plus /> Asignar</button>
            </div>
            {authorizedSeatCount >= licenseForm.maxUsers && <p className='tenant-helper is-warning'>La organización alcanzó el límite de usuarios de su licencia. Amplía el límite en la pestaña Licencia para agregar más cuentas.</p>}
            {!availableUsers.length && <p className='tenant-helper'>No hay usuarios registrados pendientes de asignar. Para cuentas nuevas usa la autorización directa por correo de arriba.</p>}
          </section>

          <section className='tenant-member-list'>
            <div className='tenant-section-heading'><div><strong>Miembros de {tenant.name}</strong><small>Roles y estado de acceso al tenant.</small></div><UsersRound /></div>
            {membersLoading || accessLoading ? <div className='tenant-members-empty'>Cargando miembros…</div> : members.length ? members.map((member) => <div className='tenant-member-row' key={member.uid}>
              <div className='tenant-member-person'>
                {member.photoURL ? <img src={member.photoURL} alt='' referrerPolicy='no-referrer' /> : <span>{String(member.displayName || member.email || 'U').slice(0, 1).toUpperCase()}</span>}
                <div><strong>{member.displayName || 'Usuario'}</strong><small>{member.email}</small></div>
              </div>
              <select value={member.role} disabled={busy === member.uid} onChange={(e) => patchMember(member, { role: e.target.value })}>
                {Object.entries(roleLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
              <button type='button' className={`tenant-member-status is-${member.status}`} disabled={busy === member.uid} onClick={() => patchMember(member, { status: member.status === 'active' ? 'suspended' : 'active' })}>{member.status === 'active' ? 'Activo' : 'Suspendido'}</button>
              <button type='button' className='tenant-remove-member' disabled={busy === member.uid} onClick={() => removeMember(member)} aria-label='Quitar miembro'><Trash2 /></button>
            </div>) : <div className='tenant-members-empty'>Esta organización todavía no tiene miembros.</div>}
          </section>
        </div>}

        {tab === 'license' && <form onSubmit={saveLicense} className='tenant-manage-form'>
          <section>
            <div className='tenant-section-heading'><div><strong>Estado y plan</strong><small>Estos controles ya restringen el acceso real al sistema.</small></div><KeyRound /></div>
            <div className='tenant-form-grid'>
              <label><span>Estado</span><select value={licenseForm.status} onChange={(e) => setLicenseForm({ ...licenseForm, status: e.target.value as any })}><option value='active'>Activa</option><option value='suspended'>Suspendida</option><option value='expired'>Expirada</option></select></label>
              <label><span>Plan</span><select value={licenseForm.plan} onChange={(e) => setLicenseForm({ ...licenseForm, plan: e.target.value })}><option value='starter'>Starter</option><option value='professional'>Profesional</option><option value='enterprise'>Enterprise</option></select></label>
              <label><span>Expira el</span><input type='date' value={licenseForm.expiresAt} onChange={(e) => setLicenseForm({ ...licenseForm, expiresAt: e.target.value })} /></label>
              <label><span>Máximo de usuarios</span><input type='number' min='1' value={licenseForm.maxUsers} onChange={(e) => setLicenseForm({ ...licenseForm, maxUsers: Number(e.target.value) })} /></label>
              <label><span>Avalúos por mes</span><input type='number' min='1' value={licenseForm.monthlyAvaluos} onChange={(e) => setLicenseForm({ ...licenseForm, monthlyAvaluos: Number(e.target.value) })} /></label>
            </div>
          </section>

          <section>
            <div className='tenant-section-heading'><div><strong>Módulos habilitados</strong><small>Desactivar un módulo lo oculta y bloquea realmente para los usuarios del tenant.</small></div><ShieldCheck /></div>
            <div className='tenant-feature-grid'>
              <label className={licenseForm.terrenos ? 'is-on' : ''}><input type='checkbox' checked={licenseForm.terrenos} onChange={(e) => setLicenseForm({ ...licenseForm, terrenos: e.target.checked })} /><span><Check /> Avalúos de terrenos</span></label>
              <label className={licenseForm.casas ? 'is-on' : ''}><input type='checkbox' checked={licenseForm.casas} onChange={(e) => setLicenseForm({ ...licenseForm, casas: e.target.checked })} /><span><Check /> Avalúos de casas</span></label>
              <label className={licenseForm.pdf ? 'is-on' : ''}><input type='checkbox' checked={licenseForm.pdf} onChange={(e) => setLicenseForm({ ...licenseForm, pdf: e.target.checked })} /><span><Check /> Informes PDF</span></label>
            </div>
          </section>

          <div className='tenant-manager-actions'><button type='submit' className='platform-primary-button' disabled={busy === 'license'}><Save /> {busy === 'license' ? 'Guardando…' : 'Guardar licencia'}</button></div>
        </form>}
      </div>
    </aside>
  </div>;
}