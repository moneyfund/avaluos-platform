import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import Reveal from '../components/Reveal';
import { usePageMeta } from '../components/PublicLayout';

const services = [
  {
    number: '01',
    label: 'TERRENOS',
    title: 'Valoración de terrenos',
    body: 'Analizamos las variables que explican el comportamiento de un terreno: ubicación, área, acceso, topografía, entorno, servicios, forma y potencial de uso.',
    advantage: 'Útil para propietarios, inversionistas, agentes y negociaciones que necesitan una referencia mejor estructurada del valor.',
    image: 'https://images.unsplash.com/photo-1781816927578-ec36210fede0?auto=format&fit=crop&fm=jpg&q=82&w=1800',
    alt: 'Vista aérea de terreno y propiedad rural'
  },
  {
    number: '02',
    label: 'VIVIENDAS',
    title: 'Valoración de viviendas',
    body: 'Integramos el terreno con la construcción para leer áreas, distribución, materiales, acabados, estado, antigüedad y contexto inmobiliario.',
    advantage: 'Permite presentar una estimación con más fundamento que una comparación rápida o una percepción aislada del mercado.',
    image: 'https://images.unsplash.com/photo-1771939775110-a9876d394fb5?auto=format&fit=crop&fm=jpg&q=82&w=1800',
    alt: 'Vista aérea de viviendas y entorno residencial'
  },
  {
    number: '03',
    label: 'EMPRESAS',
    title: 'Plataforma para inmobiliarias y equipos',
    body: 'AVALNIC puede integrarse como una capacidad de tu empresa mediante usuarios, expedientes, identidad propia, historial y módulos configurables.',
    advantage: 'Estandariza el proceso interno y convierte la valoración en un servicio repetible, presentable y escalable.',
    image: 'https://images.unsplash.com/photo-1608303588026-884930af2559?auto=format&fit=crop&fm=jpg&q=82&w=1800',
    alt: 'Profesionales revisando planos y documentación técnica'
  }
];

function ServiceLineMark({ index }) {
  if (index === 0) {
    return <svg viewBox='0 0 52 52' fill='none' aria-hidden='true'>
      <path d='M6 37c8-5 12-3 19-7 6-3.5 10-10 21-13' stroke='currentColor' strokeWidth='1.6' strokeLinecap='round'/>
      <path d='M8 28c7-4 12-2 18-6 5-3 9-8 17-10' stroke='currentColor' strokeWidth='1.4' strokeLinecap='round' opacity='.55'/>
      <circle cx='24' cy='19' r='5' stroke='currentColor' strokeWidth='1.6'/>
      <path d='M24 24v13' stroke='currentColor' strokeWidth='1.6' strokeLinecap='round'/>
    </svg>;
  }

  if (index === 1) {
    return <svg viewBox='0 0 52 52' fill='none' aria-hidden='true'>
      <path d='M7 24 26 8l19 16' stroke='currentColor' strokeWidth='1.6' strokeLinecap='round' strokeLinejoin='round'/>
      <path d='M12 20.5V43h28V20.5M22 43V30h8v13' stroke='currentColor' strokeWidth='1.6' strokeLinejoin='round'/>
      <path d='M43 11v32M40 14h6M40 23h6M40 32h6' stroke='currentColor' strokeWidth='1.4' strokeLinecap='round' opacity='.62'/>
    </svg>;
  }

  return <svg viewBox='0 0 52 52' fill='none' aria-hidden='true'>
    <rect x='7' y='8' width='38' height='34' rx='3' stroke='currentColor' strokeWidth='1.6'/>
    <path d='M13 16h12M13 23h20M13 30h15' stroke='currentColor' strokeWidth='1.6' strokeLinecap='round'/>
    <path d='M34 34h7M37.5 30.5v7' stroke='currentColor' strokeWidth='1.6' strokeLinecap='round'/>
  </svg>;
}

export default function ServicesPage() {
  usePageMeta(
    'Servicios | AVALNIC',
    'Servicios de valoración inmobiliaria de AVALNIC para terrenos, viviendas y organizaciones en Nicaragua.'
  );

  return <motion.div className='public-page services-page-refined' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <section className='services-hero-refined'>
      <Reveal className='services-hero-copy-refined'>
        <p className='public-eyebrow'><span>SERVICIOS</span><i /> Valoración inmobiliaria</p>
        <h1>Servicios claros para decisiones <em>que necesitan fundamento.</em></h1>
        <p>AVALNIC combina información del inmueble, contexto y metodología para entregar una lectura más ordenada del valor y una mejor presentación del resultado.</p>
        <Link to='/contacto' className='public-primary-cta'>Solicitar información <ArrowRight /></Link>
      </Reveal>

      <Reveal className='services-hero-statement' delay={.1}>
        <span>EL OBJETIVO</span>
        <strong>Reducir improvisación.</strong>
        <strong>Mejorar consistencia.</strong>
        <strong>Documentar el resultado.</strong>
      </Reveal>
    </section>

    <section className='public-section service-cards-refined-section'>
      <div className='service-cards-refined'>
        {services.map((service, index) => <Reveal className='service-card-refined' delay={index * .06} key={service.number}>
          <div className='service-card-image'>
            <img src={service.image} alt={service.alt} loading='lazy' />
            <span>{service.number}</span>
          </div>

          <div className='service-card-content'>
            <div className='service-card-mark'><ServiceLineMark index={index} /></div>
            <small>{service.label}</small>
            <h2>{service.title}</h2>
            <p>{service.body}</p>

            <div className='service-advantage'>
              <span>VENTAJA</span>
              <p>{service.advantage}</p>
            </div>

            <Link to='/contacto'>Consultar este servicio <ArrowUpRight /></Link>
          </div>
        </Reveal>)}
      </div>
    </section>

    <section className='service-value-strip-refined'>
      <Reveal className='service-value-copy'>
        <p>QUÉ RECIBES</p>
        <h2>Una estimación acompañada por <em>información que se puede presentar.</em></h2>
      </Reveal>

      <div className='service-value-points'>
        <Reveal><span>01</span><strong>Variables organizadas</strong><p>La información relevante del inmueble queda estructurada dentro del mismo expediente.</p></Reveal>
        <Reveal delay={.06}><span>02</span><strong>Rango de valoración</strong><p>El resultado se comunica como una referencia útil para la toma de decisiones.</p></Reveal>
        <Reveal delay={.12}><span>03</span><strong>Informe profesional</strong><p>Fotografías, factores y datos principales quedan preparados para presentar el análisis.</p></Reveal>
      </div>
    </section>

    <section className='service-contact-strip refined-service-contact'>
      <div>
        <small>¿QUIERES VALORAR UNA PROPIEDAD O INTEGRAR AVALNIC A TU EMPRESA?</small>
        <strong>Cuéntanos qué necesitas y te orientamos sobre el flujo adecuado.</strong>
      </div>
      <Link to='/contacto'>Hablar con AVALNIC <ArrowRight /></Link>
    </section>
  </motion.div>;
}
