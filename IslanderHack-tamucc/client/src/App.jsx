import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Home from './pages/Home';
import EvacuationPage from './pages/EvacuationPage';
import AlertsPage from './pages/AlertsPage';
import ResourcesPage from './pages/ResourcesPage';
import SOSButton from './components/SOSButton';
import Footer from './components/Footer';
import './App.css';

export default function App() {
  return (
    <Router>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/evacuation" element={<EvacuationPage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/resources" element={<ResourcesPage />} />
      </Routes>
      
      {/* SOS Button - Visible on all pages */}
      <SOSButton />
      
      {/* Footer - Visible on all pages */}
      <Footer />
    </Router>
  );
}
