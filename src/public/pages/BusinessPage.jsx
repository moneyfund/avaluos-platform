import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, Building2, BriefcaseBusiness, Check, Network, Palette, UsersRound } from 'lucide-react';
import Reveal from '../components/Reveal';
import { usePageMeta } from '../components/PublicLayout';

export default function BusinessPage() {
  usePageMeta(
    'AVALNIC para empresas | Soluciones para inmobiliarias y equipos',
    'AVALNIC ofrece una plataforma multiempresa para inmobiliarias, agentes y equipos que desean integrar valoración inmobiliaria a su operación.'
  );

  const audiences = [
    [<Building2 />, 'Inmobiliarias', 'Añade valoración y documentación a la experiencia que ya ofreces a propietarios y compradores.'],
    [<UsersRound />, 'Equipos de agentes', 'Centraliza expedientes y evita que cada asesor trabaje con procesos distintos.'],
    [<BriefcaseBusiness />, 'Firmas y proyectos', 'Configura una operación con identidad, permisos y límites adecuados a tu equipo.'],
  ];

  return <motion.div className='public-page' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <section className='business-public-hero'>
      <div className='business-public-watermark'>B2B</div>
      <Reveal className='business-public-copy'>
        <p className='public-eyebrow'><span>AVALNIC BUSINESS</span><i /> Infraestructura para profesionales</p>
        <h1>Haz de la valoración una <em>capacidad de tu empresa.</em></h1>
        <p>Integra un flujo de avalúos a tu operación sin tener que construir desde cero el software, la gestión de usuarios o la documentación.</p>
        <Link to='/contacto' className='public-primary-cta'>Conversar sobre integración <ArrowRight /></Link>
      </Reveal>
      <Reveal className='business-stack' delay={.12}>
        <div className='stack-card stack-back'><span>LICENCIA</span><strong>Enterprise</strong></div>
        <div className='stack-card stack-mid'><span>ORGANIZACIÓN</span><strong>Tu marca</strong></div>
        <div className='stack-card stack-front'>
          <img src='/avalnic-favicon.svg' alt=''/>
          <small>POWERED BY AVALNIC</small>
          <strong>Valuation Workspace</strong>
          <div><i/><i/><i/></div>
        </div>
      </Reveal>
    </section>

    <section className='public-section business-audience-section'>
      <Reveal className='section-heading'>
        <p>PARA QUIÉN ES</p>
        <h2>Una base común. Operaciones distintas.</h2>
      </Reveal>
      <div className='audience-grid'>
        {audiences.map(([icon, title, body], index) => <Reveal className='audience-card' delay={index * .08} key={title}>
          <div>{icon}</div><h3>{title}</h3><p>{body}</p>
        </Reveal>)}
      </div>
    </section>

    <section className='business-white-label'>
      <Reveal className='white-label-copy'>
        <p>IDENTIDAD DE ORGANIZACIÓN</p>
        <h2>Tu cliente puede ver <em>tu marca.</em><br/>Tu equipo trabaja sobre AVALNIC.</h2>
        <p>Cada espacio puede configurar identidad visual, usuarios y módulos sin perder la arquitectura central que mantiene el servicio.</p>
        <Link to='/plataforma'>Conocer la arquitectura <ArrowUpRight /></Link>
      </Reveal>
      <Reveal className='white-label-demo' delay={.12}>
        <div className='white-label-browser'>
          <div className='white-label-top'><i/><span>workspace.empresa.com</span></div>
          <div className='white-label-app'>
            <aside><div className='demo-client-logo'>TU<br/>MARCA</div><b/><b/><b/></aside>
            <main><div className='demo-title'/><div className='demo-grid'><i/><i/><i/></div><div className='demo-table'><b/><b/><b/><b/></div></main>
          </div>
        </div>
        <span className='powered-note'><img src='/avalnic-favicon.svg' alt=''/> Infraestructura AVALNIC</span>
      </Reveal>
    </section>

    <section className='public-section business-model-section'>
      <Reveal className='section-heading section-heading-wide'>
        <p>MODELO ESCALABLE</p>
        <h2>Configura lo que tu operación necesita.</h2>
      </Reveal>
      <div className='business-model-grid'>
        {[
          ['Branding', <Palette />, ['Logo institucional', 'Colores de marca', 'Presentación de informes']],
          ['Equipo', <UsersRound />, ['Usuarios por organización', 'Roles y permisos', 'Estado de accesos']],
          ['Operación', <Network />, ['Módulos habilitados', 'Capacidad mensual', 'Historial de expedientes']],
        ].map(([title, icon, list], index) => <Reveal className='business-model-card' delay={index * .08} key={title}>
          <div className='business-model-icon'>{icon}</div><h3>{title}</h3>
          <ul>{list.map(item => <li key={item}><Check /> {item}</li>)}</ul>
        </Reveal>)}
      </div>
    </section>

    <section className='business-contact-strip'>
      <div><small>¿QUIERES INTEGRAR AVALNIC A TU EMPRESA?</small><strong>Hablemos de tu flujo actual y de cómo debería escalar.</strong></div>
      <Link to='/contacto'>Solicitar conversación <ArrowRight /></Link>
    </section>
  </motion.div>;
}
