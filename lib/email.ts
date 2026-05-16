import 'server-only';
import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY;
const fromAddress = process.env.EMAIL_FROM ?? 'Sitges Directorio <noreply@sitges.pro>';
const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

const resend = apiKey ? new Resend(apiKey) : null;

interface SendOpts {
  to: string;
  subject: string;
  html: string;
}

async function send({ to, subject, html }: SendOpts) {
  if (!resend) {
    // En dev sin Resend, loguear y seguir
    // eslint-disable-next-line no-console
    console.log(`[email:noop] to=${to} subject=${subject}\n${html}`);
    return;
  }
  await resend.emails.send({ from: fromAddress, to, subject, html });
}

const wrap = (title: string, body: string) => `
<div style="font-family:Inter,system-ui,sans-serif;max-width:560px;margin:0 auto;padding:32px;color:#111827">
  <div style="display:flex;align-items:center;gap:8px;margin-bottom:24px">
    <img src="${appUrl}/brand/logo-mark.svg" width="32" height="32" alt="">
    <strong style="font-size:18px;color:#19562c">Sitges Directorio</strong>
  </div>
  <h1 style="font-size:20px;color:#19562c">${title}</h1>
  ${body}
  <p style="margin-top:32px;color:#6b7280;font-size:12px">
    Si no esperabas este correo, puedes ignorarlo.
  </p>
</div>`;

export async function sendVerificationEmail(to: string, url: string) {
  await send({
    to,
    subject: 'Verifica tu correo — Sitges Directorio',
    html: wrap(
      'Verifica tu correo',
      `<p>Bienvenido. Para activar tu cuenta haz clic en el botón:</p>
       <p style="margin:24px 0"><a href="${url}" style="display:inline-block;background:#21873f;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none">Verificar correo</a></p>
       <p style="font-size:13px;color:#6b7280">o copia esta URL: <br><span style="word-break:break-all">${url}</span></p>`,
    ),
  });
}

export async function sendResetPasswordEmail(to: string, url: string) {
  await send({
    to,
    subject: 'Restablece tu contraseña — Sitges Directorio',
    html: wrap(
      'Restablece tu contraseña',
      `<p>Has solicitado restablecer tu contraseña. Pulsa para continuar:</p>
       <p style="margin:24px 0"><a href="${url}" style="display:inline-block;background:#21873f;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none">Cambiar contraseña</a></p>
       <p style="font-size:13px;color:#6b7280">o copia esta URL: <br><span style="word-break:break-all">${url}</span></p>`,
    ),
  });
}

export async function sendClaimRequestEmail(opts: {
  adminTo: string;
  businessName: string;
  businessUrl: string;
  claimantEmail: string;
  claimantName?: string;
  message?: string;
}) {
  await send({
    to: opts.adminTo,
    subject: `[Claim] ${opts.businessName} — ${opts.claimantEmail}`,
    html: wrap(
      'Solicitud de reclamación',
      `<p><strong>${opts.claimantName ?? opts.claimantEmail}</strong> (${opts.claimantEmail}) quiere reclamar la ficha de <strong>${opts.businessName}</strong>.</p>
       ${opts.message ? `<p><strong>Mensaje:</strong> ${opts.message}</p>` : ''}
       <p style="margin:24px 0"><a href="${opts.businessUrl}" style="display:inline-block;background:#21873f;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none">Ver ficha</a></p>`,
    ),
  });
}

export async function sendBusinessStatusEmail(opts: {
  to: string;
  businessName: string;
  status: 'PUBLISHED' | 'REJECTED';
  url: string;
  reason?: string;
}) {
  const titles = {
    PUBLISHED: '¡Tu negocio está publicado!',
    REJECTED: 'Tu negocio necesita revisión',
  };
  const bodies = {
    PUBLISHED: `<p>El anuncio de <strong>${opts.businessName}</strong> ya está visible en Sitges Directorio.</p>
       <p style="margin:24px 0"><a href="${opts.url}" style="display:inline-block;background:#21873f;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none">Ver ficha pública</a></p>`,
    REJECTED: `<p>Hemos revisado <strong>${opts.businessName}</strong> y no podemos publicarlo todavía.</p>
       ${opts.reason ? `<p><strong>Motivo:</strong> ${opts.reason}</p>` : ''}
       <p style="margin:24px 0"><a href="${opts.url}" style="display:inline-block;background:#21873f;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none">Editar y reenviar</a></p>`,
  };
  await send({
    to: opts.to,
    subject: `${titles[opts.status]} — ${opts.businessName}`,
    html: wrap(titles[opts.status], bodies[opts.status]),
  });
}
