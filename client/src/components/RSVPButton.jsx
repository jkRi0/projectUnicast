import { useState } from 'react';
import { useRSVP } from '../hooks/useRSVP.js';

const RSVPButton = ({ eventId, currentRSVP, onRSVPUpdate }) => {
  const { submitRSVP, updateRSVP, status } = useRSVP(eventId);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');

  const handleRSVP = async (rsvpStatus) => {
    if (currentRSVP) {
      const result = await updateRSVP(rsvpStatus, notes);
      if (result.success && onRSVPUpdate) {
        onRSVPUpdate(result.rsvp);
      }
    } else {
      const result = await submitRSVP(rsvpStatus, notes);
      if (result.success && onRSVPUpdate) {
        onRSVPUpdate(result.rsvp);
      }
    }
    setShowNotes(false);
    setNotes('');
  };

  const currentStatus = currentRSVP?.status;

  return (
    <div className="rsvp-section">
      <h3>RSVP</h3>
      
      {currentStatus ? (
        <div className="rsvp-status">
          <p>Your response: <strong>{currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}</strong></p>
        </div>
      ) : (
        <p>Please confirm your attendance</p>
      )}

      <div className="rsvp-buttons">
        <button
          type="button"
          className={`btn ${currentStatus === 'confirmed' ? 'btn--primary' : 'btn--outline'}`}
          onClick={() => handleRSVP('confirmed')}
          disabled={status === 'loading'}
        >
          {status === 'loading' ? '...' : '✓ Confirm'}
        </button>
        
        <button
          type="button"
          className={`btn ${currentStatus === 'declined' ? 'btn--danger' : 'btn--outline'}`}
          onClick={() => handleRSVP('declined')}
          disabled={status === 'loading'}
        >
          {status === 'loading' ? '...' : '✗ Decline'}
        </button>
        
        <button
          type="button"
          className={`btn ${currentStatus === 'maybe' ? 'btn--warning' : 'btn--outline'}`}
          onClick={() => handleRSVP('maybe')}
          disabled={status === 'loading'}
        >
          {status === 'loading' ? '...' : '? Maybe'}
        </button>
      </div>

      {showNotes && (
        <div className="form-group" style={{ marginTop: '1rem' }}>
          <label htmlFor="rsvp-notes">Additional Notes (optional)</label>
          <textarea
            id="rsvp-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows="3"
            placeholder="Any additional information..."
          />
        </div>
      )}

      <button
        type="button"
        className="btn btn--ghost"
        onClick={() => setShowNotes(!showNotes)}
        style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}
      >
        {showNotes ? 'Hide Notes' : 'Add Notes'}
      </button>
    </div>
  );
};

export default RSVPButton;

