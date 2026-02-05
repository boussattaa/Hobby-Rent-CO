"use client";

import { useState } from 'react';

export default function WaiverModal({ isOpen, onClose, onSign, waiverUrl }) {
  const [signature, setSignature] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [isSigning, setIsSigning] = useState(false);

  if (!isOpen) return null;

  const handleSign = async () => {
    if (!signature || !agreed) return;

    setIsSigning(true);
    // Simulate API call or just return success
    await new Promise(r => setTimeout(r, 1000));

    onSign({ signature, date: new Date().toISOString() });
    setIsSigning(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass">
        <h2>Rental Agreement & Liability Waiver</h2>

        <div className="waiver-scroll-area">
          <p><strong>1. LIABILITY WAIVER</strong></p>
          <p>By renting this item, I VOLUNTARILY ASSUME ALL RISKS OF ACCIDENT, INJURY, DEATH, OR PROPERTY DAMAGE. I understand that off-road vehicles and heavy machinery are inherently dangerous.</p>

          <p><strong>2. DAMAGE POLICY</strong></p>
          <p>I agree to return the item in the same condition as received. I authorize HobbyRent to charge my payment method for any damages, theft, or cleaning fees verified by the Owner.</p>

          <p><strong>3. INDEMNIFICATION</strong></p>
          <p>I agree to defend, indemnify, and hold harmless HobbyRent and the Owner from any claims arising from my use of the equipment.</p>

          {waiverUrl && (
            <p><a href={waiverUrl} target="_blank" rel="noreferrer">View Full Contract PDF</a></p>
          )}
        </div>

        <div className="signing-area">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            I have read and agree to the terms above.
          </label>

          <div className="signature-input">
            <label>Type your full name to sign:</label>
            <input
              type="text"
              placeholder="e.g. John Doe"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
            />
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose} disabled={isSigning}>Cancel</button>
          <button
            className="btn btn-primary"
            onClick={handleSign}
            disabled={!agreed || signature.length < 3 || isSigning}
          >
            {isSigning ? 'Signing...' : 'Sign & Confirm'}
          </button>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 1rem;
        }
        .modal-content {
          background: white;
          padding: 2rem;
          border-radius: 16px;
          width: 100%;
          max-width: 500px;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .waiver-scroll-area {
          background: #f8fafc;
          padding: 1rem;
          border-radius: 8px;
          height: 200px;
          overflow-y: auto;
          font-size: 0.9rem;
          border: 1px solid var(--border-color);
        }
        .waiver-scroll-area p { margin-bottom: 0.75rem; }
        
        .signing-area {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .checkbox-label {
          display: flex;
          gap: 0.5rem;
          align-items: center;
          font-size: 0.95rem;
          cursor: pointer;
        }
        .signature-input label {
          display: block;
          font-size: 0.85rem;
          margin-bottom: 0.25rem;
          color: var(--text-secondary);
        }
        .signature-input input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          font-family: monospace;
          font-size: 1.1rem;
        }
        .modal-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 0.5rem;
        }
      `}</style>
    </div>
  );
}
