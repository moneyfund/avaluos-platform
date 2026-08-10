import { useEffect, useMemo, useState } from 'react';
import { Check, Palette, RotateCcw, Save, Sparkles } from 'lucide-react';
import { useTenant } from '../../tenants/TenantContext';
import { PortalTheme, saveTenantPortalTheme } from '../../services/tenantPersonalization.service';

const presets: Array<{ name: string; description: string; theme: PortalTheme }> = [
  {
    name: 'Marfil Dorado',
    description: 'Elegante, cálido y premium.',
    theme: { accentColor: '#c8a85b', pageBackground: '#f5f4f0', sidebarBackground: '#ffffff', topbarBackground: '#faf9f6', cardBackground: '#ffffff', navActiveBackground: '#fff9eb', textColor: '#1d2430' },
  },
  {
    name: 'Blanco Ejecutivo',
    description: 'Minimalista y corporativo.',
    theme: { accentColor: '#a8873d', pageBackground: '#f6f7f8', sidebarBackground: '#ffffff', topbarBackground: '#ffffff', cardBackground: '#ffffff', navActiveBackground: '#f5f1e7', textColor: '#20252c' },
  },
  {
    name: 'Azul Niebla',
    description: 'Sobrio y tecnológico.',
    theme: { accentColor: '#6b83a6', pageBackground: '#f2f5f8', sidebarBackground: '#fbfcfd', topbarBackground: '#f7f9fb', cardBackground: '#ffffff', navActiveBackground: '#edf3f8', textColor: '#1f2b3a' },
  },
  {
    name: 'Champagne',
    description: 'Suave, inmobiliario y refinado.',
    theme: { accentColor: '#b99055', pageBackground: '#f7f3ed', sidebarBackground: '#fffdfa', topbarBackground: '#fbf7f1', cardBackground: '#fffdfa', navActiveBackground: '#f6eadb', textColor: '#302a25' },
  },
  {
    name: 'Salvia',
    description: 'Natural, calmado y moderno.',
    theme: { accentColor: '#78917e', pageBackground: '#f3f6f3', sidebarBackground: '#fbfdfb', topbarBackground: '#f8faf8', cardBackground: '#ffffff', navActiveBackground: '#eaf1eb', textColor: '#26322b' },
  },
];

const fields: Array<{ key: keyof PortalTheme; label: string; description: string }> = [
  { key: 'accentColor', label: 'Color de acento', description: 'Botones, indicadores, iconos y elementos activos.' },
  { key: 'pageBackground', label: 'Fondo general', description: 'Color detrás de formularios, resultados e historial.' },
  { key: 'sidebarBackground', label: 'Sidebar', description: 'Fondo del menú lateral de la organización.' },
  { key: 'topbarBackground', label: 'Barra superior', description: 'Fondo del encabezado fijo del workspace.' },
  { key: 'cardBackground', label: 'Tarjetas', description: 'Superficie de formularios, métricas y expedientes.' },
  { key: 'navActiveBackground', label: 'Opción activa', description: 'Fondo de Terrenos, Casas o Historial cuando están seleccionados.' },
  { key: 'textColor', label: 'Texto principal', description: 'Títulos y contenido principal del workspace.' },
];

function themeFromTenant(tenant: any): PortalTheme {
  const saved = tenant?.branding?.portalTheme || {};
  const accent = saved.accentColor || tenant?.branding?.secondaryColor || '#c8a85b';
  return {
    accentColor: accent,
    pageBackground: saved.pageBackground || '#f5f4f0',
    sidebarBackground: saved.sidebarBackground || '#ffffff',
    topbarBackground: saved.topbarBackground || '#faf9f6',
    cardBackground: saved.cardBackground || '#ffffff',
    navActiveBackground: saved.navActiveBackground || '#fff9eb',
    textColor: saved.textColor || '#1d2430',
  };
}

function applyTheme(theme: PortalTheme) {
  const target = document.querySelector('.client-workspace') as HTMLElement | null;
  if (!target) return;
  target.style.setProperty('--client-accent', theme.accentColor);
  target.style.setProperty('--client-page-bg', theme.pageBackground);
  target.style.setProperty('--client-sidebar-bg', theme.sidebarBackground);
  target.style.setProperty('--client-topbar-bg', theme.topbarBackground);
  target.style.setProperty('--client-card-bg', theme.cardBackground);
  target.style.setProperty('--client-nav-active-bg', theme.navActiveBackground);
  target.style.setProperty('--client-ink', theme.textColor);
}

export default function PersonalizationPage({ canEdit = false }: { canEdit?: boolean }) {
  const { tenantId, tenant, updateLocalBranding } = useTenant();
  const initial = useMemo(() => themeFromTenant(tenant), [tenant?.id]);
  const [savedTheme, setSavedTheme] = useState<PortalTheme>(initial);
  const [theme, setTheme] = useState<PortalTheme>(initial);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { applyTheme(theme); }, [theme]);

  if (!canEdit) {
    return <main className='personalization-page'><div className='personalization-locked'><Palette /><span>PERSONALIZACIÓN</span><h1>Esta opción es exclusiva para propietarios y administradores.</h1><p>Los usuarios operativos pueden utilizar los módulos de avalúos, pero no modificar la identidad visual de la organización.</p></div></main>;
  }

  const updateColor = (key: keyof PortalTheme, color: string) => {
    if (!/^#[0-9a-fA-F]{6}$/.test(color)) return;
    setTheme((current) => ({ ...current, [key]: color }));
    setMessage('');
    setError('');
  };

  const save = async () => {
    if (!tenantId || saving) return;
    setSaving(true);
    setMessage('');
    setError('');
    try {
      await saveTenantPortalTheme(tenantId, theme);
      updateLocalBranding({ portalTheme: theme });
      setSavedTheme(theme);
      setMessage('Personalización guardada. Este diseño queda asociado a la organización.');
    } catch (cause) {
      console.error(cause);
      setError(cause instanceof Error ? cause.message : 'No fue posible guardar la personalización.');
    } finally {
      setSaving(false);
    }
  };

  const restoreSaved = () => {
    setTheme(savedTheme);
    setMessage('Se restauró la última configuración guardada.');
    setError('');
  };

  const restoreBase = () => {
    const base = presets[0].theme;
    setTheme({ ...base, accentColor: tenant?.branding?.secondaryColor || base.accentColor });
    setMessage('Vista base cargada. Guarda los cambios si deseas conservarla.');
    setError('');
  };

  return <main className='personalization-page'>
    <header className='personalization-hero'>
      <div><p>IDENTIDAD DEL WORKSPACE</p><h1>Personaliza la experiencia de tu organización</h1><span>Cambia colores del menú, navegación, tarjetas y fondos. La vista se actualiza mientras eliges y sólo se guarda cuando lo confirmas.</span></div>
      <div className='personalization-hero-icon'><Palette /></div>
    </header>

    {(message || error) && <div className={`personalization-notice ${error ? 'is-error' : 'is-success'}`}>{error || message}</div>}

    <section className='personalization-layout'>
      <div className='personalization-controls'>
        <section className='personalization-panel'>
          <div className='personalization-panel-heading'><div><Sparkles /><span><strong>Estilos rápidos</strong><small>Elige una base y luego afina cada color.</small></span></div></div>
          <div className='theme-presets'>
            {presets.map((preset) => <button type='button' key={preset.name} onClick={() => setTheme(preset.theme)}>
              <div className='theme-preset-colors'><i style={{ background: preset.theme.sidebarBackground }} /><i style={{ background: preset.theme.navActiveBackground }} /><i style={{ background: preset.theme.accentColor }} /></div>
              <span><strong>{preset.name}</strong><small>{preset.description}</small></span>
            </button>)}
          </div>
        </section>

        <section className='personalization-panel'>
          <div className='personalization-panel-heading'><div><Palette /><span><strong>Colores personalizados</strong><small>Modifica cada superficie del portal de manera independiente.</small></span></div></div>
          <div className='theme-fields'>
            {fields.map((field) => <label className='theme-color-field' key={field.key}>
              <span><strong>{field.label}</strong><small>{field.description}</small></span>
              <div><input type='color' value={theme[field.key]} onChange={(event) => updateColor(field.key, event.target.value)} /><code>{theme[field.key].toUpperCase()}</code></div>
            </label>)}
          </div>
        </section>
      </div>

      <aside className='personalization-preview'>
        <div className='personalization-preview-heading'><span>VISTA PREVIA</span><strong>Portal del cliente</strong></div>
        <div className='mini-app' style={{ background: theme.pageBackground, color: theme.textColor }}>
          <div className='mini-sidebar' style={{ background: theme.sidebarBackground }}>
            <div className='mini-brand'><i style={{ background: theme.accentColor }} /><span><strong>{tenant?.name || 'Mi organización'}</strong><small>Avalúos</small></span></div>
            <div className='mini-nav-item is-active' style={{ background: theme.navActiveBackground }}><i style={{ background: theme.accentColor }} /><span>Terrenos</span></div>
            <div className='mini-nav-item'><i /><span>Casas</span></div>
            <div className='mini-nav-item'><i /><span>Historial</span></div>
          </div>
          <div className='mini-main'>
            <div className='mini-topbar' style={{ background: theme.topbarBackground }}><span /><span /></div>
            <div className='mini-content'>
              <div className='mini-title'><small style={{ color: theme.accentColor }}>AVALÚO PROFESIONAL</small><strong>Nuevo expediente</strong></div>
              <div className='mini-cards'>
                <div style={{ background: theme.cardBackground }}><i style={{ background: theme.accentColor }} /><span /><span /></div>
                <div style={{ background: theme.cardBackground }}><i style={{ background: theme.accentColor }} /><span /><span /></div>
              </div>
              <div className='mini-form' style={{ background: theme.cardBackground }}><span /><span /><button style={{ background: theme.accentColor }}>Continuar</button></div>
            </div>
          </div>
        </div>

        <div className='personalization-actions'>
          <button type='button' className='personalization-ghost' onClick={restoreSaved}><RotateCcw /> Deshacer</button>
          <button type='button' className='personalization-ghost' onClick={restoreBase}>Diseño base</button>
          <button type='button' className='personalization-save' onClick={save} disabled={saving}><Save /> {saving ? 'Guardando…' : 'Guardar diseño'}</button>
        </div>
        <p className='personalization-tip'><Check /> Los cambios visuales no modifican PDFs, fórmulas, datos ni licencias.</p>
      </aside>
    </section>
  </main>;
}
