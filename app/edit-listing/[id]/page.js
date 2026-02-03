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
        location: '',
        description: '',
        category: 'offroad',
        subcategory: '',
        image_url: ''
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

            if (data) {
                setFormData({
                    name: data.name,
                    price: data.price,
                    location: data.location,
                    description: data.description || '',
                    category: data.category || 'offroad',
                    subcategory: data.subcategory || '',
                    image_url: data.image_url || ''
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
        Object.keys(formData).forEach(key => data.append(key, formData[key]));

        await updateListing(data);
        // Action handles redirect
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

                            <div className="form-group">
                                <label>Item Name</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                            </div>

                            <div className="form-group">
                                <label>Price ($/day)</label>
                                <input type="number" name="price" value={formData.price} onChange={handleChange} required />
                            </div>

                            <div className="form-group">
                                <label>Location</label>
                                <input type="text" name="location" value={formData.location} onChange={handleChange} required />
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
