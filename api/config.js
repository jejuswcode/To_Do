module.exports = function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  // Only public browser keys may leave this endpoint. Never use a service role key.
  let publicKey = key?.startsWith('sb_publishable_');
  if (key && !publicKey) {
    try { publicKey = JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString()).role === 'anon'; } catch {}
  }
  if (!url || !publicKey) return res.status(503).json({ error: 'Vercel의 Supabase URL과 공개 키 환경 변수를 확인해 주세요.' });
  return res.status(200).json({ url, key });
};