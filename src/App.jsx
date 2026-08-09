import { Navigate, Route, Routes } from 'react-router-dom';
import { Building2, ShieldCheck } from 'lucide-react';

function FoundationPage() {
  return (
    <main className="foundation-shell">
      <section className="foundation-card">
        <div className="foundation-icon"><Building2 aria-hidden="true" /></div>
        <p className="foundation-eyebrow">Avalúos Platform</p>
        <h1>Plataforma central de valoración inmobiliaria</h1>
        <p className="foundation-copy">
          Repositorio independiente preparado para recibir el motor de avalúos existente sin recalibrar fórmulas,
          coeficientes ni precios durante la extracción.
        </p>
        <div className="foundation-status">
          <ShieldCheck aria-hidden="true" />
          <span>Fase actual: extracción controlada del sistema existente.</span>
        </div>
      </section>
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<FoundationPage />} />
      <Route path="/avaluos" element={<FoundationPage />} />
      <Route path="*" element={<Navigate to="/avaluos" replace />} />
    </Routes>
  );
}
