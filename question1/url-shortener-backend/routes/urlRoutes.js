import express from 'express';
import { createShortUrl, getShortUrl, redirectShortUrl } from '../controllers/urlController.js';

const router = express.Router();

router.post('/shorturls', createShortUrl);
router.get('/shorturls/:shortcode', getShortUrl);
router.get('/:shortcode', redirectShortUrl);

export default router;