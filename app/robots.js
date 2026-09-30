export default function robots() {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/admin/',
                '/api/',
                '/dashboard/',
                '/inbox/',
                '/checkout/',
                '/earnings/',
                '/my-listings/',
                '/account/',
                '/rentals/',
            ],
        },
        sitemap: 'https://www.hobbyrent.com/sitemap.xml',
    }
}
