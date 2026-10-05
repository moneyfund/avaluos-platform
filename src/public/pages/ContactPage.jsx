import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, MessageCircle, ShieldCheck } from 'lucide-react';
import Reveal from '../components/Reveal';
import { usePageMeta } from '../components/PublicLayout';

const WHATSAPP_NUMBER = '50587446657';

export default function ContactPage() {
  usePageMeta(
    'Contacto | AVALNIC',
    'Contacta a AVALNIC para solicitar información sobre valoraciones inmobiliarias o soluciones para empresas en Nicaragua.'
  );

  const [form, setForm] = useState({ name: '', phone: '', type: 'Valoración de una propiedad', message: '' });
  const canSend = useMemo(() => form.name.trim() && form.message.trim(), [form]);

  const sendWhatsApp = (event) => {
    event.preventDefault();
    if (!canSend) return;
    const text = [
      'Hola AVALNIC, quiero solicitar información.',
      '',
      `Nombre: ${form.name}`,
      form.phone ? `Teléfono: ${form.phone}` : '',
      `Interés: ${form.type}`,
      `Mensaje: ${form.message}`,
    ].filter(Boolean).join('\n');
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  return <motion.div className='public-page' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <section className='contact-public-hero'>
      <Reveal>
        <p className='public-eyebrow'><span>CONTACTO</span><i /> Una conversación puede empezar el proceso</p>
        <h1>Cuéntanos qué necesitas <em>valorar o construir.</em></h1>
        <p>Atendemos solicitudes de valoración y conversaciones con empresas que desean integrar AVALNIC a su operación.</p>
      </Reveal>
    </section>

    <section className='public-section contact-layout'>
      <Reveal className='contact-form-shell'>
        <div className='contact-form-heading'>
          <small>SOLICITUD INICIAL</small>
          <h2>Habla con AVALNIC</h2>
          <p>Completa los datos esenciales. Al enviar, abriremos WhatsApp con tu solicitud preparada.</p>
        </div>
        <form onSubmit={sendWhatsApp}>
          <div className='contact-field-row'>
            <label><span>Nombre *</span><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder='Tu nombre' required /></label>
            <label><span>Teléfono</span><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder='+505' /></label>
          </div>
          <label><span>¿Qué necesitas?</span>
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              <option>Valoración de una propiedad</option>
              <option>Plataforma para mi empresa</option>
              <option>Integración con una inmobiliaria</option>
              <option>Información general</option>
            </select>
          </label>
          <label><span>Cuéntanos el contexto *</span><textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows='6' placeholder='Tipo de propiedad, ubicación, objetivo o necesidad de tu empresa…' required /></label>
          <button type='submit' className='contact-submit' disabled={!canSend}><MessageCircle /> Enviar por WhatsApp <ArrowRight /></button>
        </form>
      </Reveal>

      <div className='contact-side'>
        <Reveal className='contact-side-card is-dark'>
          <img src='/avalnic-favicon.svg' alt='' />
          <small>ANTES DE ESCRIBIR</small>
          <h3>Mientras más contexto tengamos, mejor podemos orientarte.</h3>
          <p>Ubicación, tipo de inmueble, área aproximada y objetivo de la valoración son un buen punto de partida.</p>
        </Reveal>
        <Reveal className='contact-side-card' delay={.08}>
          <ShieldCheck />
          <h3>¿Eres una empresa?</h3>
          <p>Indica cuántas personas usarían la plataforma y qué tipo de propiedades valoran con mayor frecuencia.</p>
          <span><CheckCircle2 /> Branding por organización</span>
          <span><CheckCircle2 /> Usuarios y roles</span>
          <span><CheckCircle2 /> Módulos configurables</span>
        </Reveal>
      </div>
    </section>
  </motion.div>;
}
