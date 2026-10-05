import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import Reveal from '../components/Reveal';
import { usePageMeta } from '../components/PublicLayout';

function TechnicalMark({ type }) {
  if (type === 'land') {
    return <svg viewBox='0 0 48 48' fill='none' aria-hidden='true'>
      <path d='M7 34.5c8-5.6 12.5-2.4 18.4-6.4 5.1-3.4 7.2-8.8 15.6-11.3' stroke='currentColor' strokeWidth='1.6' strokeLinecap='round'/>
      <path d='M8 27.5c7.7-4.4 13-1.4 18.4-5.3 4.7-3.4 7.6-8.2 13.6-9.7' stroke='currentColor' strokeWidth='1.6' strokeLinecap='round' opacity='.55'/>
      <circle cx='21.5' cy='20' r='4.2' stroke='currentColor' strokeWidth='1.6'/>
      <path d='M21.5 24.2v9.3' stroke='currentColor' strokeWidth='1.6' strokeLinecap='round'/>
    </svg>;
  }

  if (type === 'home') {
    return <svg viewBox='0 0 48 48' fill='none' aria-hidden='true'>
      <path d='M8.5 23.2 24 10l15.5 13.2' stroke='currentColor' strokeWidth='1.6' strokeLinecap='round' strokeLinejoin='round'/>
      <path d='M12.5 20.3v17.2h23V20.3M20.2 37.5V27h7.6v10.5' stroke='currentColor' strokeWidth='1.6' strokeLinejoin='round'/>
      <path d='M37.2 12.5v25M34.5 15h5.4M34.5 22h5.4M34.5 29h5.4' stroke='currentColor' strokeWidth='1.4' strokeLinecap='round' opacity='.62'/>
    </svg>;
  }

  return <svg viewBox='0 0 48 48' fill='none' aria-hidden='true'>
    <rect x='7.5' y='9.5' width='33' height='29' rx='2.5' stroke='currentColor' strokeWidth='1.6'/>
    <path d='M12.5 16.5h10M12.5 22.5h18M12.5 28.5h13' stroke='currentColor' strokeWidth='1.6' strokeLinecap='round'/>
    <path d='M31 31.5 34.8 27l5.7 5.8' stroke='currentColor' strokeWidth='1.6' strokeLinecap='round' strokeLinejoin='round'/>
  </svg>;
}

function NicaraguaValuationMap() {
  return <div className='nicaragua-valuation-visual' aria-label='Mapa estilizado de Nicaragua con marcador de valoración'>
    <motion.svg
      viewBox='0 0 540 520'
      className='nicaragua-map-svg'
      initial={{ opacity: 0, scale: .95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, delay: .18 }}
      role='img'
      aria-label='Nicaragua'
    >
      <defs>
        <linearGradient id='nicaraguaGold' x1='90' y1='70' x2='455' y2='440' gradientUnits='userSpaceOnUse'>
          <stop stopColor='#f1d491'/>
          <stop offset='.48' stopColor='#c79a47'/>
          <stop offset='1' stopColor='#8f6729'/>
        </linearGradient>
        <filter id='mapShadow' x='-30%' y='-30%' width='160%' height='160%'>
          <feDropShadow dx='0' dy='18' stdDeviation='17' floodColor='#071827' floodOpacity='.16'/>
        </filter>
      </defs>

      <path
        d='M 80 232.2 L 90.9 215.8 L 113.4 206.7 L 135.1 183.9 L 156.8 159.3 L 184.4 160.3 L 212 152.1 L 241.2 138.4 L 280.4 118.3 L 316.4 97.4 L 358.1 73.7 L 399 50 L 435.8 52.7 L 460 81 L 460 116.5 L 456.7 153.9 L 450 194 L 444.1 234.1 L 431.6 276 L 420.7 312.4 L 409.9 352.5 L 402.4 393.5 L 384 420 L 351.4 440 L 318 438.2 L 288.8 424.5 L 258.7 409 L 232.8 399.9 L 204.4 389 L 176.9 375.3 L 150.2 364.4 L 126.8 346.1 L 113.4 322.5 L 101.7 297.9 L 85.8 272.3 Z'
        fill='url(#nicaraguaGold)'
        filter='url(#mapShadow)'
      />

      <path d='M256 296c22-26 49-30 64-13 16 18 2 48-20 70-17 17-42 18-54 3-13-16-5-40 10-60Z' fill='#f7f3e9' opacity='.74'/>
      <path d='M238 245c13-12 29-11 38-1 8 10 2 25-10 34-12 9-27 8-34-1-7-9-4-22 6-32Z' fill='#f7f3e9' opacity='.74'/>

      <g className='valuation-marker'>
        <circle cx='276' cy='235' r='46' fill='#071827' opacity='.96'/>
        <circle cx='276' cy='235' r='37' fill='none' stroke='#e6c36f' strokeWidth='1.5'/>
        <circle cx='276' cy='235' r='20' fill='none' stroke='#e6c36f' strokeWidth='1.5' opacity='.75'/>
        <path d='M276 219v32M260 235h32' stroke='#f3de9f' strokeWidth='1.8' strokeLinecap='round'/>
        <circle cx='276' cy='235' r='4.5' fill='#f3de9f'/>
      </g>
    </motion.svg>

    <div className='map-caption'>
      <span>NICARAGUA</span>
      <strong>Valoración inmobiliaria con alcance nacional</strong>
      <small>Una marca construida para profesionalizar el análisis y la presentación del valor.</small>
    </div>
  </div>;
}

const capabilityItems = [
  { type: 'land', title: 'Terrenos', body: 'Ubicación, área, acceso, topografía, entorno, servicios y potencial de uso.' },
  { type: 'home', title: 'Viviendas', body: 'Terreno, construcción, estado, distribución, acabados y contexto inmobiliario.' },
  { type: 'report', title: 'Empresas', body: 'Expedientes, usuarios, identidad propia y una plataforma preparada para operar en equipo.' },
];

export default function HomePage() {
  usePageMeta(
    'AVALNIC | Valoración inmobiliaria con criterio en Nicaragua',
    'AVALNIC combina análisis inmobiliario, tecnología y documentación profesional para valorar terrenos y viviendas en Nicaragua.'
  );

  return <motion.div className='public-page' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <section className='public-hero public-hero-refined'>
      <div className='public-hero-copy'>
        <motion.div className='public-eyebrow' initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
          <span>AVALNIC</span><i /> Valoración inmobiliaria en Nicaragua
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .08 }}>
          El valor de un inmueble merece <em>criterio, contexto y respaldo.</em>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .15 }}>
          Analizamos propiedades mediante variables estructuradas y convertimos esa información en una estimación clara, documentada y útil para tomar decisiones.
        </motion.p>

        <motion.div className='public-hero-actions' initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .22 }}>
          <Link to='/contacto' className='public-primary-cta'>Solicitar valoración <ArrowRight /></Link>
          <Link to='/servicios' className='public-text-cta'>Ver servicios <ArrowUpRight /></Link>
        </motion.div>

        <motion.div className='public-hero-trust refined-trust' initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .34 }}>
          <span>Metodología estructurada</span>
          <span>Expediente documentado</span>
          <span>Plataforma multiempresa</span>
        </motion.div>
      </div>

      <motion.div className='public-hero-visual map-hero-shell' initial={{ opacity: 0, scale: .97, x: 22 }} animate={{ opacity: 1, scale: 1, x: 0 }} transition={{ delay: .12, duration: .9 }}>
        <NicaraguaValuationMap />
      </motion.div>
    </section>

    <section className='public-section public-intro-section refined-intro'>
      <Reveal className='section-heading section-heading-wide'>
        <p>QUÉ HACEMOS</p>
        <h2>Valoración inmobiliaria presentada con <em>claridad profesional.</em></h2>
        <span>Trabajamos con terrenos, viviendas y organizaciones que necesitan incorporar una metodología de valoración más ordenada a su operación.</span>
      </Reveal>

      <div className='capability-grid refined-capability-grid'>
        {capabilityItems.map((item, index) => <Reveal className='capability-card refined-capability-card' delay={index * .08} key={item.title}>
          <div className='capability-index'>0{index + 1}</div>
          <div className='capability-icon technical-mark'><TechnicalMark type={item.type} /></div>
          <h3>{item.title}</h3>
          <p>{item.body}</p>
          <Link to={item.title === 'Empresas' ? '/empresas' : '/servicios'}>Conocer más <ArrowUpRight /></Link>
        </Reveal>)}
      </div>
    </section>

    <section className='public-section public-dark-section refined-dark-section'>
      <div className='public-dark-grid'>
        <Reveal className='section-heading section-heading-light'>
          <p>METODOLOGÍA</p>
          <h2>La tecnología organiza el proceso. <em>El criterio interpreta el inmueble.</em></h2>
          <span>AVALNIC estructura la captura de datos, el análisis de factores, la estimación y el expediente final para que cada valoración siga una lógica consistente.</span>
          <Link to='/plataforma' className='public-dark-link'>Conocer la plataforma <ArrowRight /></Link>
        </Reveal>

        <Reveal className='method-console refined-method-console' delay={.1}>
          <div className='console-top'><span>PROCESO DE VALORACIÓN</span><i /><i /><i /></div>
          <div className='console-body'>
            <div className='console-score'><small>ETAPAS</small><strong>04</strong><span>flujo conectado</span></div>
            <div className='console-lines'>
              {['Levantamiento de variables', 'Lectura del contexto', 'Estimación y rango', 'Informe y expediente'].map((item, index) => <div key={item}><b>0{index + 1}</b><span>{item}</span><i style={{ width: `${74 + index * 6}%` }} /></div>)}
            </div>
          </div>
        </Reveal>
      </div>
    </section>

    <section className='public-final-cta refined-final-cta'>
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
