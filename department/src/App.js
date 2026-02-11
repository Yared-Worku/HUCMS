import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Assign_Department from './Assign_Department';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Loading from './loading/Loading';
function App() {
   const [loading, setLoading] = useState(true);

   useEffect(() => {
    const initializeApp = async () => {
      try {
        // preload important data
        await Promise.all([
          axios.get('/Users'),
          axios.get('/Department')
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
           <Route path="/Department_Assignment" element={<Assign_Department />} />
             <Route path="/" element={<Assign_Department />} />
             </Routes>
           </Router>
  );
}

export default App;
