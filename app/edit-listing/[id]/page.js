"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { updateListing } from '../actions';

const CATEGORY_DATA = {
    offroad: [
        { group: "UTVs / Side-by-Sides", items: ["2-Seaters (RZR, Can-Am)", "4-Seaters (Crew Cabs)", "Utility UTVs (Rangers/Defenders)"] },
        { group: "ATVs / Quads", items: ["Sport Quads (Raptors/Banshees)", "Utility ATVs (4x4 with racks)", "Youth ATVs"] },
        { group: "Two Wheels", items: ["Dirt Bikes (Trail/Enduro)", "Motocross Bikes", "Dual-Sport Bikes", "Electric Dirt Bikes (Sur-Ron/Talaria)"] },
        { group: "Seasonal", items: ["Snowmobiles", "Snow Bikes"] }
    ],
    water: [
        { group: "Boats", items: ["Pontoon Boats", "Wake/Ski Boats", "Fishing Boats", "Bowriders"] },
        { group: "Personal Watercraft (PWC)", items: ["Jet Skis (Stand-up & Sit-down)", "Sea-Doos"] },
        { group: "Non-Powered", items: ["Kayaks (Single & Tandem)", "Stand-Up Paddleboards (SUP)", "Canoes", "Pedal Boats"] },
        { group: "Accessories", items: ["Wakeboards", "Water Skis", "Towable Tubes", "Floating Mats/Lilies"] }
    ],
    trailers: [
        { group: "Hauling", items: ["Car Haulers / Flatbeds", "Utility Trailers (Landscape)", "Dump Trailers (Hydraulic)", "Enclosed Cargo Trailers"] },
        { group: "Recreational", items: ["Toy Haulers", "Travel Trailers (Campers)", "Teardrop Trailers", "Boat Trailers (Stand-alone)"] },
        { group: "Specialty", items: ["Horse/Livestock Trailers", "Tow Dollies"] }
    ],
    housing: [
        { group: "Heavy Equipment", items: ["Mini Excavators", "Skid Steers / Bobcats", "Trenchers", "Compact Tractors"] },
        { group: "Lawn & Garden", items: ["Tillers / Cultivators", "Wood Chippers", "Stump Grinders", "Aerators", "Commercial Mowers"] },
        { group: "Construction", items: ["Cement Mixers", "Plate Compactors", "Scaffolding", "Generators", "Air Compressors"] },
        { group: "Power Tools", items: ["Hammer Drills", "Saws (Miter, Table, Concrete)", "Sanders", "Nail Guns"] },
        { group: "Cleaning/Finish", items: ["Pressure Washers", "Carpet Cleaners", "Paint Sprayers", "Floor Buffers"] }
    ]
};

export default function EditListingPage() {
    const params = useParams();
    const router = useRouter();
    const supabase = createClient();

    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        weekend_price: '',
        location: '',
        description: '',
        category: 'offroad',
        subcategory: '',
        subcategory: '',
        image_url: '',
        video_url: ''
    });

    useEffect(() => {
        const fetchItem = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            const { data, error } = await supabase
                .from('items')
                .select('*')
                .eq('id', params.id)
                .single();

            // Fetch private details
            const { data: privateDetails } = await supabase
                .from('item_private_details')
                .select('*')
                .eq('item_id', params.id)
                .single();

            if (data) {
                setFormData({
                    name: data.name,
                    price: data.price,
                    weekend_price: data.weekend_price || '',
                    location: data.location,
                    description: data.description || '',
                    category: data.category || 'offroad',
                    subcategory: data.subcategory || '',
                    image_url: data.image_url || '',
                    video_url: data.video_url || '',
                    year: data.year || '',
                    make: data.make || '',
                    model: data.model || '',
                    rules: data.rules || '',
                    specs: data.specs || {},
                    // Private
                    vin: privateDetails?.vin || '',
                    license_plate: privateDetails?.license_plate || '',
                    maintenance_notes: privateDetails?.maintenance_notes || '',
                    insurance_policy: privateDetails?.insurance_policy || '',
                    storage_address: privateDetails?.storage_address || '',
                    emergency_contact: privateDetails?.emergency_contact || ''
                });
            } else if (error) {
                console.error("Error fetching item:", error);
                setErrorMsg("Failed to load item.");
            }
            setLoading(false);
        };

        if (params.id) fetchItem();
    }, [params.id, router, supabase]);


    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleVideoUpload = async (e) => {
        try {
            setUploading(true);
            const file = e.target.files[0];
            if (!file) return;

            const fileExt = file.name.split('.').pop();
            const fileName = `vid_${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage.from('items').upload(filePath, file);
            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('items').getPublicUrl(filePath);
            setFormData(prev => ({ ...prev, video_url: data.publicUrl }));
        } catch (error) {
            alert('Error uploading video: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleImageUpload = async (e) => {
        try {
            setUploading(true);
            const file = e.target.files[0];
            if (!file) return;

            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage.from('items').upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('items').getPublicUrl(filePath);
            setFormData(prev => ({ ...prev, image_url: data.publicUrl }));
        } catch (error) {
            alert('Error uploading image: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);

        const data = new FormData();
        data.append('itemId', params.id);
        Object.keys(formData).forEach(key => {
            if (key === 'specs') {
                data.append('specs', JSON.stringify(formData[key]));
            } else {
                data.append(key, formData[key]);
            }
        });

        await updateListing(data);
        setUploading(false);
    };

    if (loading) return <div className="container" style={{ padding: '4rem' }}>Loading...</div>;

    return (
        <div className="list-page">
            <div className="container">
                <div className="form-wrapper glass">
                    <div className="form-header">
                        <h1>Edit Listing</h1>
                        <p>Update your equipment details.</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Category</label>
                                <select name="category" value={formData.category} onChange={handleChange}>
                                    <option value="offroad">Offroad</option>
                                    <option value="water">Watersports</option>
                                    <option value="trailers">Trailers</option>
                                    <option value="housing">Tools</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Subcategory</label>
                                <select name="subcategory" value={formData.subcategory} onChange={handleChange} required>
                                    <option value="">Select type...</option>
                                    {CATEGORY_DATA[formData.category]?.map((group) => (
                                        <optgroup key={group.group} label={group.group}>
                                            {group.items.map((item) => (
                                                <option key={item} value={item}>{item}</option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
                            </div>

                            {/* Removed Name Input - Auto Generated */}

                            <div className="form-group full">
                                <label>Year, Make, & Model (Required)</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                    <input type="number" name="year" value={formData.year} onChange={handleChange} placeholder="Year" required />
                                    <input type="text" name="make" value={formData.make} onChange={handleChange} placeholder="Make" required />
                                    <input type="text" name="model" value={formData.model} onChange={handleChange} placeholder="Model" required />
                                </div>
                            </div>

                            {/* Dynamic Specs Section based on Category */}
                            {formData.category === 'offroad' && (
                                <div className="form-group full">
                                    <label>Offroad Specs</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <input type="text" placeholder="Engine Size (cc)" value={formData.specs?.engine_cc || ''} onChange={(e) => {
                                            setFormData(prev => ({ ...prev, specs: { ...prev.specs, engine_cc: e.target.value } }));
                                        }} />
                                        <input type="text" placeholder="Seat Height" value={formData.specs?.seat_height || ''} onChange={(e) => {
                                            setFormData(prev => ({ ...prev, specs: { ...prev.specs, seat_height: e.target.value } }));
                                        }} />
                                    </div>
                                </div>
                            )}

                            {formData.category === 'water' && (
                                <div className="form-group full">
                                    <label>Watercraft Specs</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                        <input type="number" placeholder="Passenger Capacity" value={formData.specs?.capacity || ''} onChange={(e) => {
                                            setFormData(prev => ({ ...prev, specs: { ...prev.specs, capacity: e.target.value } }));
                                        }} />
                                        <input type="text" placeholder="Horsepower" value={formData.specs?.horsepower || ''} onChange={(e) => {
                                            setFormData(prev => ({ ...prev, specs: { ...prev.specs, horsepower: e.target.value } }));
                                        }} />
                                        <input type="text" placeholder="Ball Hitch Size" value={formData.specs?.hitch_size || ''} onChange={(e) => {
                                            setFormData(prev => ({ ...prev, specs: { ...prev.specs, hitch_size: e.target.value } }));
                                        }} />
                                    </div>
                                </div>
                            )}

                            {formData.category === 'trailers' && (
                                <div className="form-group full">
                                    <label>Trailer Specs</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <input type="text" placeholder="Towing Capacity (lbs)" value={formData.specs?.towing_capacity || ''} onChange={(e) => {
                                            setFormData(prev => ({ ...prev, specs: { ...prev.specs, towing_capacity: e.target.value } }));
                                        }} />
                                        <input type="text" placeholder="Ball Hitch Size" value={formData.specs?.hitch_size || ''} onChange={(e) => {
                                            setFormData(prev => ({ ...prev, specs: { ...prev.specs, hitch_size: e.target.value } }));
                                        }} />
                                    </div>
                                </div>
                            )}

                            <div className="form-group full">
                                <label>Rules & Requirements</label>
                                <textarea name="rules" value={formData.rules} onChange={handleChange} rows="2" placeholder="e.g. Must have 3/4 ton truck, Age 25+, etc." />
                            </div>

                            <div className="form-group">
                                <label>Price ($/day)</label>
                                <input type="number" name="price" value={formData.price} onChange={handleChange} required />
                            </div>

                            <div className="form-group">
                                <label>Weekend Rate ($/night)</label>
                                <input type="number" name="weekend_price" value={formData.weekend_price} onChange={handleChange} placeholder="Optional" />
                            </div>

                            {/* Private Owner Details Section */}
                            <div style={{ gridColumn: '1 / -1', marginTop: '1rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#475569' }}>🔒 Private Owner Details (Only you see this)</h3>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="form-group">
                                        <label style={{ fontSize: '0.9rem' }}>VIN / Serial #</label>
                                        <input type="text" name="vin" value={formData.vin || ''} onChange={handleChange} placeholder="Private Record" />
                                    </div>
                                    <div className="form-group">
                                        <label style={{ fontSize: '0.9rem' }}>License Plate</label>
                                        <input type="text" name="license_plate" value={formData.license_plate || ''} onChange={handleChange} placeholder="Private Record" />
                                    </div>
                                    <div className="form-group">
                                        <label style={{ fontSize: '0.9rem' }}>Insurance Policy #</label>
                                        <input type="text" name="insurance_policy" value={formData.insurance_policy || ''} onChange={handleChange} placeholder="Policy Number" />
                                    </div>
                                    <div className="form-group">
                                        <label style={{ fontSize: '0.9rem' }}>Storage Address</label>
                                        <input type="text" name="storage_address" value={formData.storage_address || ''} onChange={handleChange} placeholder="If different from pickup" />
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Zip Code</label>
                                <input type="text" name="location" value={formData.location} onChange={handleChange} required pattern="[0-9]*" />
                            </div>

                            <div className="form-group full">
                                <label>Description</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} rows="4"></textarea>
                            </div>

                            <div className="form-group full">
                                <label>Photos</label>
                                <div className="upload-box">
                                    {formData.image_url ? (
                                        <img src={formData.image_url} alt="Preview" style={{ width: '100%', borderRadius: '8px', maxHeight: '300px', objectFit: 'cover' }} />
                                    ) : (
                                        <span>Click to upload new image</span>
                                    )}
                                    <input type="file" onChange={handleImageUpload} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                                </div>
                            </div>

                            <div className="form-group full">
                                <label>Walkaround Video</label>
                                <div className="upload-box">
                                    {formData.video_url ? (
                                        <video src={formData.video_url} controls style={{ width: '100%', borderRadius: '8px', maxHeight: '300px' }} />
                                    ) : (
                                        <span>Click to upload video</span>
                                    )}
                                    <input type="file" accept="video/*" onChange={handleVideoUpload} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                                </div>
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary btn-lg" disabled={uploading}>
                                {uploading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <style jsx>{`
                .list-page { padding: 4rem 0; min-height: 100vh; }
                .form-wrapper { max-width: 800px; margin: 0 auto; padding: 3rem; background: white; border-radius: 24px; border: 1px solid var(--border-color); }
                .form-header { text-align: center; margin-bottom: 2rem; }
                .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
                .form-group.full { grid-column: 1/-1; }
                .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 600; }
                .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 8px; }
                .upload-box { border: 2px dashed var(--border-color); padding: 2rem; text-align: center; border-radius: 12px; position: relative; }
                .form-actions { text-align: center; margin-top: 2rem; }
                @media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } }
            `}</style>
        </div>
    );
}
