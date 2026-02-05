export async function geocodeLocation(location) {
    if (!location) return null;

    try {
        // Nominatim requires a User-Agent identify your application
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1&addressdetails=1`,
            {
                headers: {
                    'User-Agent': 'HobbyRent-App/1.0',
                },
            }
        );

        if (!response.ok) {
            throw new Error(`Geocoding error: ${response.statusText}`);
        }

        const data = await response.json();

        if (data && data.length > 0) {
            return {
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon),
                displayName: data[0].display_name,
                address: data[0].address // { city: '...', state: '...' }
            };
        }

        return null; // No results found
    } catch (error) {
        console.error('Geocoding failed:', error);
        return null; // Fail gracefully
    }
}

export async function reverseGeocode(lat, lng) {
    if (!lat || !lng) return null;

    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            {
                headers: {
                    'User-Agent': 'HobbyRent-App/1.0',
                },
            }
        );

        if (!response.ok) {
            throw new Error(`Reverse geocoding error: ${response.statusText}`);
        }

        const data = await response.json();

        // Extract city/town/village
        const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || 'Current Location';
        const state = data.address?.state;

        return state ? `${city}, ${state}` : city;
    } catch (error) {
        console.error('Reverse geocoding failed:', error);
        return null;
    }
}
