import React from 'react';
import './TopicCard.css';

const TopicCard = ({ topic, onClick, isOpted }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatPrice = (price, currency) => {
    if (!price) return null;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(price);
  };

  return (
    <div 
      className={`topic-card ${isOpted ? 'opted' : 'unopted'}`}
      onClick={onClick}
    >
      <div className="topic-card-header">
        <h4>{topic.topicName}</h4>
        {isOpted && (
          <span className="badge opted-badge">✓ Subscribed</span>
        )}
        {!isOpted && topic.subscriptionPrice && (
          <span className="badge price-badge">
            {formatPrice(topic.subscriptionPrice, topic.currency)}
          </span>
        )}
      </div>
      <div className="topic-card-body">
        <p className="publish-date">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zM7 4v5h4V8H8V4z"/>
          </svg>
          Published: {formatDate(topic.publishDate)}
        </p>
        
        {!isOpted && topic.subscriptionPrice && (
          <div className="subscription-info">
            <p className="duration-info">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3.5a.5.5 0 0 1-.5-.5v-3.5A.5.5 0 0 1 8 4z"/>
              </svg>
              {topic.durationDays} days access
            </p>
            {topic.freeDays > 0 && (
              <p className="free-trial">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 1a2.5 2.5 0 0 1 2.5 2.5V4h-5v-.5A2.5 2.5 0 0 1 8 1zm3.5 3v-.5a3.5 3.5 0 1 0-7 0V4H1v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4h-3.5z"/>
                </svg>
                {topic.freeDays} days free trial
              </p>
            )}
          </div>
        )}
      </div>
      <div className="topic-card-footer">
        <button className="view-content-btn">
          {isOpted ? (
            <>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z"/>
              </svg>
              View Content
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
              </svg>
              {topic.subscriptionPrice ? 'Subscribe to Unlock' : 'Subscribe Required'}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default TopicCard;
