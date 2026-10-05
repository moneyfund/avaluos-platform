import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, Building2, FileCheck2, Layers3, MapPinned, ScanLine, ShieldCheck } from 'lucide-react';
import Reveal from '../components/Reveal';
import { usePageMeta } from '../components/PublicLayout';

const services = [
  {
    number: '01',
    icon: <MapPinned />,
    title: 'Valoración de terrenos',
    body: 'Análisis estructurado de variables que influyen en el valor de un terreno: ubicación, área, acceso, topografía, entorno, servicios, forma, uso potencial y desarrollo.',
    tags: ['Área y ubicación', 'Acceso y entorno', 'Topografía', 'Potencial de uso']
  },
  {
    number: '02',
    icon: <Building2 />,
    title: 'Valoración de viviendas',
    body: 'Lectura integral del terreno y de la construcción: áreas, distribución, estado, materiales, acabados, antigüedad, iluminación, parqueo y contexto urbano.',
    tags: ['Terreno + construcción', 'Estado físico', 'Distribución', 'Contexto']
  },
  {
    number: '03',
    icon: <FileCheck2 />,
    title: 'Informes de valoración',
    body: 'Documentación diseñada para presentar el resultado, los factores analizados, la evidencia visual y la información principal de cada inmueble.',
    tags: ['PDF profesional', 'Factores', 'Fotografías', 'Expediente']
  },
  {
    number: '04',
    icon: <Layers3 />,
    title: 'Plataforma para organizaciones',
    body: 'Entornos separados para inmobiliarias y equipos que necesitan centralizar usuarios, expedientes, branding, módulos y licencias.',
    tags: ['Multiempresa', 'Roles', 'Branding', 'Historial']
  },
];

export default function ServicesPage() {
  usePageMeta(
    'Servicios | AVALNIC',
    'Servicios de valoración inmobiliaria de AVALNIC para terrenos, viviendas, informes y organizaciones en Nicaragua.'
  );

  return <motion.div className='public-page' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <section className='inner-hero services-hero'>
      <div className='inner-hero-grid' />
      <Reveal>
        <p className='public-eyebrow'><span>SERVICIOS</span><i /> Valoración que se puede explicar</p>
        <h1>Un proceso serio empieza por <em>hacer las preguntas correctas.</em></h1>
        <span className='inner-hero-copy'>AVALNIC estructura cada servicio alrededor de variables inmobiliarias concretas, no de una cifra aislada.</span>
      </Reveal>
      <Reveal className='inner-hero-aside' delay={.08}>
        <ScanLine />
        <small>ENFOQUE AVALNIC</small>
        <strong>Analizar. Contrastar. Documentar.</strong>
      </Reveal>
    </section>

    <section className='public-section services-list-section'>
      <div className='services-editorial-list'>
        {services.map((service, index) => <Reveal className='service-editorial-card' delay={index * .05} key={service.number}>
          <div className='service-number'>{service.number}</div>
          <div className='service-main'>
            <div className='service-icon'>{service.icon}</div>
            <h2>{service.title}</h2>
            <p>{service.body}</p>
            <div className='service-tags'>{service.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
          </div>
          <Link to='/contacto' aria-label={`Consultar ${service.title}`}><ArrowUpRight /></Link>
        </Reveal>)}
      </div>
    </section>

    <section className='public-section service-principles'>
      <Reveal className='section-heading'>
        <p>PRINCIPIOS DE SERVICIO</p>
        <h2>Menos opacidad. Más criterio visible.</h2>
      </Reveal>
      <div className='principle-grid'>
        <Reveal><ShieldCheck /><h3>Trazabilidad</h3><p>El resultado se conecta con la información que fue utilizada durante el análisis.</p></Reveal>
        <Reveal delay={.08}><Layers3 /><h3>Estructura</h3><p>Los factores se organizan por categorías para evitar procesos improvisados o inconsistentes.</p></Reveal>
        <Reveal delay={.16}><FileCheck2 /><h3>Presentación</h3><p>El expediente está pensado para comunicar de forma ordenada tanto al profesional como al cliente.</p></Reveal>
      </div>
    </section>

    <section className='service-contact-strip'>
      <div>
        <small>¿TIENES UNA PROPIEDAD O PROYECTO POR VALORAR?</small>
        <strong>Cuéntanos el contexto. Nosotros estructuramos el análisis.</strong>
      </div>
      <Link to='/contacto'>Solicitar información <ArrowRight /></Link>
    </section>
  </motion.div>;
}
