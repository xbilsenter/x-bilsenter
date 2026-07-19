import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import BilerPage from './pages/BilerPage';
import InnbyttePage from './pages/InnbyttePage';
import KontaktPage from './pages/KontaktPage';
import OmOssPage from './pages/OmOssPage';
import TjenesterPage from './pages/TjenesterPage';
import SelgBilPage from './pages/SelgBilPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout page="home"><HomePage /></Layout>} />
      <Route path="/biler" element={<Layout page="biler" bodyClass="page-biler"><BilerPage /></Layout>} />
      <Route path="/innbytte" element={<Layout page="innbytte"><InnbyttePage /></Layout>} />
      <Route path="/kontakt" element={<Layout page="kontakt"><KontaktPage /></Layout>} />
      <Route path="/om-oss" element={<Layout page="om-oss"><OmOssPage /></Layout>} />
      <Route path="/tjenester" element={<Layout page="tjenester"><TjenesterPage /></Layout>} />
      <Route path="/selg-bil" element={<Layout page="selg-bil"><SelgBilPage /></Layout>} />
      {/* Omdiriger gamle .html-lenker til rene URL-er */}
      <Route path="/index.html" element={<Navigate to="/" replace />} />
      <Route path="/biler.html" element={<Navigate to="/biler" replace />} />
      <Route path="/innbytte.html" element={<Navigate to="/innbytte" replace />} />
      <Route path="/kontakt.html" element={<Navigate to="/kontakt" replace />} />
      <Route path="/om-oss.html" element={<Navigate to="/om-oss" replace />} />
      <Route path="/tjenester.html" element={<Navigate to="/tjenester" replace />} />
      <Route path="/selg-bil.html" element={<Navigate to="/selg-bil" replace />} />
    </Routes>
  );
}
