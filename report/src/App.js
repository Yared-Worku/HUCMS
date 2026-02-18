// import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useState } from 'react';
import axios from 'axios';
import Loading from './loding/Loading';
import MedicalCertificateReport from './Report/medical_certificate_report';
function App() {
   const [loading, setLoading] = useState(true);

   useEffect(() => {
    const initializeApp = async () => {
      try {
        // preload important data
        await Promise.all([
          axios.get('/Users'),
          axios.get('/Department'),
  
        ]);
      } catch (err) {
        console.error('Startup loading failed', err);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  if (loading) return <Loading />;

  return (
 <Router>
      <Routes>
        <Route path="" element={<MedicalCertificateReport />} />
          <Route path="/Medical_Certificate" element={<MedicalCertificateReport />} />
      </Routes>
 </Router>
  );
}

export default App;
