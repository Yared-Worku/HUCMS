import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MyApplication from './myApplication';
import Main from './Main'
import Customer from './Customer/customer';
import Review from './Review/review'
import Loading from './loding/Loading';
import axios from 'axios';
import { useEffect, useState } from 'react';
import Medical_Certificate from './Medical_certificate/medical_certificate_application';

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
           <Route path="" element={<MyApplication />} />
          <Route path="/myApplication" element={<MyApplication />} />
            <Route path="/customer" element={<Customer />} />
               <Route path="/review" element={<Review />} />
              <Route path="/certificate" element={<Medical_Certificate />} />
      <Route path="/myApplication/:application_number/:service_code/:task_code/:organization_code/:application_detail_id/:meta_data_forms_form_code" element={<Main />}/>
     <Route path="/myApplication/:service_code/:task_code/:organization_code/:meta_data_forms_form_code" element={<Main />}/>
 </Routes>
 </Router>
  );
}

export default App;
