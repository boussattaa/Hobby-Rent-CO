"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

import { createListing } from './actions';
import EarningsCalculator from '@/components/EarningsCalculator';

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay, useDroppable } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function ListYourGear() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login?message=Please log in to list your gear');
        } else {
          // Check verification status
          const { data: profile } = await supabase
            .from('profiles')
            .select('is_verified')
            .eq('id', user.id)
            .single();

          setIsVerified(!!profile?.is_verified);
          setLoading(false);
        }
      } catch (e) {
        console.error('Auth check error', e);
        setLoading(false);
      }
    };

    checkUser();

    // Safety timeout
    const timer = setTimeout(() => {
      setLoading(l => {
        if (l) console.warn('Auth check timeout');
        return false;
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [router, supabase]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);
    const result = await createListing(formData);

    if (result?.message) {
      setErrorMsg(result.message);
      setUploading(false);
    }
    // If successful, the action redirects, so we don't need to do anything else.
  };

  // Categories Config
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

  // Trash Bin Component
  const TrashBin = () => {
    const { setNodeRef, isOver } = useDroppable({
      id: 'trash-bin',
    });

    return (
      <div
        ref={setNodeRef}
        className={`trash-bin ${isOver ? 'active' : ''}`}
      >
        <span style={{ fontSize: '1.5rem', marginRight: '8px' }}>🗑️</span>
        {isOver ? 'Drop to Delete' : 'Drag here to Remove'}
      </div>
    );
  };

  // Price Selection Component
  const PriceSelection = () => {
    const [priceType, setPriceType] = useState('daily');

    return (
      <div>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.5rem', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="radio" name="price_type" value="daily" checked={priceType === 'daily'} onChange={() => setPriceType('daily')} style={{ width: 20, height: 20 }} />
              <span style={{ fontWeight: 600 }}>Daily Only</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="radio" name="price_type" value="hourly" checked={priceType === 'hourly'} onChange={() => setPriceType('hourly')} style={{ width: 20, height: 20 }} />
              <span style={{ fontWeight: 600 }}>Hourly Only</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="radio" name="price_type" value="both" checked={priceType === 'both'} onChange={() => setPriceType('both')} style={{ width: 20, height: 20 }} />
              <span style={{ fontWeight: 600 }}>Both (Hourly & Daily)</span>
            </div>
          </label>
        </div>

        {(priceType === 'daily' || priceType === 'both') && (
          <div style={{ marginBottom: '1.5rem', paddingBottom: priceType === 'both' ? '1.5rem' : 0, borderBottom: priceType === 'both' ? '1px dashed #e2e8f0' : 'none' }}>
            <h4 style={{ marginBottom: '1rem', fontSize: '0.9rem', textTransform: 'uppercase', color: '#64748b' }}>Daily Pricing</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="form-group">
                <label>Daily Price ($)</label>
                <input type="number" name="price" placeholder="150" required={priceType !== 'hourly'} />
              </div>
              <div className="form-group">
                <label>Weekend Rate ($/night)</label>
                <input type="number" name="weekend_price" placeholder="Optional" />
              </div>
            </div>
          </div>
        )}

        {(priceType === 'hourly' || priceType === 'both') && (
          <div>
            <h4 style={{ marginBottom: '1rem', fontSize: '0.9rem', textTransform: 'uppercase', color: '#64748b' }}>Hourly Pricing</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="form-group">
                <label>Hourly Rate ($)</label>
                <input type="number" name="hourly_rate" placeholder="50" step="0.01" required={priceType !== 'daily'} />
              </div>
              <div className="form-group">
                <label>Min Duration (Hours)</label>
                <input type="number" name="min_duration" defaultValue="4" min="1" max="24" />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Sortable Item Component
  const SortablePhoto = ({ url, index, onRemove, onMakeMain }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: url });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      zIndex: isDragging ? 20 : 1, // Higher z-index while dragging
      opacity: isDragging ? 0.8 : 1,
    };

    return (
      <div ref={setNodeRef} style={style} className={`img-preview ${index === 0 ? 'main' : ''}`} {...attributes} {...listeners}>
        <img src={url} alt={`Photo ${index}`} />

        {/* Buttons independent of overlay for better touch accessibility */}
        {index !== 0 && (
          <button
            type="button"
            onClick={() => onMakeMain(index)}
            onPointerDown={(e) => e.stopPropagation()} // Stop drag start
            className="action-btn make-main-btn"
          >
            Make Main
          </button>
        )}

        {index === 0 && <span className="badge">Main Photo</span>}

        {/* 'X' button removed as requested by user in favor of Drag-to-Delete */}
      </div>
    );
  };

  const [images, setImages] = useState([]); // If empty, we show placeholder in UI logic if needed, or just empty
  const [videoUrl, setVideoUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('offroad');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [hostAgreement, setHostAgreement] = useState(false);

  // Define which subcategories have engines/motors
  const NON_MOTORIZED_ITEMS = [
    'Kayaks (Single & Tandem)',
    'Stand-Up Paddleboards (SUP)',
    'Canoes',
    'Pedal Boats',
    'Wakeboards',
    'Water Skis',
    'Towable Tubes',
    'Floating Mats/Lilies'
  ];

  // Items that don't need Year field (non-motorized water + most tools)
  const isNonMotorized = NON_MOTORIZED_ITEMS.includes(selectedSubcategory);
  const skipYearField = isNonMotorized || selectedCategory === 'housing';

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over) return;

    // Handle Drop to Trash
    if (over.id === 'trash-bin') {
      const itemToRemove = active.id;
      setImages((items) => items.filter(img => img !== itemToRemove));
      return;
    }

    // Handle Sorting
    if (active.id !== over.id) {
      setImages((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
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
      setVideoUrl(data.publicUrl);
    } catch (error) {
      alert('Error uploading video: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleImageUpload = async (e) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) return;

      const files = Array.from(e.target.files);
      const newImages = [];

      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage.from('items').upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('items').getPublicUrl(filePath);
        newImages.push(data.publicUrl);
      }

      setImages(prev => [...prev, ...newImages]);

    } catch (error) {
      alert('Error uploading image: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const setAsMain = (index) => {
    setImages(prev => {
      const newArr = [...prev];
      const [selected] = newArr.splice(index, 1);
      newArr.unshift(selected); // Move to front
      return newArr;
    });
  };

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '150px', textAlign: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="list-page">
      <div className="container">

        <div className="form-wrapper glass">
          <div className="form-header">
            <h1>List Your Gear</h1>
            <p>Ready to list? Fill out the details below.</p>
          </div>

          {!isVerified && (
            <div className="verification-banner" style={{ background: '#fffbeb', border: '1px solid #fcd34d', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', color: '#92400e' }}>
              <span style={{ fontSize: '1.5rem' }}>⚠️</span>
              <div>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Verification Required</h4>
                <p style={{ margin: '4px 0 0', fontSize: '0.9rem' }}>
                  Your account must be verified to approve listings. <a href="/verify" style={{ textDecoration: 'underline', fontWeight: 'bold', color: '#b45309' }}>Click here to verify now in seconds.</a>
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <input type="hidden" name="image_url" value={images.length > 0 ? images[0] : '/images/dirt-hero.png'} />
            <input type="hidden" name="additional_images" value={JSON.stringify(images.slice(1))} />
            <input type="hidden" name="video_url" value={videoUrl} />

            <div className="form-grid">
              <div className="form-group">
                <label>Category</label>
                <select
                  name="category"
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setSelectedSubcategory(''); // Reset subcategory when category changes
                  }}
                >
                  <option value="offroad">Offroad</option>
                  <option value="water">Watersports</option>
                  <option value="trailers">Trailers</option>
                  <option value="housing">Tools</option>
                </select>
              </div>

              <div className="form-group">
                <label>Subcategory</label>
                <select
                  name="subcategory"
                  required
                  value={selectedSubcategory}
                  onChange={(e) => setSelectedSubcategory(e.target.value)}
                >
                  <option value="">Select a type...</option>
                  {CATEGORY_DATA[selectedCategory]?.map((group) => (
                    <optgroup key={group.group} label={group.group}>
                      {group.items.map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>


              <div className="form-group full">
                <label>{skipYearField ? 'Brand & Model' : 'Year, Make, & Model (Required)'}</label>
                <div style={{ display: 'grid', gridTemplateColumns: skipYearField ? '1fr 1fr' : '1fr 1fr 1fr', gap: '1rem' }}>
                  {!skipYearField && (
                    <input type="number" name="year" placeholder="Year" required />
                  )}
                  <input type="text" name="make" placeholder={skipYearField ? 'Brand (e.g. DeWalt, Honda)' : 'Make'} required />
                  <input type="text" name="model" placeholder="Model" required />
                </div>
              </div>

              {/* Dynamic Specs Section based on Category */}
              {selectedCategory === 'offroad' && (
                <div className="form-group full">
                  <label>Offroad Specs</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <input type="text" placeholder="Engine Size (cc)" onChange={(e) => {
                      const specs = { ...JSON.parse(document.getElementsByName('specs')[0]?.value || '{}'), engine_cc: e.target.value };
                      document.getElementsByName('specs')[0].value = JSON.stringify(specs);
                    }} />
                    <input type="number" placeholder="Seat Capacity" onChange={(e) => {
                      const specs = { ...JSON.parse(document.getElementsByName('specs')[0]?.value || '{}'), seat_capacity: e.target.value };
                      document.getElementsByName('specs')[0].value = JSON.stringify(specs);
                    }} />
                  </div>
                </div>
              )}

              {/* ... Water and Trailer sections remain same ... */}
              {selectedCategory === 'water' && (
                <div className="form-group full">
                  <label>{isNonMotorized ? 'Equipment Specs' : 'Watercraft Specs'}</label>
                  <div style={{ display: 'grid', gridTemplateColumns: isNonMotorized ? '1fr 1fr' : '1fr 1fr 1fr', gap: '1rem' }}>
                    <input type="number" placeholder="Capacity (people)" onChange={(e) => {
                      const specs = { ...JSON.parse(document.getElementsByName('specs')[0]?.value || '{}'), capacity: e.target.value };
                      document.getElementsByName('specs')[0].value = JSON.stringify(specs);
                    }} />

                    {isNonMotorized ? (
                      <>
                        <input type="text" placeholder="Length (ft)" onChange={(e) => {
                          const specs = { ...JSON.parse(document.getElementsByName('specs')[0]?.value || '{}'), length: e.target.value };
                          document.getElementsByName('specs')[0].value = JSON.stringify(specs);
                        }} />
                        <input type="text" placeholder="Weight (lbs)" onChange={(e) => {
                          const specs = { ...JSON.parse(document.getElementsByName('specs')[0]?.value || '{}'), weight: e.target.value };
                          document.getElementsByName('specs')[0].value = JSON.stringify(specs);
                        }} />
                        <input type="text" placeholder="Material (e.g. Plastic, Inflatable)" onChange={(e) => {
                          const specs = { ...JSON.parse(document.getElementsByName('specs')[0]?.value || '{}'), material: e.target.value };
                          document.getElementsByName('specs')[0].value = JSON.stringify(specs);
                        }} />
                      </>
                    ) : (
                      <>
                        <input type="text" placeholder="Horsepower" onChange={(e) => {
                          const specs = { ...JSON.parse(document.getElementsByName('specs')[0]?.value || '{}'), horsepower: e.target.value };
                          document.getElementsByName('specs')[0].value = JSON.stringify(specs);
                        }} />
                        <input type="text" placeholder="Ball Hitch Size (if trailer incl.)" onChange={(e) => {
                          const specs = { ...JSON.parse(document.getElementsByName('specs')[0]?.value || '{}'), hitch_size: e.target.value };
                          document.getElementsByName('specs')[0].value = JSON.stringify(specs);
                        }} />
                      </>
                    )}
                  </div>
                </div>
              )}

              {selectedCategory === 'trailers' && (
                <div className="form-group full">
                  <label>Trailer Specs</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <input type="text" placeholder="Towing Capacity (lbs)" onChange={(e) => {
                      const specs = { ...JSON.parse(document.getElementsByName('specs')[0]?.value || '{}'), towing_capacity: e.target.value };
                      document.getElementsByName('specs')[0].value = JSON.stringify(specs);
                    }} />
                    <input type="text" placeholder="Ball Hitch Size (e.g. 2 inch)" onChange={(e) => {
                      const specs = { ...JSON.parse(document.getElementsByName('specs')[0]?.value || '{}'), hitch_size: e.target.value };
                      document.getElementsByName('specs')[0].value = JSON.stringify(specs);
                    }} />
                  </div>
                </div>
              )}

              {selectedCategory === 'housing' && (
                <div className="form-group full">
                  <label>Tool/Equipment Specs</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <select onChange={(e) => {
                      const specs = { ...JSON.parse(document.getElementsByName('specs')[0]?.value || '{}'), power_source: e.target.value };
                      document.getElementsByName('specs')[0].value = JSON.stringify(specs);
                    }}>
                      <option value="">Power Source</option>
                      <option value="Gas">Gas</option>
                      <option value="Electric (Corded)">Electric (Corded)</option>
                      <option value="Electric (Battery)">Electric (Battery)</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Manual">Manual/Hand-Powered</option>
                    </select>
                    <input type="text" placeholder="Weight (lbs)" onChange={(e) => {
                      const specs = { ...JSON.parse(document.getElementsByName('specs')[0]?.value || '{}'), weight: e.target.value };
                      document.getElementsByName('specs')[0].value = JSON.stringify(specs);
                    }} />
                    <input type="text" placeholder="Power Requirements (e.g. 120V, 240V)" onChange={(e) => {
                      const specs = { ...JSON.parse(document.getElementsByName('specs')[0]?.value || '{}'), power_requirements: e.target.value };
                      document.getElementsByName('specs')[0].value = JSON.stringify(specs);
                    }} />
                  </div>
                </div>
              )}

              <input type="hidden" name="specs" />

              <div className="form-group full">
                <label>Rules & Requirements</label>
                <textarea name="rules" rows="2" placeholder="e.g. Must have 3/4 ton truck, Age 25+, etc." />
              </div>

              <div className="form-group full">
                <label>Pricing Model</label>
                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <PriceSelection />

                  <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px dashed #e2e8f0' }}>
                    <label className="toggle-label" style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                      <div className="switch">
                        <input type="checkbox" name="instant_book" />
                        <span className="slider round"></span>
                      </div>
                      <div>
                        <span style={{ fontWeight: 700, display: 'block' }}>⚡ Instant Book</span>
                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>If enabled, bookings are automatically accepted without your manual approval.</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Private Owner Details Section */}
              <div style={{ gridColumn: '1 / -1', marginTop: '1rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#475569' }}>🔒 Private Owner Details (Only you see this)</h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label style={{ fontSize: '0.9rem' }}>VIN / Serial #</label>
                    <input type="text" name="vin" placeholder="Private Record" />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: '0.9rem' }}>License Plate</label>
                    <input type="text" name="license_plate" placeholder="Private Record" />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: '0.9rem' }}>Insurance Policy #</label>
                    <input type="text" name="insurance_policy" placeholder="Policy Number" />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: '0.9rem' }}>Storage Address</label>
                    <input
                      type="text"
                      name="storage_address"
                      placeholder="Street Address (e.g. 123 Trail Lane)"
                      autoComplete="street-address"
                    />
                    <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem', fontStyle: 'italic' }}>
                      🔒 This address is hidden from the public. It will only be revealed to renters after you approve their booking.
                    </p>
                  </div>
                </div>
              </div>

              <div className="form-group full">
                <label>Location (Public)</label>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    required
                    autoComplete="address-level2"
                  />
                  <select name="state" required autoComplete="address-level1" style={{ fontSize: '1rem' }}>
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
                    placeholder="Zip"
                    required
                    pattern="[0-9]*"
                    autoComplete="postal-code"
                  />
                </div>
              </div>

              <div className="form-group full">
                <label>Description</label>
                <textarea name="description" rows="4" placeholder="Describe your item..."></textarea>
              </div>

              <div className="form-group full">
                <label>Photos (Drag Image to Trash to Remove)</label>

                <div className="gallery-preview" style={{ marginBottom: '1rem' }}>
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={images} strategy={rectSortingStrategy}>
                      {images.map((url, idx) => (
                        <SortablePhoto key={url} url={url} index={idx} onRemove={removeImage} onMakeMain={setAsMain} />
                      ))}
                    </SortableContext>

                    {/* Trash Bin is part of DndContext but outside SortableContext */}
                    {images.length > 0 && (
                      <div style={{ width: '100%', marginTop: '1rem' }}>
                        <TrashBin />
                      </div>
                    )}
                  </DndContext>

                  {images.length === 0 && (
                    <div style={{ padding: '2rem', color: '#999', fontStyle: 'italic', width: '100%', textAlign: 'center' }}>
                      No photos selected.
                    </div>
                  )}
                </div>

                <div className="upload-box">
                  <div style={{ color: '#666' }}>{uploading ? 'Uploading...' : 'Click or Drag to Upload Photos'}</div>
                  <input type="file" accept="image/*" multiple onChange={handleImageUpload} disabled={uploading} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
                </div>
              </div>

              <div className="form-group full">
                <label>Walkaround Video (15s max)</label>
                <div className="upload-box">
                  {videoUrl ? (
                    <video src={videoUrl} controls style={{ width: '100%', maxHeight: '300px', borderRadius: '8px' }} />
                  ) : (
                    <span>{uploading ? 'Uploading...' : 'Click to upload a video'}</span>
                  )}
                  <input type="file" accept="video/*" onChange={handleVideoUpload} disabled={uploading} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
                </div>
              </div>
            </div>

            {/* Host Commitments & Responsibilities Section */}
            <div className="form-group full" style={{ marginTop: '2rem' }}>
              <div className="host-agreement-container">
                <h3 className="section-title">Host Commitments & Responsibilities</h3>
                <div className="host-terms-box">
                  <div className="term-item">
                    <h5>1. Safety & Legality</h5>
                    <p><strong>Safe Condition:</strong> You commit to providing equipment that is safe, mechanically sound, and free of known defects (e.g., bald tires, bad brakes).</p>
                    <p><strong>Legal Authority:</strong> You certify that you own the item or have explicit legal authority to rent it out.</p>
                    <p><strong>Maintenance:</strong> You have performed all manufacturer-recommended maintenance.</p>
                  </div>
                  <div className="term-item">
                    <h5>2. The Rental Process</h5>
                    <p><strong>Instruction:</strong> You will provide the Renter with a walkthrough of controls and safety features before handover.</p>
                    <p><strong>Verification:</strong> You are responsible for physically verifying the Renter's ID and age at pickup.</p>
                  </div>
                  <div className="term-item">
                    <h5>3. Insurance & Risk</h5>
                    <p><strong>Personal Policy Warning:</strong> You acknowledge that your personal insurance (Home/Auto) likely does NOT cover commercial rental activity.</p>
                    <p><strong>Assumption of Risk:</strong> Unless you have a specific commercial policy or Protection Plan, you assume the risk of renting to third parties.</p>
                  </div>
                  <div className="term-item">
                    <h5>4. Payments & Earnings</h5>
                    <p><strong>Stripe:</strong> You agree to the Stripe Connected Account Agreement for payment processing.</p>
                    <p><strong>Indemnification:</strong> You agree to defend and hold HobbyRent harmless from claims arising from your failure to maintain your equipment.</p>
                  </div>
                </div>

                <div className="agreement-checkbox-wrapper">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      required
                      checked={hostAgreement}
                      onChange={(e) => setHostAgreement(e.target.checked)}
                    />
                    <div className="checkbox-text">
                      <strong>Host Agreement:</strong> By listing this item, I certify that:
                      <ul>
                        <li>I own this vehicle/item or have legal authority to rent it out.</li>
                        <li>It is in safe, mechanical condition and has no open safety recalls.</li>
                        <li>I understand I must verify the renter's ID physically at pickup.</li>
                        <li>I agree to the <a href="/terms" target="_blank">Terms of Service</a> and <a href="https://stripe.com/connect-account/legal" target="_blank">Stripe Connected Account Agreement</a></li>
                      </ul>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={uploading || !hostAgreement}
              >
                {uploading ? 'Processing...' : 'Create Listing'}
              </button>
              {!hostAgreement && <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem' }}>Please agree to the host responsibilities to proceed.</p>}
              {errorMsg && <p className="error-message" style={{ color: 'red', marginTop: '1rem' }}>{errorMsg}</p>}
            </div>
          </form>
        </div>
      </div>

      <div style={{ marginTop: '4rem' }}>
        <EarningsCalculator />
      </div>

      <style jsx global>{`
        .list-page {
          min-height: 100vh;
          padding: 4rem 0;
          background-image: 
            radial-gradient(at 10% 10%, rgba(255,255,255,0.8) 0%, transparent 40%),
            radial-gradient(at 90% 90%, rgba(226, 232, 240, 0.8) 0%, transparent 40%);
        }

        .list-page .form-wrapper {
          max-width: 800px;
          margin: 0 auto;
          padding: 3rem;
          border-radius: 24px;
          background: white;
          border: 1px solid var(--border-color);
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
        }

        .list-page .form-header { text-align: center; margin-bottom: 3rem; }
        .list-page .form-header h1 { font-size: 2.5rem; margin-bottom: 0.5rem; }
        .list-page .form-header p { color: var(--text-secondary); }

        .list-page .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem; }
        .list-page .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 600; color: var(--text-primary); }
        .list-page .form-group input, .list-page .form-group select, .list-page .form-group textarea {
          width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 8px; font-size: 1rem; font-family: inherit;
        }
        .list-page .form-group.full { grid-column: 1 / -1; }

        .list-page .upload-box {
          border: 2px dashed var(--border-color); border-radius: 12px; padding: 2rem; text-align: center;
          color: var(--text-secondary); cursor: pointer; transition: border-color 0.2s; position: relative; overflow: hidden;
        }
        .list-page .upload-box:hover { border-color: var(--accent-color); color: var(--accent-color); }

        .list-page .form-actions { text-align: center; }
        .list-page .btn-lg { padding: 1rem 3rem; font-size: 1.1rem; }

        @media (max-width: 600px) {
          .list-page .form-grid { grid-template-columns: 1fr; }
          .list-page .form-wrapper { padding: 1.5rem; }
        }

        .list-page .gallery-preview {
            display: flex; flex-wrap: wrap; gap: 12px; justify-content: center;
        }
        .list-page .img-preview {
            width: 130px; /* Increased size for mobile */
            height: 130px;
            border-radius: 12px;
            overflow: hidden;
            position: relative;
            border: 2px solid #cbd5e1;
            background: white;
            touch-action: none;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .list-page .img-preview img {
            width: 100%; height: 100%; object-fit: cover; pointer-events: none;
        }
        .list-page .img-preview.main {
            border: 3px solid var(--primary-color);
        }
        
        .list-page .badge {
            position: absolute; bottom: 0; left: 0; right: 0;
            background: var(--primary-color); color: white;
            font-size: 0.75rem; font-weight: 600; text-align: center; padding: 4px 0;
            pointer-events: none;
        }

        /* "Make Main" Button - Strip at bottom */
        .list-page .make-main-btn {
            position: absolute; bottom: 0; left: 0; right: 0;
            background: rgba(0,0,0,0.6); color: white; border: none;
            font-size: 0.75rem; text-align: center; padding: 6px 0;
            cursor: pointer; width: 100%; font-weight: 600;
            transition: background 0.2s;
        }
        .list-page .make-main-btn:hover { background: var(--primary-color); }

        /* Trash Bin Styles */
        .list-page .trash-bin {
            width: 100%;
            height: 60px;
            border: 2px dashed #cbd5e1;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #64748b;
            font-weight: 600;
            background: #f8fafc;
            transition: all 0.2s;
        }
        .list-page .trash-bin.active {
            border-color: red;
            background: #fef2f2;
            color: red;
            transform: scale(1.02);
        }

        .host-agreement-container {
          background: #f8fafc;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          padding: 1.5rem;
        }

        .host-agreement-container .section-title {
          font-size: 1.25rem;
          color: #1e293b;
          margin-bottom: 1rem;
          font-weight: 700;
        }

        .host-terms-box {
          max-height: 250px;
          overflow-y: auto;
          background: white;
          padding: 1rem;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .term-item {
          margin-bottom: 1.5rem;
        }

        .term-item h5 {
          color: #0f172a;
          font-size: 1rem;
          margin-bottom: 0.5rem;
          font-weight: 600;
        }

        .term-item p {
          color: #475569;
          margin-bottom: 0.25rem;
        }

        .agreement-checkbox-wrapper {
          padding-top: 1rem;
          border-top: 1px solid #e2e8f0;
        }

        .checkbox-label {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          cursor: pointer;
        }

        .checkbox-label input[type="checkbox"] {
          width: 20px;
          height: 20px;
          margin-top: 4px;
        }

        .checkbox-text {
          color: #1e293b;
          font-size: 0.95rem;
        }

        .checkbox-text ul {
          margin: 0.5rem 0 0 1.25rem;
          padding: 0;
          list-style-type: disc;
          color: #64748b;
          font-size: 0.85rem;
        }

        .checkbox-text li {
          margin-bottom: 0.25rem;
        }

        .checkbox-text a {
          color: #0f172a;
          text-decoration: underline;
          font-weight: 500;
        }

        .host-terms-box::-webkit-scrollbar {
          width: 6px;
        }
        .host-terms-box::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        .host-terms-box::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }

        /* Toggle Switch Styles */
        .switch {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 24px;
          flex-shrink: 0;
        }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: #cbd5e1;
          transition: .4s;
          border-radius: 24px;
        }
        .slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
        }
        input:checked + .slider { background-color: #10b981; }
        input:focus + .slider { box-shadow: 0 0 1px #10b981; }
        input:checked + .slider:before { transform: translateX(26px); }
      `}</style>
    </div>
  );
}
