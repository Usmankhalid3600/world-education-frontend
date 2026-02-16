import React from 'react';
import './SubjectCard.css';

const SubjectCard = ({ subject, onClick, isOpted }) => {
  return (
    <div 
      className={`subject-card ${isOpted ? 'opted' : 'unopted'}`}
      onClick={onClick}
    >
      <div className="subject-card-header">
        <h3>{subject.subjectName}</h3>
        {isOpted && (
          <span className="badge opted-badge">Subscribed</span>
        )}
        {!isOpted && (
          <span className="badge available-badge">Available</span>
        )}
      </div>
      <div className="subject-card-footer">
        <button className="view-btn">
          {isOpted ? 'View Topics' : 'Subscribe & View'}
        </button>
      </div>
    </div>
  );
};

export default SubjectCard;
