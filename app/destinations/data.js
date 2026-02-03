export const DESTINATIONS = {
    'lake-lowell-boat-rentals': {
        title: 'Boat Rentals at Lake Lowell, Idaho | HobbyRent',
        description: 'Find the best boat and jet ski rentals near Lake Lowell. Affordable pontoon, fishing boat, and watersport rentals from local owners.',
        heroImage: '/images/water-hero.png',
        heading: 'Lake Lowell Boat Rentals',
        subheading: 'Explore the Nampa area water refuge with premium local gear.',
        filter: {
            category: 'water',
            location: 'Nampa' // Soft match or radius
        }
    },
    'lucky-peak-jet-ski-rentals': {
        title: 'Lucky Peak Jet Ski & Boat Rentals | HobbyRent',
        description: 'Rent jet skis, surf boats, and tubes for Lucky Peak State Park. minutes from Boise. Book online with verified local owners.',
        heroImage: '/images/water-hero.png', // Ideally specific image
        heading: 'Lucky Peak Reservoir Rentals',
        subheading: 'Your gateway to Sandy Point and Spring Shores fun.',
        filter: {
            category: 'water',
            location: 'Boise'
        }
    },
    'owyhee-dirt-bike-rentals': {
        title: 'Owyhee Front Dirt Bike & ATV Rentals | HobbyRent',
        description: 'Ride the Owyhee Front with rented dirt bikes, ATVs, and UTVs. Hemenway Butte and Rabbit Creek trail ready machines.',
        heroImage: '/images/dirt-hero.png',
        heading: 'Owyhee Desert Off-Road Rentals',
        subheading: 'Conquer the desert with high-performance UTVs and bikes.',
        filter: {
            category: 'offroad',
            location: 'Melba' // or surrounding
        }
    }
};
