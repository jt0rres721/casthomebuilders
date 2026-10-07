/* ════════════════════════════════════════════════════════
   CAST HOME BUILDERS — worker.js
   Serves the static site and handles the one backend route
   the scan tool needs: POST /api/submit-scan.
   ════════════════════════════════════════════════════════ */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'POST' && url.pathname === '/api/submit-scan') {
      return handleScanSubmission(request, env);
    }

    return env.ASSETS.fetch(request);
  }
};

async function handleScanSubmission(request, env) {
  let formData;
  try {
    formData = await request.formData();
  } catch {
    return jsonResponse({ error: 'Invalid submission' }, 400);
  }

  const name = (formData.get('name') || '').toString().slice(0, 200);
  const email = (formData.get('email') || '').toString().slice(0, 200);
  const phone = (formData.get('phone') || '').toString().slice(0, 50);
  const address = (formData.get('address') || '').toString().slice(0, 300);
  const photo = formData.get('before_photo');
  const video = formData.get('scan_video');

  if (!email || !phone || !(photo instanceof File) || !(video instanceof File)) {
    return jsonResponse({ error: 'Missing required fields' }, 400);
  }

  const id = crypto.randomUUID();
  const prefix = `scans/${id}`;

  await env.SCAN_BUCKET.put(`${prefix}/before.jpg`, photo, {
    httpMetadata: { contentType: photo.type || 'image/jpeg' }
  });
  await env.SCAN_BUCKET.put(`${prefix}/scan.webm`, video, {
    httpMetadata: { contentType: video.type || 'video/webm' }
  });
  await env.SCAN_BUCKET.put(`${prefix}/info.json`, JSON.stringify({
    name, email, phone, address, submittedAt: new Date().toISOString()
  }), { httpMetadata: { contentType: 'application/json' } });

  try {
    await sendNotificationEmail(env, { id, name, email, phone, address });
  } catch {
    // Files are already saved in R2 even if the notification email fails,
    // so don't fail the user's submission over it.
  }

  return jsonResponse({ ok: true });
}

async function sendNotificationEmail(env, { id, name, email, phone, address }) {
  if (!env.RESEND_API_KEY) return;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: env.NOTIFY_FROM_EMAIL || 'CAST Scan Tool <onboarding@resend.dev>',
      to: env.NOTIFY_TO_EMAIL || 'info@casthomebuilders.com',
      subject: `New bathroom scan — ${name || 'Unknown'}`,
      text: [
        'A new bathroom scan was submitted.',
        '',
        `Name: ${name}`,
        `Email: ${email}`,
        `Phone: ${phone}`,
        `Address: ${address || '(not provided)'}`,
        '',
        `R2 path: scans/${id}/`,
        'Open the R2 bucket in the Cloudflare dashboard to download the before photo and scan video.'
      ].join('\n')
    })
  });
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
