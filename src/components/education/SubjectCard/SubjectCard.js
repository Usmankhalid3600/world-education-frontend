import React from 'react';
import './SubjectCard.css';

const SubjectCard = ({ subject, onClick, isOpted }) => {
  const subscriptionInactive = subject.subscriptionInactive;

  return (
    <div
      className={`subject-card ${isOpted ? 'opted' : subscriptionInactive ? 'subscription-inactive' : 'unopted'}`}
      onClick={onClick}
    >
      <div className="subject-card-header">
        <h3>{subject.subjectName}</h3>
        {isOpted && (
          <span className="badge opted-badge">Subscribed</span>
        )}
        {subscriptionInactive && (
          <span className="badge inactive-badge">Subscription Inactive</span>
        )}
        {!isOpted && !subscriptionInactive && (
          <span className="badge available-badge">Available</span>
        )}
      </div>
      {subject.description && (
        <p className="subject-description">{subject.description}</p>
      )}
      <div className="subject-card-footer">
        <button className="view-btn">
          {isOpted ? 'View Topics' : subscriptionInactive ? 'View Topics' : 'Subscribe & View'}
        </button>
      </div>
    </div>
  );
};

export default SubjectCard;
