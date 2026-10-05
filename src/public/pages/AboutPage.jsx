import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Compass, Layers3, ShieldCheck } from 'lucide-react';
import Reveal from '../components/Reveal';
import { usePageMeta } from '../components/PublicLayout';

export default function AboutPage() {
  usePageMeta(
    'Nosotros | AVALNIC',
    'Conoce la visión de AVALNIC: construir una experiencia de valoración inmobiliaria moderna, clara y escalable para Nicaragua.'
  );

  return <motion.div className='public-page' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <section className='about-hero'>
      <div className='about-hero-mark'><img src='/avalnic-favicon.svg' alt='' /></div>
      <Reveal>
        <p className='public-eyebrow'><span>NOSOTROS</span><i /> Construido desde Nicaragua</p>
        <h1>No queríamos una calculadora. Queríamos una <em>mejor forma de valorar.</em></h1>
      </Reveal>
    </section>

    <section className='public-section about-manifesto'>
      <Reveal className='manifesto-lead'>
        <span>01 / ORIGEN</span>
        <h2>AVALNIC nace de una necesidad práctica: convertir un proceso disperso en una experiencia profesional.</h2>
      </Reveal>
      <Reveal className='manifesto-body' delay={.1}>
        <p>La información de una propiedad suele estar repartida entre fotografías, mensajes, documentos, criterios individuales y cálculos separados. Nuestra respuesta es reunir esa lógica en un sistema que pueda crecer con cada organización.</p>
        <p>El objetivo no es producir una cifra automática y esconder el proceso. Es hacer que el análisis sea más ordenado, que los factores sean visibles y que el resultado pueda documentarse mejor.</p>
      </Reveal>
    </section>

    <section className='about-values'>
      <Reveal className='about-value'>
        <Compass /><span>02</span><h3>Contexto antes que automatismo.</h3><p>Una propiedad existe dentro de una zona, un entorno y una condición específica. La tecnología debe ayudar a leerlos, no ignorarlos.</p>
      </Reveal>
      <Reveal className='about-value' delay={.08}>
        <Layers3 /><span>03</span><h3>Sistemas antes que improvisación.</h3><p>Una metodología consistente permite comparar, documentar y mejorar el proceso con el tiempo.</p>
      </Reveal>
      <Reveal className='about-value' delay={.16}>
        <ShieldCheck /><span>04</span><h3>Confianza a través de claridad.</h3><p>La presentación importa, pero la confianza se construye cuando el usuario entiende qué información está detrás de un resultado.</p>
      </Reveal>
    </section>

    <section className='public-section about-nicaragua'>
      <Reveal className='about-map-card'>
        <div className='nicaragua-outline'>
          <span>NICARAGUA</span>
          <i className='pin pin-one'/><i className='pin pin-two'/><i className='pin pin-three'/>
        </div>
      </Reveal>
      <Reveal className='about-nicaragua-copy' delay={.1}>
        <p>POSICIONAMIENTO</p>
        <h2>Construir una marca nicaragüense con estándar de producto internacional.</h2>
        <span>AVALNIC está pensado para crecer desde la realidad inmobiliaria local hacia una plataforma cada vez más completa, conectable y profesional.</span>
        <Link to='/contacto'>Hablar con nosotros <ArrowRight /></Link>
      </Reveal>
    </section>
  </motion.div>;
}
