// Invia una mail di conferma (o di errore) dopo ogni tentativo di pubblicazione.
// Usa l'SMTP di Gmail con un App Password: nessun servizio terzo, nessun costo.

import nodemailer from "nodemailer";

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_APP_PASSWORD = process.env.EMAIL_APP_PASSWORD;
const EMAIL_TO = process.env.EMAIL_TO || "fotoroma18@gmail.com";

function transporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user: EMAIL_USER, pass: EMAIL_APP_PASSWORD },
  });
}

export async function notifySuccess(post, result) {
  if (!EMAIL_USER || !EMAIL_APP_PASSWORD) {
    console.log("EMAIL_USER/EMAIL_APP_PASSWORD non impostati: salto l'invio della mail.");
    return;
  }

  await transporter().sendMail({
    from: `"Post scheda business FR18" <${EMAIL_USER}>`,
    to: EMAIL_TO,
    subject: "✅ Nuovo post pubblicato su Google Business Profile",
    text: [
      "È stato pubblicato un nuovo post sulla scheda Google Business Profile di FotoRoma18.",
      "",
      `Foto: ${post.photo.file} (categoria: ${post.photo.category})`,
      `Didascalia: ${post.caption}`,
      `Immagine: ${post.sourceUrl}`,
      "",
      `Riferimento post Google: ${result?.name || "n/d"}`,
    ].join("\n"),
  });

  console.log(`Mail di conferma inviata a ${EMAIL_TO}.`);
}

export async function notifyFailure(error) {
  if (!EMAIL_USER || !EMAIL_APP_PASSWORD) {
    console.log("EMAIL_USER/EMAIL_APP_PASSWORD non impostati: salto l'invio della mail di errore.");
    return;
  }

  try {
    await transporter().sendMail({
      from: `"Post scheda business FR18" <${EMAIL_USER}>`,
      to: EMAIL_TO,
      subject: "⚠️ Pubblicazione post Google Business Profile fallita",
      text: [
        "Il tentativo di pubblicare un post sulla scheda Google Business Profile di FotoRoma18 è fallito.",
        "",
        `Errore: ${error?.message || error}`,
        "",
        "Controlla il log completo su GitHub Actions per i dettagli.",
      ].join("\n"),
    });
    console.log(`Mail di errore inviata a ${EMAIL_TO}.`);
  } catch (mailErr) {
    console.error("Impossibile inviare la mail di errore:", mailErr);
  }
}
