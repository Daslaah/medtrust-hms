import React from 'react';
import './Dashboard.css';

const ComingSoon = ({ title, message }) => {
  return (
    <div className="dashboard">
      <div className="welcome-section">
        <h2>{title}</h2>
        <p>{message}</p>
      </div>
      <div className="info-section">
        <div className="info-card">
          <h4>📌 Hapa bado inaendelea</h4>
          <p>Sehemu hii bado haijakamilika. Kazi ya sasa ni kuweka programu ifanye kazi vizuri kwa sehemu zilizopo.</p>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;
