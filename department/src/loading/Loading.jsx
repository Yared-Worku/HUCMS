import '../Service/Services.css';
import logo from '../assets/ydd.jpg';

const Loading = () => {
  return (
    <div className="loading-overlay">
      <div className="loading-popup">
        <img src={logo} alt="Loading" className="loading-logo" />
        <div className="spinner"></div>
        <p>Loading, please wait...</p>
      </div>
    </div>
  );
};

export default Loading;
