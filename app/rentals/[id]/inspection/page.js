'use client';

import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { submitInspection } from '../../actions';
import Image from 'next/image';

export default function InspectionPage() {
    const params = useParams();
    const router = useRouter();
    const supabase = createClient();

    const [rental, setRental] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [photos, setPhotos] = useState([]);
    const [stage, setStage] = useState('pickup'); // 'pickup' or 'dropoff'

    useEffect(() => {
        const fetchRental = async () => {
            const { data, error } = await supabase
                .from('rentals')
                .select('*, items(*)')
                .eq('id', params.id)
                .single();

            if (data) {
                setRental(data);
                // Determine stage based on status
                if (data.status === 'approved') setStage('pickup');
                else if (data.status === 'active') setStage('dropoff');
                else {
                    // Already done or not ready
                    // router.push('/rentals');
                }
            }
            setLoading(false);
        };
        fetchRental();
    }, [params.id]);

    const handlePhotoUpload = async (e) => {
        try {
            setUploading(true);
            const file = e.target.files[0];
            if (!file) return;

            const fileExt = file.name.split('.').pop();
            const fileName = `inspection_${params.id}_${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage.from('items').upload(filePath, file);
            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('items').getPublicUrl(filePath);
            setPhotos(prev => [...prev, data.publicUrl]);
        } catch (error) {
            alert('Error uploading: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    if (loading) return <div className="container">Loading...</div>;
    if (!rental) return <div className="container">Rental not found</div>;

    return (
        <div className="inspection-page container" style={{ padding: '4rem 2rem' }}>
            <h1>{stage === 'pickup' ? 'Pickup' : 'Dropoff'} Inspection</h1>
            <p className="subtitle">Document the condition of the <strong>{rental.items.name}</strong>.</p>

            <form action={submitInspection} className="inspection-form">
                <input type="hidden" name="rentalId" value={params.id} />
                <input type="hidden" name="type" value={stage} />

                {photos.map(url => (
                    <input key={url} type="hidden" name="photos" value={url} />
                ))}

                <div className="form-section">
                    <h3>1. Upload Photos</h3>
                    <p>Take clear photos of all sides of the equipment.</p>

                    <div className="photo-grid">
                        {photos.map((url, i) => (
                            <div key={i} className="photo-preview">
                                <Image src={url} alt="Inspection" fill style={{ objectFit: 'cover' }} />
                                <button
                                    type="button"
                                    className="btn-remove-photo"
                                    onClick={() => setPhotos(prev => prev.filter((_, idx) => idx !== i))}
                                >
                                    ×
                                </button>
                            </div>
                        ))}

                        <div className="upload-btn-wrapper">
                            <button type="button" className="btn-upload" disabled={uploading}>
                                {uploading ? '...' : '+'}
                            </button>
                            <input type="file" accept="image/*" onChange={handlePhotoUpload} disabled={uploading} />
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3>2. Condition Notes</h3>
                    <textarea
                        name="notes"
                        placeholder="Note any existing scratches, dents, or issues..."
                        rows="4"
                    ></textarea>
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn btn-primary btn-lg" disabled={photos.length === 0}>
                        {stage === 'pickup' ? 'Confirm Pickup & Start Rental' : 'Confirm Dropoff & End Rental'}
                    </button>
                    <p className="disclaimer">By clicking confirm, you agree the photos accurately represent the condition.</p>
                </div>
            </form>

            <style jsx>{`
                .subtitle { color: var(--text-secondary); margin-bottom: 2rem; }
                .form-section { background: white; padding: 2rem; border-radius: 12px; border: 1px solid var(--border-color); margin-bottom: 2rem; }
                .form-section h3 { margin-bottom: 1rem; }
                
                .photo-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 1rem; margin-top: 1rem; }
                .photo-preview { position: relative; width: 100%; aspect-ratio: 1; border-radius: 8px; overflow: hidden; }
                
                .btn-remove-photo {
                    position: absolute;
                    top: 4px;
                    right: 4px;
                    background: rgba(0,0,0,0.6);
                    color: white;
                    border: none;
                    border-radius: 50%;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    font-size: 1rem;
                    line-height: 1;
                    z-index: 10;
                }
                .btn-remove-photo:hover { background: rgba(220, 38, 38, 0.9); }

                .upload-btn-wrapper { position: relative; width: 100%; aspect-ratio: 1; border: 2px dashed var(--border-color); border-radius: 8px; display: flex; align-items: center; justify-content: center; }
                .btn-upload { font-size: 2rem; color: var(--text-secondary); background: none; border: none; }
                .upload-btn-wrapper input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
                
                textarea { width: 100%; padding: 1rem; border: 1px solid var(--border-color); border-radius: 8px; }
                
                .disclaimer { font-size: 0.8rem; color: var(--text-secondary); margin-top: 1rem; }
            `}</style>
        </div>
    );
}
