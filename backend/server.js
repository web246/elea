const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { env } = require('./config');
const { createBookingHandler } = require('./controllers/bookingController');
const { getAdminHandlers } = require('./controllers/adminController');

const upload = multer({ storage: multer.memoryStorage() });

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple admin auth middleware: supports Bearer token via `ADMIN_TOKEN` or Basic auth via `ADMIN_USER`/`ADMIN_PASS`.
function isAdminAuthenticated(req) {
	const authHeader = req.headers.authorization || '';
	const tokenHeader = req.headers['x-admin-token'] || req.query?.admin_token;
	// Token match
	if (tokenHeader && tokenHeader === env.adminToken) return true;
	// Bearer token
	if (authHeader && authHeader.startsWith('Bearer ')) {
		const token = authHeader.slice(7).trim();
		if (env.adminToken && token === env.adminToken) return true;
	}
	// Basic auth
	if (authHeader && authHeader.startsWith('Basic ')) {
		try {
			const cred = Buffer.from(authHeader.slice(6).trim(), 'base64').toString('utf8');
			const idx = cred.indexOf(':');
			const user = idx >= 0 ? cred.slice(0, idx) : cred;
			const pass = idx >= 0 ? cred.slice(idx + 1) : '';
			if (env.adminUser && env.adminPass && user === env.adminUser && pass === env.adminPass) return true;
		} catch (e) { /* ignore */ }
	}
	return false;
}

function requireAdminAuth(req, res, next) {
	// If no admin credentials configured, deny by default to avoid accidental exposure
	if (!env.adminToken && !(env.adminUser && env.adminPass)) {
		return res.status(403).json({ ok: false, message: 'Admin authentication not configured' });
	}
	if (isAdminAuthenticated(req)) return next();
	res.set('WWW-Authenticate', 'Basic realm="Admin Area"');
	return res.status(401).json({ ok: false, message: 'Unauthorized' });
}

app.get('/health', (_req, res) => res.json({ ok: true }));

// Booking endpoint accepts multipart form-data with optional files field
app.post('/api/bookings', upload.array('files'), async (req, res) => {
	try {
		await createBookingHandler(req, res);
	} catch (err) {
		console.error('Booking handler error:', err);
		res.status(500).json({ ok: false, message: 'Internal server error' });
	}
});

const admin = getAdminHandlers();
// Protect admin routes
app.use('/api/admin', requireAdminAuth);
app.get('/api/admin/bookings', admin.getBookings);
app.get('/api/admin/customers', admin.getCustomers);
app.get('/api/admin/users', admin.getAllUsers);
app.get('/api/admin/uploads', admin.getUploads);

const port = env.port || 4001;
app.listen(port, () => {
	console.log(`ELEA backend listening on port ${port}`);
});
