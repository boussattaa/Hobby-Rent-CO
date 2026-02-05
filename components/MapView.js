"use client";

import { useLoadScript, GoogleMap, MarkerF, InfoWindowF } from '@react-google-maps/api';
import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';

import { geocodeLocation } from '@/utils/geocoding';

export default function MapView({ listings }) {
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "", // Use env var
    });

    const [selectedListing, setSelectedListing] = useState(null);
    const [patchedListings, setPatchedListings] = useState(listings || []);
    const mapRef = useRef(null);

    // Effect: Patch missing coordinates on the fly
    useEffect(() => {
        if (!listings) return;

        let isMounted = true;
        // Process ALL listings to ensure privacy jitter is applied
        if (listings.length > 0) {
            console.log(`MapView: Processing ${listings.length} items for privacy radius...`);

            // Create a copy to patch
            // We want to apply jitter to ALL items to simulate the "privacy radius" 
            // even if they already have coordinates from the DB.
            const initialList = [...listings];
            setPatchedListings(initialList);

            Promise.all(initialList.map(async (item) => {
                // If item has no coords, geocode it
                let lat = item.latitude;
                let lng = item.longitude;

                if (!lat || !lng) {
                    if (!item.location) return item;
                    try {
                        const coords = await geocodeLocation(item.location);
                        if (coords) {
                            lat = coords.lat;
                            lng = coords.lng;
                        }
                    } catch (e) {
                        console.error("Geo patch failed for", item.name, e);
                        return item;
                    }
                }

                if (lat && lng) {
                    // Apply Privacy Radius Jitter
                    // User requested ~4-5 mile radius
                    // 1 deg lat = ~69 miles. 4 miles = ~0.058 degrees.
                    // Random offset between -0.06 and +0.06
                    // Use a seeded random or simple deterministic hash based on ID so it doesn't jump on every re-render?
                    // For now, random is fine as re-renders are limited by useEffect dependency
                    const jitter = () => (Math.random() - 0.5) * 0.12;

                    return {
                        ...item,
                        latitude: lat + jitter(),
                        longitude: lng + jitter()
                    };
                }

                return item;
            })).then(results => {
                if (!isMounted) return;

                // Merge populated items back into the main list
                const newMap = new Map(initialList.map(i => [i.id, i]));
                results.forEach(r => {
                    if (r && r.latitude) newMap.set(r.id, r);
                });

                setPatchedListings(Array.from(newMap.values()));
            });
        } else {
            setPatchedListings(listings);
        }

        return () => { isMounted = false; };
    }, [listings]);

    const onLoad = useCallback((map) => {
        mapRef.current = map;

        // Auto-locate once on load if we don't have specific listings to show
        // Or user requested: "Automatically go to person's current location"
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    // Only panic if we didn't already have listings centering the map?
                    // User said: "It should automatically just go to the person's current location"
                    // Let's do it seamlessly.
                    map.panTo(pos);
                    map.setZoom(12);
                },
                (err) => console.log("Auto-location skipped/denied")
            );
        }
    }, []);

    const center = useMemo(() => {
        if (patchedListings && patchedListings.length > 0) {
            // Simple logic: center on first listing with geo
            const first = patchedListings.find(l => l.latitude && l.longitude);
            if (first) return { lat: first.latitude, lng: first.longitude };
        }
        return { lat: 37.7749, lng: -122.4194 }; // Default SF
    }, [patchedListings]);

    if (!isLoaded) return <div className="map-loading">Loading Map...</div>;

    return (
        <div className="map-container">
            <div className="map-controls">
                <button
                    className="locate-btn"
                    onClick={() => {
                        if (navigator.geolocation && mapRef.current) {
                            navigator.geolocation.getCurrentPosition(
                                (position) => {
                                    const pos = {
                                        lat: position.coords.latitude,
                                        lng: position.coords.longitude,
                                    };
                                    mapRef.current.panTo(pos);
                                    mapRef.current.setZoom(12);
                                },
                                () => {
                                    alert("Error: The Geolocation service failed.");
                                }
                            );
                        } else {
                            alert("Error: Your browser doesn't support geolocation.");
                        }
                    }}
                    title="Show my location"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><crosshair cx="12" cy="12" r="10"></crosshair><line x1="12" y1="22" x2="12" y2="18"></line><line x1="12" y1="6" x2="12" y2="2"></line><line x1="6" y1="12" x2="2" y2="12"></line><line x1="22" y1="12" x2="18" y2="12"></line></svg>
                </button>
            </div>

            <GoogleMap
                zoom={10}
                center={center}
                mapContainerClassName="map-frame"
                options={{
                    disableDefaultUI: false,
                    zoomControl: true,
                    streetViewControl: false,
                    mapTypeControl: false,
                }}
                onLoad={onLoad}
            >
                {patchedListings?.map((item) => (
                    item.latitude && item.longitude && (
                        <MarkerF
                            key={item.id}
                            position={{ lat: item.latitude, lng: item.longitude }}
                            onClick={() => setSelectedListing(item)}
                            label={{
                                text: `$${item.price}`,
                                color: "white",
                                fontSize: "12px",
                                fontWeight: "bold"
                            }}
                        />
                    )
                ))}

                {selectedListing && (
                    <InfoWindowF
                        position={{ lat: selectedListing.latitude, lng: selectedListing.longitude }}
                        onCloseClick={() => setSelectedListing(null)}
                    >
                        <div className="map-popup">
                            <div className="popup-img" style={{ backgroundImage: `url(${selectedListing.image_url || '/images/dirt-hero.png'})` }}></div>
                            <div className="popup-info">
                                <h4>{selectedListing.name}</h4>
                                <p>${selectedListing.price}/day</p>
                                <Link href={`/item/${selectedListing.id}`}>View Details</Link>
                            </div>
                        </div>
                    </InfoWindowF>
                )}
            </GoogleMap>

            <style jsx global>{`
        .map-container {
            width: 100%;
            height: 100%;
            border-radius: 12px;
            overflow: hidden;
            position: relative;
        }
        .map-frame {
            width: 100%;
            height: 100%;
        }
        .map-loading {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
            background: #f1f5f9;
            color: #64748b;
        }
        .map-popup {
            min-width: 200px;
        }
        .popup-img {
            width: 100%;
            height: 120px;
            background-size: cover;
            background-position: center;
            border-radius: 6px;
            margin-bottom: 0.5rem;
        }
        .popup-info h4 {
            margin: 0 0 0.25rem;
            font-size: 0.95rem;
        }
        .popup-info p {
            margin: 0 0 0.5rem;
            font-weight: bold;
            color: #16a34a;
        }
        .popup-info a {
            display: block;
            text-align: center;
            background: #0f172a;
            color: white;
            text-decoration: none;
            padding: 0.25rem;
            border-radius: 4px;
            font-size: 0.8rem;
        }

        .map-controls {
            position: absolute;
            top: 10px;
            right: 10px;
            z-index: 50;
        }
        
        .locate-btn {
            background: white;
            border: none;
            width: 40px;
            height: 40px;
            border-radius: 2px;
            box-shadow: rgba(0, 0, 0, 0.3) 0px 1px 4px -1px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #666;
            transition: all 0.2s;
        }
        .locate-btn:hover {
            color: #333;
            background: #f8f8f8;
        }
      `}</style>
        </div>
    );
}
