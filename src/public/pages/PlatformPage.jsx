import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, FileText, KeyRound, LayoutDashboard, LockKeyhole, Palette, UsersRound } from 'lucide-react';
import Reveal from '../components/Reveal';
import { usePageMeta } from '../components/PublicLayout';

export default function PlatformPage() {
  usePageMeta(
    'Plataforma | AVALNIC',
    'Conoce la plataforma de valoración inmobiliaria AVALNIC: expedientes, usuarios, branding, informes y gestión multiempresa.'
  );

  const features = [
    [<LayoutDashboard />, 'Panel de trabajo', 'Organiza la operación y da acceso a los módulos que cada organización necesita.'],
    [<UsersRound />, 'Usuarios y roles', 'Diferencia propietarios, administradores, evaluadores, agentes y perfiles de consulta.'],
    [<Palette />, 'Identidad propia', 'Cada organización puede mantener su logo, colores y presentación institucional.'],
    [<FileText />, 'Expedientes e informes', 'Guarda valoraciones y conserva la información utilizada en cada proceso.'],
    [<KeyRound />, 'Licencias modulares', 'Activa módulos, límites y capacidad según el tipo de operación.'],
    [<LockKeyhole />, 'Separación por organización', 'La arquitectura organiza datos y permisos por tenant para mantener espacios independientes.'],
  ];

  return <motion.div className='public-page' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <section className='platform-public-hero'>
      <div className='platform-public-copy'>
        <Reveal>
          <p className='public-eyebrow'><span>PLATAFORMA</span><i /> Operación inmobiliaria estructurada</p>
          <h1>El sistema detrás de una valoración <em>más consistente.</em></h1>
          <p>AVALNIC no es únicamente una calculadora. Es una arquitectura para capturar información, trabajar por organización, administrar accesos y conservar expedientes.</p>
          <div className='public-hero-actions'>
            <Link to='/contacto' className='public-primary-cta'>Solicitar demostración <ArrowRight /></Link>
            <Link to='/empresas' className='public-text-cta'>Soluciones para empresas</Link>
          </div>
        </Reveal>
      </div>

      <Reveal className='platform-window' delay={.12}>
        <div className='platform-window-bar'><i/><i/><i/><span>AVALNIC / Workspace</span></div>
        <div className='platform-window-layout'>
          <aside>
            <img src='/avalnic-favicon.svg' alt='' />
            <b />
            <b />
            <b />
            <b className='short' />
          </aside>
          <div className='platform-window-main'>
            <div className='window-heading'><span /><span /></div>
            <div className='window-metrics'><i/><i/><i/></div>
            <div className='window-content'>
              <div className='window-chart'><span/><span/><span/><span/><span/></div>
              <div className='window-data'><b/><b/><b/><b/></div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>

    <section className='public-section platform-feature-section'>
      <Reveal className='section-heading section-heading-wide'>
        <p>ARQUITECTURA DE PRODUCTO</p>
        <h2>Diseñada para trabajar hoy y <em>crecer mañana.</em></h2>
        <span>La misma base puede servir a una operación individual, a una inmobiliaria o a varias organizaciones con configuraciones independientes.</span>
      </Reveal>
      <div className='platform-feature-grid'>
        {features.map(([icon, title, body], index) => <Reveal className='platform-feature-card' delay={index * .05} key={title}>
          <div>{icon}</div><span>0{index + 1}</span><h3>{title}</h3><p>{body}</p>
        </Reveal>)}
      </div>
    </section>

    <section className='public-section architecture-section'>
      <Reveal className='architecture-copy'>
        <p>FLUJO DE INFORMACIÓN</p>
        <h2>Una sola ruta para cada expediente.</h2>
        <span>El objetivo es reducir dispersión: la información entra, se analiza, se documenta y permanece vinculada al mismo proceso.</span>
      </Reveal>
      <Reveal className='architecture-flow' delay={.08}>
        {[
          ['01', 'Datos de propiedad'],
          ['02', 'Variables de análisis'],
          ['03', 'Estimación y rango'],
          ['04', 'Informe'],
          ['05', 'Historial'],
        ].map(([n, label], index) => <div key={n}><span>{n}</span><strong>{label}</strong>{index < 4 && <i />}</div>)}
      </Reveal>
    </section>

    <section className='platform-trust-section'>
      <div className='platform-trust-copy'>
        <Reveal>
          <p>CONTROL Y CONTINUIDAD</p>
          <h2>La experiencia visible es premium. La estructura debajo también importa.</h2>
          <ul>
            <li><CheckCircle2 /> Autenticación por usuario</li>
            <li><CheckCircle2 /> Gestión por organización</li>
            <li><CheckCircle2 /> Módulos configurables</li>
            <li><CheckCircle2 /> Historial de expedientes</li>
          </ul>
        </Reveal>
      </div>
      <div className='platform-trust-mark'><img src='/avalnic-favicon.svg' alt='AVALNIC' /></div>
    </section>
  </motion.div>;
}
