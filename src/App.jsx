import { Navigate, NavLink, Route, Routes } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import TerrenoWorkspace from './features/avaluos/components/TerrenoWorkspace';
import CasaWorkspace from './features/avaluos/components/CasaWorkspace';
import AuthGate from './auth/AuthGate';
import { useAuth } from './auth/AuthContext';

function AppWorkspace() {
  const { user, signOutUser } = useAuth();

  return (
    <div className='avaluos-app'>
      <nav className='avaluos-topnav' aria-label='Tipos de avalúo'>
        <div><strong>Avalúos Platform</strong><span>Motor técnico independiente</span></div>
        <div className='avaluos-topnav-links'>
          <NavLink to='/avaluos/terrenos' className={({ isActive }) => isActive ? 'is-active' : ''}>Terrenos</NavLink>
          <NavLink to='/avaluos/casas' className={({ isActive }) => isActive ? 'is-active' : ''}>Casas</NavLink>
        </div>
        <div className='avaluos-user-menu'>
          {user?.photoURL ? <img src={user.photoURL} alt='' referrerPolicy='no-referrer' /> : null}
          <span><strong>{user?.displayName || 'Usuario'}</strong><small>{user?.email}</small></span>
          <button type='button' onClick={signOutUser} aria-label='Cerrar sesión'><LogOut /></button>
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

export default function App() {
  return <AuthGate><AppWorkspace /></AuthGate>;
}
