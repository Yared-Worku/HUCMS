// import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Mytask from './mytask';
import Main from './Main';
import Survey from './Survey/survey';
import { useEffect } from 'react';
import { useState } from 'react';
import axios from 'axios';
import Loading from './loding/Loading';
import Diagnosis from './Doctor/diagnosis';
import LabTest from './Laboratory/lab_test';
import Dispanse from './Pharmacy/dispanse';
import Medical_Certificate from './Doctor/medical_certificate';

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
        <Route path="" element={<Mytask />} />
          <Route path="/mytask" element={<Mytask />} />
              <Route path="/diagnosis" element={<Diagnosis />} />
                  <Route path="/lab_test" element={<LabTest />} />
                    <Route path="/dispanse" element={<Dispanse />} />
        <Route path="/certificate" element={<Medical_Certificate />} />
           <Route path="/myTask/:application_number/:service_code/:task_code/:organization_code/:todocode/:application_detail_id/:meta_data_forms_form_code" element={<Main />}/>
       <Route path="/survey" element={<Survey />} />
      </Routes>
 </Router>
  );
}

export default App;
