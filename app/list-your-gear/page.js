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

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login?message=Please log in to list your gear');
        } else {
          // Add a small artificial delay to prevent flicker if desired, or just set loading
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
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="offroad">Offroad</option>
                  <option value="water">Watersports</option>
                  <option value="trailers">Trailers</option>
                  <option value="housing">Tools</option>
                </select>
              </div>

              <div className="form-group">
                <label>Subcategory</label>
                <select name="subcategory" required>
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
                <label>Year, Make, & Model (Required)</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <input type="number" name="year" placeholder="Year" required />
                  <input type="text" name="make" placeholder="Make" required />
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
                    <input type="text" placeholder="Seat Height" onChange={(e) => {
                      const specs = { ...JSON.parse(document.getElementsByName('specs')[0]?.value || '{}'), seat_height: e.target.value };
                      document.getElementsByName('specs')[0].value = JSON.stringify(specs);
                    }} />
                  </div>
                </div>
              )}

              {selectedCategory === 'water' && (
                <div className="form-group full">
                  <label>Watercraft Specs</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <input type="number" placeholder="Passenger Capacity" onChange={(e) => {
                      const specs = { ...JSON.parse(document.getElementsByName('specs')[0]?.value || '{}'), capacity: e.target.value };
                      document.getElementsByName('specs')[0].value = JSON.stringify(specs);
                    }} />
                    <input type="text" placeholder="Horsepower" onChange={(e) => {
                      const specs = { ...JSON.parse(document.getElementsByName('specs')[0]?.value || '{}'), horsepower: e.target.value };
                      document.getElementsByName('specs')[0].value = JSON.stringify(specs);
                    }} />
                    <input type="text" placeholder="Ball Hitch Size (if trailer incl.)" onChange={(e) => {
                      const specs = { ...JSON.parse(document.getElementsByName('specs')[0]?.value || '{}'), hitch_size: e.target.value };
                      document.getElementsByName('specs')[0].value = JSON.stringify(specs);
                    }} />
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

              <input type="hidden" name="specs" />

              <div className="form-group full">
                <label>Rules & Requirements</label>
                <textarea name="rules" rows="2" placeholder="e.g. Must have 3/4 ton truck, Age 25+, etc." />
              </div>

              <div className="form-group">
                <label>Daily Price ($)</label>
                <input type="number" name="price" placeholder="150" required />
              </div>

              <div className="form-group">
                <label>Weekend Rate ($/night)</label>
                <input type="number" name="weekend_price" placeholder="Optional (e.g. 200)" />
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
                    <input type="text" name="storage_address" placeholder="If different from pickup" />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Zip Code</label>
                <input type="text" name="location" placeholder="e.g. 83646" required pattern="[0-9]*" />
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

            <div className="form-actions">
              <button type="submit" className="btn btn-primary btn-lg" disabled={uploading}>Create Listing</button>
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
      `}</style>
    </div>
  );
}
