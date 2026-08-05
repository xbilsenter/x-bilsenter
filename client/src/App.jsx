import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import HomePage from './pages/HomePage';
import BilerPage from './pages/BilerPage';
import BilDetailPage from './pages/BilDetailPage';
import InnbyttePage from './pages/InnbyttePage';
import KontaktPage from './pages/KontaktPage';
import OmOssPage from './pages/OmOssPage';
import TjenesterPage from './pages/TjenesterPage';
import SelgBilPage from './pages/SelgBilPage';
import PreviewBanner from './components/PreviewBanner';

export default function App() {
  return (
    <>
      <PreviewBanner />
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/biler" element={<BilerPage />} />
          <Route path="/biler/:id" element={<BilDetailPage />} />
          <Route path="/innbytte" element={<InnbyttePage />} />
          <Route path="/kontakt" element={<KontaktPage />} />
          <Route path="/om-oss" element={<OmOssPage />} />
          <Route path="/tjenester" element={<TjenesterPage />} />
          <Route path="/selg-bil" element={<SelgBilPage />} />
        </Route>
        <Route path="/andre-tjenester" element={<Navigate to="/tjenester#andre" replace />} />
        {/* Omdiriger gamle .html-lenker til rene URL-er */}
        <Route path="/index.html" element={<Navigate to="/" replace />} />
        <Route path="/biler.html" element={<Navigate to="/biler" replace />} />
        <Route path="/innbytte.html" element={<Navigate to="/innbytte" replace />} />
        <Route path="/kontakt.html" element={<Navigate to="/kontakt" replace />} />
        <Route path="/om-oss.html" element={<Navigate to="/om-oss" replace />} />
        <Route path="/tjenester.html" element={<Navigate to="/tjenester" replace />} />
        <Route path="/andre-tjenester.html" element={<Navigate to="/tjenester#andre" replace />} />
        <Route path="/selg-bil.html" element={<Navigate to="/selg-bil" replace />} />
      </Routes>
    </>
  );
}
