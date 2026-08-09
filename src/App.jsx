import { Navigate, NavLink, Route, Routes } from 'react-router-dom';
import TerrenoWorkspace from './features/avaluos/components/TerrenoWorkspace';
import CasaWorkspace from './features/avaluos/components/CasaWorkspace';

export default function App() {
  return (
    <div className='avaluos-app'>
      <nav className='avaluos-topnav' aria-label='Tipos de avalúo'>
        <div><strong>Avalúos Platform</strong><span>Motor técnico independiente</span></div>
        <div className='avaluos-topnav-links'>
          <NavLink to='/avaluos/terrenos' className={({ isActive }) => isActive ? 'is-active' : ''}>Terrenos</NavLink>
          <NavLink to='/avaluos/casas' className={({ isActive }) => isActive ? 'is-active' : ''}>Casas</NavLink>
        </div>
      </nav>
      <Routes>
        <Route path='/' element={<Navigate to='/avaluos/terrenos' replace />} />
        <Route path='/avaluos' element={<Navigate to='/avaluos/terrenos' replace />} />
        <Route path='/avaluos/terrenos' element={<TerrenoWorkspace />} />
        <Route path='/avaluos/casas' element={<CasaWorkspace />} />
        <Route path='*' element={<Navigate to='/avaluos/terrenos' replace />} />
      </Routes>
    </div>
  );
}
