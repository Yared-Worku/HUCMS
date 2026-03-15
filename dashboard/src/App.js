import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Dashboard from './Dashboard/dashboard';

function App() {
  return (
  <Router>
      <Routes> 
           <Route path="/dashboard" element={<Dashboard />} />
             <Route path="/" element={<Dashboard />} />
          </Routes>
     </Router>
  );
}

export default App;
