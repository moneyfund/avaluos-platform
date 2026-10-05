import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ArrowUpRight, Menu, X } from 'lucide-react';

const navItems = [
  ['/', 'Inicio'],
  ['/servicios', 'Servicios'],
  ['/plataforma', 'Plataforma'],
  ['/empresas', 'Empresas'],
  ['/nosotros', 'Nosotros'],
  ['/contacto', 'Contacto'],
];

export function usePageMeta(title, description) {
  useEffect(() => {
    document.title = title;
    let descriptionTag = document.querySelector('meta[name="description"]');
    if (!descriptionTag) {
      descriptionTag = document.createElement('meta');
      descriptionTag.setAttribute('name', 'description');
      document.head.appendChild(descriptionTag);
    }
    descriptionTag.setAttribute('content', description);

    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute('content', title);

    let ogDescription = document.querySelector('meta[property="og:description"]');
    if (!ogDescription) {
      ogDescription = document.createElement('meta');
      ogDescription.setAttribute('property', 'og:description');
      document.head.appendChild(ogDescription);
    }
    ogDescription.setAttribute('content', description);

    const canonicalUrl = `https://avaluos-platform.vercel.app${window.location.pathname === '/' ? '/' : window.location.pathname}`;
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalUrl);

    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (!ogUrl) {
      ogUrl = document.createElement('meta');
      ogUrl.setAttribute('property', 'og:url');
      document.head.appendChild(ogUrl);
    }
    ogUrl.setAttribute('content', canonicalUrl);
  }, [title, description]);
}

export default function PublicLayout({ children }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return <div className='avalnic-public'>
    <header className={`public-header ${scrolled ? 'is-scrolled' : ''}`}>
      <Link to='/' className='public-brand' aria-label='AVALNIC inicio'>
        <img src='/avalnic-logo.svg' alt='AVALNIC' />
      </Link>

      <nav className='public-desktop-nav' aria-label='Navegación principal'>
        {navItems.map(([href, label]) => (
          <NavLink key={href} to={href} end={href === '/'} className={({ isActive }) => isActive ? 'is-active' : ''}>{label}</NavLink>
        ))}
      </nav>

      <div className='public-header-actions'>
        <Link to='/acceso' className='public-login-link'>Acceso clientes</Link>
        <Link to='/contacto' className='public-header-cta'>Solicitar información <ArrowUpRight /></Link>
        <button className='public-menu-button' type='button' onClick={() => setOpen(!open)} aria-label={open ? 'Cerrar menú' : 'Abrir menú'}>
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && <div className='public-mobile-menu'>
        <nav>
          {navItems.map(([href, label]) => (
            <NavLink key={href} to={href} end={href === '/'}>{label}</NavLink>
          ))}
          <Link to='/acceso'>Acceso clientes</Link>
          <Link to='/contacto' className='mobile-cta'>Solicitar información <ArrowUpRight /></Link>
        </nav>
      </div>}
    </header>

    <main>{children}</main>

    <footer className='public-footer'>
      <div className='public-footer-main'>
        <div className='public-footer-brand'>
          <img src='/avalnic-logo.svg' alt='AVALNIC' />
          <p>Valoración inmobiliaria, tecnología y criterio para decisiones que merecen respaldo.</p>
        </div>

        <div>
          <span>Explorar</span>
          <Link to='/servicios'>Servicios</Link>
          <Link to='/plataforma'>Plataforma</Link>
          <Link to='/empresas'>Empresas</Link>
        </div>
        <div>
          <span>Empresa</span>
          <Link to='/nosotros'>Nosotros</Link>
          <Link to='/contacto'>Contacto</Link>
          <Link to='/acceso'>Acceso clientes</Link>
        </div>
        <div>
          <span>Presencia</span>
          <p>Nicaragua</p>
          <p>Atención digital y proyectos por organización.</p>
        </div>
      </div>
      <div className='public-footer-bottom'>
        <span>© {new Date().getFullYear()} AVALNIC. Todos los derechos reservados.</span>
        <span>Plataforma independiente de valoración inmobiliaria.</span>
      </div>
    </footer>
  </div>;
}
