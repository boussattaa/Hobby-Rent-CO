'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function VerifyPage() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('idle'); // idle, uploading, success, error
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) router.push('/login');
            else setUser(user);

            // Check if already verified
            const { data: profile } = await supabase.from('profiles').select('is_verified').eq('id', user?.id).single();
            if (profile?.is_verified) setStatus('already_verified');
        };
        checkAuth();
    }, [router, supabase]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        if (selectedFile.size > 5 * 1024 * 1024) {
            alert("File size must be less than 5MB");
            return;
        }

        setFile(selectedFile);
        setPreviewUrl(URL.createObjectURL(selectedFile));
    };

    const handleUpload = async () => {
        if (!file || !user) return;
        setLoading(true);

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}_${Date.now()}.${fileExt}`;
            const filePath = `${user.id}/${fileName}`;

            // 1. Upload to Supabase Storage (Private Bucket)
            const { error: uploadError } = await supabase.storage
                .from('private_documents')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Update Profile
            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    id_photo_url: filePath,
                    // Note: In a real app, an admin manually sets 'is_verified' to true after checking.
                    // For MVP/Demo, we might auto-verify or leave it pending. 
                    // Let's leave it pending but mark that they uploaded.
                    // We can reuse 'is_verified' as the status flag or add 'verification_status'.
                    // For simplicity, we'll just store the URL and tell them it's pending review.
                })
                .eq('id', user.id);

            if (updateError) throw updateError;

            setStatus('success');
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Upload failed: ' + error.message);
            setStatus('error');
        } finally {
            setLoading(false);
        }
    };

    if (status === 'already_verified') {
        return (
            <div className="verify-page">
                <div className="container">
                    <div className="verify-card glass">
                        <div className="icon-wrapper">✅</div>
                        <h1>You are Verified!</h1>
                        <p>Your identity has been confirmed. You can now rent items securely.</p>
                        <button onClick={() => router.push('/account')} className="btn btn-secondary">Back to Account</button>
                    </div>
                </div>
                <style jsx>{`
                    .verify-page { min-height: 80vh; display: flex; align-items: center; justify-content: center; padding: 2rem; background: #f8fafc; }
                    .verify-card { background: white; padding: 3rem; border-radius: 24px; text-align: center; max-width: 500px; width: 100%; border: 1px solid #e2e8f0; }
                    .icon-wrapper { font-size: 3rem; margin-bottom: 1rem; }
                `}</style>
            </div>
        );
    }

    return (
        <div className="verify-page">
            <div className="container">
                <div className="verify-card glass">
                    <div className="icon-wrapper">🛡️</div>
                    <h1>Verify Your Identity</h1>
                    <p>Upload a photo of your Driver's License or ID to unlock all features.</p>

                    {status === 'success' ? (
                        <div className="success-state">
                            <h3>Upload Successful!</h3>
                            <p>We are reviewing your document. This usually takes 24 hours.</p>
                            <button onClick={() => router.push('/account')} className="btn btn-primary full-width">Back to Account</button>
                        </div>
                    ) : (
                        <div className="upload-area">
                            <input
                                type="file"
                                id="id-upload"
                                accept="image/*"
                                onChange={handleFileChange}
                                hidden
                            />

                            {!file ? (
                                <label htmlFor="id-upload" className="upload-zone">
                                    <span className="upload-icon">📁</span>
                                    <span>Click to select file</span>
                                    <span className="upload-hint">JPG, PNG up to 5MB</span>
                                </label>
                            ) : (
                                <div className="preview-zone">
                                    {previewUrl && <img src={previewUrl} alt="Preview" className="id-preview" />}
                                    <div className="file-info">
                                        <span>{file.name}</span>
                                        <button onClick={() => { setFile(null); setPreviewUrl(null); }} className="remove-btn">✕</button>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={handleUpload}
                                disabled={!file || loading}
                                className="btn btn-primary btn-lg full-width"
                                style={{ marginTop: '1.5rem' }}
                            >
                                {loading ? 'Uploading...' : 'Submit for Verification'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .verify-page { min-height: 80vh; display: flex; align-items: center; justify-content: center; padding: 2rem; background: radial-gradient(at center, #f8fafc 0%, #e2e8f0 100%); }
                .verify-card { background: white; padding: 3rem; border-radius: 24px; border: 1px solid #e2e8f0; max-width: 500px; width: 100%; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.03); }
                .icon-wrapper { font-size: 3rem; margin-bottom: 1rem; }
                h1 { margin-bottom: 0.5rem; color: #0f172a; }
                p { color: #64748b; margin-bottom: 2rem; }

                .upload-zone { border: 2px dashed #cbd5e1; border-radius: 12px; padding: 3rem 1rem; display: flex; flex-direction: column; align-items: center; cursor: pointer; transition: all 0.2s; background: #f8fafc; }
                .upload-zone:hover { border-color: #3b82f6; background: #eff6ff; }
                .upload-icon { font-size: 2rem; margin-bottom: 0.5rem; }
                .upload-hint { font-size: 0.8rem; color: #94a3b8; margin-top: 0.5rem; }

                .preview-zone { border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
                .id-preview { width: 100%; height: 200px; object-fit: cover; }
                .file-info { padding: 0.75rem; background: #f1f5f9; display: flex; justify-content: space-between; align-items: center; font-size: 0.9rem; font-weight: 500; }
                .remove-btn { background: none; border: none; color: #991b1b; font-weight: bold; cursor: pointer; }

                .btn-lg { padding: 1rem; font-size: 1.1rem; }
                .success-state h3 { color: #166534; margin-bottom: 0.5rem; }
            `}</style>
        </div>
    );
}
