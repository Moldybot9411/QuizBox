export const corsHeaders = {
	'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || 'http://localhost:5173',
	'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type',
};
