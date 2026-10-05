import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, MotionConfig } from 'framer-motion';
import PublicLayout from './components/PublicLayout';
import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import PlatformPage from './pages/PlatformPage';
import BusinessPage from './pages/BusinessPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';

export default function PublicSite() {
  const location = useLocation();

  return (
    <MotionConfig reducedMotion='user' transition={{ duration: .7, ease: [0.22, 1, 0.36, 1] }}>
      <PublicLayout>
        <AnimatePresence mode='wait' initial={false}>
          <Routes location={location} key={location.pathname}>
            <Route index element={<HomePage />} />
            <Route path='servicios' element={<ServicesPage />} />
            <Route path='plataforma' element={<PlatformPage />} />
            <Route path='empresas' element={<BusinessPage />} />
            <Route path='nosotros' element={<AboutPage />} />
            <Route path='contacto' element={<ContactPage />} />
            <Route path='*' element={<Navigate to='/' replace />} />
          </Routes>
        </AnimatePresence>
      </PublicLayout>
    </MotionConfig>
  );
}
