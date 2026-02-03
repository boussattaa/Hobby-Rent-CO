export async function geocodeLocation(location) {
    if (!location) return null;

    try {
        // Nominatim requires a User-Agent identify your application
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`,
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
                displayName: data[0].display_name // Optional: helpful for debugging
            };
        }

        return null; // No results found
    } catch (error) {
        console.error('Geocoding failed:', error);
        return null; // Fail gracefully
    }
}
