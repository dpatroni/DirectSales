import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Natura DirectSales',
        short_name: 'Natura',
        description: 'Catálogo Interactivo Natura',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#F48221', // Primary Orange
        icons: [
            {
                src: '/icon-192x192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icon-512x512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    };
}
