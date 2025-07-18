import { nanoid } from 'nanoid';
import geoip from 'geoip-lite';
const { lookup } = geoip;
import { isWebUri } from 'valid-url';
import { urls, clicks } from '../models/urlModel.js';
import { isAlphanumeric, getExpiry } from '../utils/helpers.js';

const HOST = 'localhost:3001';

export function createShortUrl(req, res) {
  try {
    const { url, validity = 30, shortcode } = req.body;
    if (!url || !isWebUri(url)) {
      return res.status(400).json({ error: 'Invalid or missing URL.' });
    }
    let code = shortcode;
    if (code) {
      if (!isAlphanumeric(code)) {
        return res.status(400).json({ error: 'Shortcode must be alphanumeric.' });
      }
      if (urls[code]) {
        return res.status(409).json({ error: 'Shortcode already in use.' });
      }
    } else {
      // Ensure unique code
      do {
        code = nanoid(6);
      } while (urls[code]);
    }
    // Ensure validity is a positive number
    const validMinutes = Number(validity) > 0 ? Number(validity) : 30;
    const expiry = getExpiry(validMinutes);
    urls[code] = {
      url,
      createdAt: new Date(),
      expiry,
      clicks: 0
    };
    clicks[code] = [];
    res.status(201).json({
      shortLink: `http://${HOST}/${code}`,
      expiry: expiry.toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
}

export function getShortUrl(req, res) {
  try {
    const { shortcode } = req.params;
    const entry = urls[shortcode];
    if (!entry) {
      return res.status(404).json({ error: 'Shortcode not found.' });
    }
    if (new Date() > new Date(entry.expiry)) {
      return res.status(410).json({ error: 'Shortcode expired.' });
    }
    res.json({
      url: entry.url,
      createdAt: entry.createdAt,
      expiry: entry.expiry,
      totalClicks: entry.clicks,
      clickData: clicks[shortcode]
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
}

export function redirectShortUrl(req, res) {
  try {
    const { shortcode } = req.params;
    const entry = urls[shortcode];
    if (!entry) {
      return res.status(404).json({ error: 'Shortcode not found.' });
    }
    if (new Date() > new Date(entry.expiry)) {
      return res.status(410).json({ error: 'Shortcode expired.' });
    }
    entry.clicks++;
    // Handle proxy headers for real client IP
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || '';
    if (Array.isArray(ip)) ip = ip[0];
    if (typeof ip === 'string' && ip.includes(',')) ip = ip.split(',')[0].trim();
    const geo = lookup(ip) || {};
    clicks[shortcode].push({
      timestamp: new Date(),
      referrer: req.get('referer') || null,
      location: geo.country || null
    });
    res.redirect(entry.url);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
}
