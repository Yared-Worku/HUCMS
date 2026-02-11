import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TreeServiceList from './TreeServiceList';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Loading from './loding/Loading';
function App() {
   const [loading, setLoading] = useState(true);

   useEffect(() => {
    const initializeApp = async () => {
      try {
        // preload important data
        await Promise.all([
          axios.get('/Users'),
         axios.get('/AddTopic'),
      axios.get('/Tree')
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
           <Route path="/service" element={<TreeServiceList />} />
             <Route path="/" element={<TreeServiceList />} />
           {/* <Route path="/myApplication/:service_code/:task_code/:organization_code/:meta_data_forms_form_code" /> */}
             </Routes>
           </Router>
         );
       }

export default App;
