import { Navigate, Route, Routes } from 'react-router-dom';
import TerrenoWorkspace from './features/avaluos/components/TerrenoWorkspace';

export default function App() {
  return (
    <Routes>
      <Route path='/' element={<Navigate to='/avaluos/terrenos' replace />} />
      <Route path='/avaluos' element={<Navigate to='/avaluos/terrenos' replace />} />
      <Route path='/avaluos/terrenos' element={<TerrenoWorkspace />} />
      <Route path='*' element={<Navigate to='/avaluos/terrenos' replace />} />
    </Routes>
  );
}
