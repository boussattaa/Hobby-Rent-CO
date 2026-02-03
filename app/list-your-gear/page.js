"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

import { createListing } from './actions';
import EarningsCalculator from '@/components/EarningsCalculator';

export default function ListYourGear() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login?message=Please log in to list your gear');
      } else {
        setLoading(false);
      }
    };
    checkUser();
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

  const [imageUrl, setImageUrl] = useState('/images/dirt-hero.png'); // Default fallback
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('offroad');

  const handleImageUpload = async (e) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage.from('items').upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from('items').getPublicUrl(filePath);
      setImageUrl(data.publicUrl);
    } catch (error) {
      alert('Error uploading image: ' + error.message);
    } finally {
      setUploading(false);
    }
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

        {/* Earnings Calculator */}
        <EarningsCalculator />

        <div className="form-wrapper glass">
          <div className="form-header">
            <h1>List Your Gear</h1>
            <p>Ready to list? Fill out the details below.</p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Hidden field to pass the uploaded image URL to the server action */}
            <input type="hidden" name="image_url" value={imageUrl} />

            <div className="form-grid">
              <div className="form-group">
                <label>Category</label>
                <select
                  name="category"
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    // Reset subcategory when category changes
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

              <div className="form-group">
                <label>Item Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. 2023 KTM 300 XC"
                  required
                />
              </div>

              <div className="form-group">
                <label>Daily Price ($)</label>
                <input
                  type="number"
                  name="price"
                  placeholder="150"
                  required
                />
              </div>

              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  placeholder="e.g. Moab, UT"
                  required
                />
              </div>

              <div className="form-group full">
                <label>Description</label>
                <textarea
                  name="description"
                  rows="4"
                  placeholder="Describe your item..."
                ></textarea>
              </div>

              <div className="form-group full">
                <label>Photos</label>
                <div className="upload-box">
                  {imageUrl && imageUrl !== '/images/dirt-hero.png' ? (
                    <img src={imageUrl} alt="Uploaded" style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '8px' }} />
                  ) : (
                    <span>{uploading ? 'Uploading...' : 'Click to select an image'}</span>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                  />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary btn-lg" disabled={uploading}>Create Listing</button>
              {errorMsg && <p className="error-message" style={{ color: 'red', marginTop: '1rem' }}>{errorMsg}</p>}
            </div>
          </form>
        </div>
      </div >

      <style jsx>{`
        .list-page {
          min-height: 100vh;
          padding: 4rem 0;
          background-image: 
            radial-gradient(at 10% 10%, rgba(255,255,255,0.8) 0%, transparent 40%),
            radial-gradient(at 90% 90%, rgba(226, 232, 240, 0.8) 0%, transparent 40%);
        }

        .form-wrapper {
          max-width: 800px;
          margin: 0 auto;
          padding: 3rem;
          border-radius: 24px;
          background: white;
          border: 1px solid var(--border-color);
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
        }

        .form-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .form-header h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
        }

        .form-header p {
          color: var(--text-secondary);
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .form-group input, .form-group select, .form-group textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          font-size: 1rem;
          font-family: inherit;
        }
        
        .form-group.full {
          grid-column: 1 / -1;
        }

        .upload-box {
          border: 2px dashed var(--border-color);
          border-radius: 12px;
          padding: 3rem;
          text-align: center;
          color: var(--text-secondary);
          cursor: pointer;
          transition: border-color 0.2s;
          position: relative;
          overflow: hidden;
        }
        .upload-box:hover {
          border-color: var(--accent-color);
          color: var(--accent-color);
        }

        .form-actions {
          text-align: center;
        }

        .btn-lg {
          padding: 1rem 3rem;
          font-size: 1.1rem;
        }

        @media (max-width: 600px) {
          .form-grid {
             grid-template-columns: 1fr;
          }
          .form-wrapper {
            padding: 1.5rem;
          }
        }
      `}</style>
    </div >
  );
}
