import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, ArrowUpRight, Building2, CheckCircle2, FileText,
  Layers3, MapPinned, ShieldCheck, Sparkles, TrendingUp
} from 'lucide-react';
import Reveal from '../components/Reveal';
import { usePageMeta } from '../components/PublicLayout';

const capabilityItems = [
  ['Terrenos', 'Lectura estructurada de ubicación, área, entorno, acceso, topografía y potencial.', <MapPinned />],
  ['Viviendas', 'Análisis combinado del terreno, construcción, estado, distribución y contexto.', <Building2 />],
  ['Informes', 'Resultados organizados para presentar, comparar y documentar decisiones.', <FileText />],
];

function ValuationVisual() {
  return <div className='valuation-visual' aria-hidden='true'>
    <div className='valuation-orbit orbit-one' />
    <div className='valuation-orbit orbit-two' />
    <div className='valuation-grid' />
    <motion.div
      className='valuation-building'
      initial={{ rotateY: -12, rotateX: 8 }}
      animate={{ rotateY: [ -12, 8, -12 ], rotateX: [8, 2, 8] }}
      transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
    >
      <span className='building-plane plane-a' />
      <span className='building-plane plane-b' />
      <span className='building-plane plane-c' />
    </motion.div>
    <div className='valuation-reading reading-one'><small>UBICACIÓN</small><strong>01</strong></div>
    <div className='valuation-reading reading-two'><small>ENTORNO</small><strong>02</strong></div>
    <div className='valuation-reading reading-three'><small>CONDICIÓN</small><strong>03</strong></div>
    <div className='valuation-index'><span>ÍNDICE DE ANÁLISIS</span><strong>VALOR</strong><i /></div>
  </div>;
}

export default function HomePage() {
  usePageMeta(
    'AVALNIC | Valoración inmobiliaria con criterio en Nicaragua',
    'AVALNIC combina análisis inmobiliario, tecnología y documentación profesional para valorar terrenos y viviendas en Nicaragua.'
  );

  return <motion.div className='public-page' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <section className='public-hero'>
      <div className='public-hero-copy'>
        <motion.div className='public-eyebrow' initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
          <span>AVALNIC</span><i /> Valoración inmobiliaria + tecnología
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .08 }}>
          El valor de un inmueble merece <em>más que una cifra.</em>
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .15 }}>
          Transformamos información de una propiedad en una lectura estructurada, documentada y útil para decidir con mayor claridad.
        </motion.p>
        <motion.div className='public-hero-actions' initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .22 }}>
          <Link to='/contacto' className='public-primary-cta'>Solicitar una valoración <ArrowRight /></Link>
          <Link to='/plataforma' className='public-text-cta'>Conocer la plataforma <ArrowUpRight /></Link>
        </motion.div>
        <motion.div className='public-hero-trust' initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .38 }}>
          <span><CheckCircle2 /> Metodología estructurada</span>
          <span><ShieldCheck /> Información organizada por expediente</span>
          <span><Layers3 /> Solución multiempresa</span>
        </motion.div>
      </div>

      <motion.div className='public-hero-visual' initial={{ opacity: 0, scale: .96, x: 25 }} animate={{ opacity: 1, scale: 1, x: 0 }} transition={{ delay: .12, duration: .9 }}>
        <ValuationVisual />
      </motion.div>

      <div className='hero-scroll-note'><span>Explora AVALNIC</span><i /></div>
    </section>

    <section className='public-marquee' aria-label='Capacidades AVALNIC'>
      <div>
        <span>VALORACIÓN DE TERRENOS</span><i />
        <span>ANÁLISIS DE VIVIENDAS</span><i />
        <span>INFORMES PROFESIONALES</span><i />
        <span>PLATAFORMA PARA EMPRESAS</span><i />
        <span>TECNOLOGÍA INMOBILIARIA</span>
      </div>
    </section>

    <section className='public-section public-intro-section'>
      <Reveal className='section-heading section-heading-wide'>
        <p>UNA NUEVA FORMA DE LEER EL VALOR</p>
        <h2>Del inmueble a una decisión <em>defendible.</em></h2>
        <span>AVALNIC organiza las variables que realmente cambian la lectura de una propiedad y las convierte en un proceso comprensible, trazable y presentable.</span>
      </Reveal>

      <div className='capability-grid'>
        {capabilityItems.map(([title, body, icon], index) => <Reveal className='capability-card' delay={index * .08} key={title}>
          <div className='capability-index'>0{index + 1}</div>
          <div className='capability-icon'>{icon}</div>
          <h3>{title}</h3>
          <p>{body}</p>
          <Link to='/servicios'>Explorar servicio <ArrowUpRight /></Link>
        </Reveal>)}
      </div>
    </section>

    <section className='public-section public-dark-section'>
      <div className='public-dark-grid'>
        <Reveal className='section-heading section-heading-light'>
          <p>CRITERIO + SISTEMA</p>
          <h2>La tecnología no reemplaza el análisis. <em>Lo vuelve consistente.</em></h2>
          <span>Nuestra plataforma permite ordenar datos, aplicar criterios definidos, conservar expedientes y generar resultados con una lógica repetible.</span>
          <Link to='/plataforma' className='public-dark-link'>Ver cómo funciona AVALNIC <ArrowRight /></Link>
        </Reveal>

        <Reveal className='method-console' delay={.1}>
          <div className='console-top'><span>AVALNIC / ANALYSIS ENGINE</span><i /><i /><i /></div>
          <div className='console-body'>
            <div className='console-score'><small>PROCESO</small><strong>04</strong><span>etapas conectadas</span></div>
            <div className='console-lines'>
              {['Captura de variables', 'Lectura del contexto', 'Ponderación y cálculo', 'Informe y expediente'].map((item, index) => <div key={item}><b>0{index + 1}</b><span>{item}</span><i style={{ width: `${72 + index * 7}%` }} /></div>)}
            </div>
          </div>
        </Reveal>
      </div>
    </section>

    <section className='public-section public-business-section'>
      <Reveal className='business-lead'>
        <p>SOLUCIONES PARA PROFESIONALES</p>
        <h2>Una plataforma que también puede operar <em>bajo tu marca.</em></h2>
      </Reveal>
      <div className='business-feature-grid'>
        <Reveal className='business-feature'>
          <Sparkles />
          <h3>Identidad por organización</h3>
          <p>Cada firma puede trabajar con su propia imagen, colores, usuarios y entorno de trabajo.</p>
        </Reveal>
        <Reveal className='business-feature' delay={.08}>
          <ShieldCheck />
          <h3>Espacios independientes</h3>
          <p>Los datos y permisos se organizan por organización para mantener una operación separada y administrable.</p>
        </Reveal>
        <Reveal className='business-feature' delay={.16}>
          <TrendingUp />
          <h3>Escalable por licencia</h3>
          <p>Planes, módulos y límites permiten crecer desde una operación individual hasta equipos inmobiliarios.</p>
        </Reveal>
      </div>
      <Reveal className='business-cta-band'>
        <div><small>PARA INMOBILIARIAS, AGENTES Y EQUIPOS</small><strong>Integra AVALNIC a tu operación.</strong></div>
        <Link to='/empresas'>Soluciones empresariales <ArrowUpRight /></Link>
      </Reveal>
    </section>

    <section className='public-section public-process-section'>
      <Reveal className='section-heading'>
        <p>PROCESO</p>
        <h2>Claridad desde el primer dato.</h2>
      </Reveal>
      <div className='process-line'>
        {[
          ['01', 'Levantamiento', 'Se estructura la información relevante de la propiedad.'],
          ['02', 'Análisis', 'Se interpretan características, contexto y factores de valor.'],
          ['03', 'Estimación', 'Se obtiene un resultado y un rango útil para la toma de decisiones.'],
          ['04', 'Documentación', 'El expediente conserva la información y permite presentar el resultado.'],
        ].map(([number, title, text], index) => <Reveal className='process-step' delay={index * .07} key={number}>
          <span>{number}</span><i /><h3>{title}</h3><p>{text}</p>
        </Reveal>)}
      </div>
    </section>

    <section className='public-final-cta'>
      <div className='final-cta-grid' />
      <Reveal>
        <img src='/avalnic-favicon.svg' alt='' />
        <p>CUANDO EL VALOR IMPORTA</p>
        <h2>Decide con más contexto.<br />Presenta con más confianza.</h2>
        <div>
          <Link to='/contacto' className='public-primary-cta is-light'>Hablar con AVALNIC <ArrowRight /></Link>
          <Link to='/servicios' className='public-text-cta is-light'>Ver servicios <ArrowUpRight /></Link>
        </div>
      </Reveal>
    </section>
  </motion.div>;
}
