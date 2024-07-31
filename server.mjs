import fetch from 'node-fetch';
import express from 'express';

const app = express();
const port = 5000;

app.use(express.static('public'));

const locales = [
    'en-us', 'ar-iq', 'ar-ly', 'ar-sa', 'ar-ww', 'bs-ba', 'en-au', 'en-ca', 'en-cy', 'en-gb',
    'en-hk', 'en-ie', 'en-lb', 'en-lk', 'en-mt', 'en-my', 'en-ng', 'en-nz', 'en-ph', 'en-pk',
    'en-sg', 'en-ww', 'en-za', 'et-ee', 'lt-lt', 'lv-lv', 'ro-md', 'ru-by', 'ru-kz', 'sr-latn-me',
    'vi-vn', 'es-es', 'es-ar', 'es-bo', 'es-co', 'es-cr', 'es-do', 'es-ec', 'es-gt', 'es-hn',
    'es-mx', 'es-ni', 'es-pa', 'es-pr', 'es-py', 'es-sv', 'es-uy', 'es-ve', 'fr-fr', 'fr-be',
    'fr-ca', 'fr-dz', 'fr-ma', 'fr-tn', 'it-it', 'pt-br', 'ko-kr'
];

const getRedirectUrl = async (url) => {
    try {
        const response = await fetch(url, { redirect: 'manual' });
        if (response.status === 301 || response.status === 302) {
            return response.headers.get('location');
        }
        return url;
    } catch (error) {
        console.error(`Error fetching URL ${url}:`, error);
        return 'Error';
    }
};

app.get('/generate', async (req, res) => {
    const baseUrl = req.query.url;
    if (!baseUrl) {
        return res.status(400).send('Base URL is required');
    }

    const url = new URL(baseUrl);
    const domain = url.origin;
    const path = url.pathname;

    try {
        const result = await Promise.all(
            locales.map(async locale => {
                const localeUrl = `${domain}/${locale.toLowerCase()}${path}`;
                const redirectUrl = await getRedirectUrl(localeUrl);
                return { locale, originalUrl: localeUrl, redirectUrl };
            })
        );

        res.json({ urls: result });
    } catch (error) {
        console.error('Error generating URLs:', error);
        res.status(500).send('An error occurred while generating URLs');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
