import React from 'react';
import './Loader.css';

/**
 * Reusable animated loader.
 *
 * Props:
 *  text     — label below the spinner (default "Loading…"). Pass null to hide.
 *  variant  — "page"   : tall centred block, white rings (for dark-gradient backgrounds)
 *             "inline" : compact centred block, purple rings (for light admin pages)
 *  size     — "sm" | "md" | "lg"  (default "md")
 */
const Loader = ({ text = 'Loading…', variant = 'inline', size = 'md' }) => (
  <div className={`ld-wrap ld-${variant} ld-${size}`}>
    <div className="ld-rings">
      <div className="ld-ring-outer" />
      <div className="ld-ring-mid" />
      <div className="ld-core" />
    </div>
    {text && <p className="ld-text">{text}</p>}
  </div>
);

export default Loader;
