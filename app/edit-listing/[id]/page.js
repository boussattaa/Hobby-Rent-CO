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

    // Helper to parse location string
    const parseLocation = (loc) => {
        if (!loc) return { city: '', state: '', zip: '' };

        // Strategy: Split by last comma to separate City from State/Zip
        const lastCommaIndex = loc.lastIndexOf(',');
        if (lastCommaIndex !== -1) {
            const cityPart = loc.substring(0, lastCommaIndex).trim();
            const remainder = loc.substring(lastCommaIndex + 1).trim();

            // Extract Zip (last 5 digits)
            const zipMatch = remainder.match(/(\d{5})$/);
            if (zipMatch) {
                const zip = zipMatch[1];
                const state = remainder.replace(zip, '').trim();
                return { city: cityPart, state: state.substring(0, 2).toUpperCase(), zip };
            }
        }

        // Fallback: match 5 digit zip only
        if (loc.match(/^\d{5}$/)) return { city: '', state: '', zip: loc };

        // If really weird format, put it all in city so they see it
        return { city: loc, state: '', zip: '' };
    };

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        weekend_price: '',
        hourly_rate: '',
        min_duration: 4,
        price_type: 'daily',
        location: '',
        city: '',
        state: '',
        zip: '',
        description: '',
        category: 'offroad',
        subcategory: '',
        image_url: '',
        video_url: '',
        year: '',
        make: '',
        model: '',
        rules: '',
        specs: {},
        vin: '',
        license_plate: '',
        insurance_policy: '',
        maintenance_notes: '',
        storage_address: '',
        emergency_contact: ''
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
                    price: data.price || '',
                    weekend_price: data.weekend_price || '',
                    hourly_rate: data.hourly_rate || '',
                    min_duration: data.min_duration || 4,
                    price_type: data.price_type || 'daily',
                    location: data.location,
                    city: parseLocation(data.location).city,
                    state: parseLocation(data.location).state,
                    zip: parseLocation(data.location).zip,
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
                    emergency_contact: privateDetails?.emergency_contact || '',
                    instant_book: data.instant_book || false
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
        setErrorMsg(null); // Clear any previous error

        const data = new FormData();
        data.append('itemId', params.id);
        Object.keys(formData).forEach(key => {
            if (key === 'specs') {
                data.append('specs', JSON.stringify(formData[key]));
            } else {
                data.append(key, formData[key]);
            }
        });

        console.log('Submitting form data...');

        try {
            const result = await updateListing(data);
            console.log('updateListing result:', result);

            if (result?.success) {
                console.log('Success! Redirecting to:', `/item/${result.itemId}`);
                router.push(`/item/${result.itemId}`);
            } else if (result?.message) {
                console.error('Error message from server:', result.message);
                setErrorMsg(result.message);
                setUploading(false);
                window.scrollTo(0, 0);
            } else {
                console.log('No success or error message returned:', result);
                setUploading(false);
            }
        } catch (err) {
            console.error('Exception in handleSubmit:', err);
            setErrorMsg('An unexpected error occurred: ' + err.message);
            setUploading(false);
            window.scrollTo(0, 0);
        }
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

                    {errorMsg && (
                        <div style={{
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            color: '#dc2626',
                            padding: '1rem',
                            borderRadius: '8px',
                            marginBottom: '1.5rem'
                        }}>
                            <strong>Error:</strong> {errorMsg}
                        </div>
                    )}

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
                                        <input type="number" placeholder="Seat Capacity" value={formData.specs?.seat_capacity || ''} onChange={(e) => {
                                            setFormData(prev => ({ ...prev, specs: { ...prev.specs, seat_capacity: e.target.value } }));
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

                            <div className="form-group full">
                                <label>Pricing Model</label>
                                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.5rem', marginBottom: '0.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                                <input
                                                    type="radio"
                                                    name="price_type"
                                                    value="daily"
                                                    checked={formData.price_type === 'daily'}
                                                    onChange={handleChange}
                                                    style={{ width: 20, height: 20 }}
                                                />
                                                <span style={{ fontWeight: 600 }}>Daily Only</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                                <input
                                                    type="radio"
                                                    name="price_type"
                                                    value="hourly"
                                                    checked={formData.price_type === 'hourly'}
                                                    onChange={handleChange}
                                                    style={{ width: 20, height: 20 }}
                                                />
                                                <span style={{ fontWeight: 600 }}>Hourly Only</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                                <input
                                                    type="radio"
                                                    name="price_type"
                                                    value="both"
                                                    checked={formData.price_type === 'both'}
                                                    onChange={handleChange}
                                                    style={{ width: 20, height: 20 }}
                                                />
                                                <span style={{ fontWeight: 600 }}>Both (Hourly & Daily)</span>
                                            </div>
                                        </label>
                                    </div>

                                    {(formData.price_type === 'daily' || formData.price_type === 'both') && (
                                        <div style={{ marginBottom: '1.5rem', paddingBottom: formData.price_type === 'both' ? '1.5rem' : 0, borderBottom: formData.price_type === 'both' ? '1px dashed #e2e8f0' : 'none' }}>
                                            <h4 style={{ marginBottom: '1rem', fontSize: '0.9rem', textTransform: 'uppercase', color: '#64748b' }}>Daily Pricing</h4>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                                <div className="form-group">
                                                    <label>Daily Price ($)</label>
                                                    <input
                                                        type="number"
                                                        name="price"
                                                        value={formData.price}
                                                        onChange={handleChange}
                                                        placeholder="150"
                                                        required={formData.price_type !== 'hourly'}
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>Weekend Rate ($/night)</label>
                                                    <input
                                                        type="number"
                                                        name="weekend_price"
                                                        value={formData.weekend_price}
                                                        onChange={handleChange}
                                                        placeholder="Optional"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {(formData.price_type === 'hourly' || formData.price_type === 'both') && (
                                        <div>
                                            <h4 style={{ marginBottom: '1rem', fontSize: '0.9rem', textTransform: 'uppercase', color: '#64748b' }}>Hourly Pricing</h4>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                                <div className="form-group">
                                                    <label>Hourly Rate ($)</label>
                                                    <input
                                                        type="number"
                                                        name="hourly_rate"
                                                        value={formData.hourly_rate}
                                                        onChange={handleChange}
                                                        placeholder="50"
                                                        step="0.01"
                                                        required={formData.price_type !== 'daily'}
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>Min Duration (Hours)</label>
                                                    <input
                                                        type="number"
                                                        name="min_duration"
                                                        value={formData.min_duration}
                                                        onChange={handleChange}
                                                        min="1"
                                                        max="24"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="form-group full">
                                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span>Instant Book</span>
                                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'normal' }}>
                                        Allow renters to book without manual approval?
                                    </span>
                                </label>
                                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            name="instant_book"
                                            checked={formData.instant_book}
                                            onChange={(e) => setFormData({ ...formData, instant_book: e.target.checked })}
                                            style={{ width: '20px', height: '20px' }}
                                        />
                                        <span>Enable Instant Book for this listing</span>
                                    </label>
                                </div>
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

                            <div className="form-group full">
                                <label>Location (Public)</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        placeholder="City"
                                        required
                                        autoComplete="address-level2"
                                    />
                                    <select name="state" value={formData.state} onChange={handleChange} required autoComplete="address-level1" style={{ fontSize: '1rem' }}>
                                        <option value="">State</option>
                                        <option value="AL">AL</option><option value="AK">AK</option><option value="AZ">AZ</option><option value="AR">AR</option>
                                        <option value="CA">CA</option><option value="CO">CO</option><option value="CT">CT</option><option value="DE">DE</option>
                                        <option value="FL">FL</option><option value="GA">GA</option><option value="HI">HI</option><option value="ID">ID</option>
                                        <option value="IL">IL</option><option value="IN">IN</option><option value="IA">IA</option><option value="KS">KS</option>
                                        <option value="KY">KY</option><option value="LA">LA</option><option value="ME">ME</option><option value="MD">MD</option>
                                        <option value="MA">MA</option><option value="MI">MI</option><option value="MN">MN</option><option value="MS">MS</option>
                                        <option value="MO">MO</option><option value="MT">MT</option><option value="NE">NE</option><option value="NV">NV</option>
                                        <option value="NH">NH</option><option value="NJ">NJ</option><option value="NM">NM</option><option value="NY">NY</option>
                                        <option value="NC">NC</option><option value="ND">ND</option><option value="OH">OH</option><option value="OK">OK</option>
                                        <option value="OR">OR</option><option value="PA">PA</option><option value="RI">RI</option><option value="SC">SC</option>
                                        <option value="SD">SD</option><option value="TN">TN</option><option value="TX">TX</option><option value="UT">UT</option>
                                        <option value="VT">VT</option><option value="VA">VA</option><option value="WA">WA</option><option value="WV">WV</option>
                                        <option value="WI">WI</option><option value="WY">WY</option>
                                    </select>
                                    <input
                                        type="text"
                                        name="zip"
                                        value={formData.zip}
                                        onChange={handleChange}
                                        placeholder="Zip"
                                        required
                                        pattern="[0-9]*"
                                        autoComplete="postal-code"
                                    />
                                </div>
                            </div>

                            <div className="form-group full">
                                <label>Description</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} rows="4"></textarea>
                            </div>

                            <div className="form-group full">
                                <label>Photos</label>
                                <div className="upload-box">
                                    {formData.image_url ? (
                                        <div style={{ position: 'relative' }}>
                                            <img src={formData.image_url} alt="Preview" style={{ width: '100%', borderRadius: '8px', maxHeight: '300px', objectFit: 'cover' }} />
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation(); // Prevent file input click
                                                    setFormData({ ...formData, image_url: '' });
                                                }}
                                                style={{
                                                    position: 'absolute',
                                                    top: '10px',
                                                    right: '10px',
                                                    background: 'rgba(239, 68, 68, 0.9)',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '50%',
                                                    width: '32px',
                                                    height: '32px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    zIndex: 20 // Above file input
                                                }}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ) : (
                                        <span>Click to upload new image</span>
                                    )}
                                    <input type="file" onChange={handleImageUpload} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', zIndex: 10 }} />
                                </div>
                            </div>

                            <div className="form-group full">
                                <label>Walkaround Video</label>
                                <div className="upload-box">
                                    {formData.video_url ? (
                                        <div style={{ position: 'relative' }}>
                                            <video src={formData.video_url} controls style={{ width: '100%', borderRadius: '8px', maxHeight: '300px' }} />
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setFormData({ ...formData, video_url: '' });
                                                }}
                                                style={{
                                                    position: 'absolute',
                                                    top: '10px',
                                                    right: '10px',
                                                    background: 'rgba(239, 68, 68, 0.9)',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '50%',
                                                    width: '32px',
                                                    height: '32px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    zIndex: 20
                                                }}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ) : (
                                        <span>Click to upload video</span>
                                    )}
                                    <input type="file" accept="video/*" onChange={handleVideoUpload} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', zIndex: 10 }} />
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
