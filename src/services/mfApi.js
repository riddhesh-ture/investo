const BASE_URL = 'https://api.mfapi.in/mf';

/**
 * Fetch the full list of all mutual fund schemes.
 * Returns an array of { schemeCode, schemeName }.
 */
export async function fetchAllSchemes() {
    const res = await fetch(BASE_URL);
    if (!res.ok) throw new Error('Failed to fetch mutual fund list');
    return res.json();
}

/**
 * Fetch detailed info + historical NAV for a single scheme.
 * Returns { meta: { ... }, data: [{ date, nav }] }
 */
export async function fetchSchemeDetails(schemeCode) {
    const res = await fetch(`${BASE_URL}/${schemeCode}`);
    if (!res.ok) throw new Error(`Failed to fetch scheme ${schemeCode}`);
    return res.json();
}

/**
 * Fetch latest NAV for a scheme (first entry in data array).
 */
export async function fetchLatestNav(schemeCode) {
    const details = await fetchSchemeDetails(schemeCode);
    if (details.data && details.data.length > 0) {
        return {
            nav: parseFloat(details.data[0].nav),
            date: details.data[0].date,
            meta: details.meta,
        };
    }
    return null;
}
