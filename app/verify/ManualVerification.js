'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function ManualVerification() {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploaded, setUploaded] = useState(false);
    const [error, setError] = useState('');
    const supabase = createClient();

    // Handle File Select
    const handleFileChange = (e) => {
        setError(''); // Clear error when file is selected
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        // Strict validation - require file
        if (!file) {
            setError('Please select a photo of your ID before submitting.');
            return;
        }

        setError('');
        setUploading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not logged in");

            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/${Date.now()}.${fileExt}`;
            const filePath = `verification_docs/${fileName}`;

            // 1. Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('verification_docs') // Ensure this bucket exists!
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Start Manual Review Process (Set status to pending)
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ id_verified_status: 'pending' })
                .eq('id', user.id);

            if (updateError) throw updateError;

            setUploaded(true);
            alert('Document uploaded successfully! Admin will review within 24-48 hours.');

        } catch (error) {
            console.error('Upload failed:', error);
            setError('Upload failed: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    if (uploaded) {
        return (
            <div className="card manual-card success">
                <div className="icon">⏳</div>
                <h3>Under Review</h3>
                <p>Your documents have been submitted. We will notify you once verified.</p>
            </div>
        );
    }

    return (
        <div className="card manual-card">
            <div className="icon">📂</div>
            <h3>Manual Verification</h3>
            <p>Upload a photo of your Government ID. <br />Takes 24-48 hours.</p>

            <div className="upload-area">
                <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    disabled={uploading}
                />
                {file && <p className="file-selected">✓ {file.name}</p>}
            </div>

            {error && <p className="error-message">{error}</p>}

            <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="btn-manual"
            >
                {uploading ? 'Uploading...' : 'Submit for Review'}
            </button>

            <style jsx>{`
        .card {
            background: white;
            padding: 2rem;
            border-radius: 16px;
            border: 1px solid #e2e8f0;
            text-align: center;
            transition: all 0.2s;
            box-shadow: 0 4px 6px rgba(0,0,0,0.02);
            flex: 1;
        }
        .card:hover { transform: translateY(-4px); box-shadow: 0 12px 20px rgba(0,0,0,0.06); }
        .icon { font-size: 3rem; margin-bottom: 1rem; }
        h3 { margin-bottom: 0.5rem; color: #1e293b; }
        p { color: #64748b; margin-bottom: 1.5rem; font-size: 0.95rem; line-height: 1.5; }
        
        .upload-area { margin-bottom: 1rem; }
        input[type="file"] { font-size: 0.9rem; }
        .file-selected { color: #16a34a; font-size: 0.85rem; margin-top: 0.5rem; font-weight: 600; }
        .error-message { color: #dc2626; background: #fef2f2; padding: 0.75rem; border-radius: 8px; font-size: 0.9rem; margin-bottom: 1rem; }

        .btn-manual {
            background: #0f172a;
            color: white;
            border: none;
            padding: 0.8rem 1.5rem;
            border-radius: 50px;
            font-weight: 600;
            cursor: pointer;
            width: 100%;
            transition: background 0.2s;
        }
        .btn-manual:hover { background: #334155; }
        .btn-manual:disabled { opacity: 0.5; cursor: not-allowed; }
        
        .success { border-color: #f59e0b; background: #fffbeb; }
      `}</style>
        </div>
    );
}
