const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
require("dotenv").config(); // Charger les variables d'environnement

// Configurer le transporteur email (exemple avec Gmail)
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true pour le port 465, false pour les autres
  auth: {
    //  user: 'alphadiaous@gmail.com', // Votre adresse Gmail complète
    //  pass: 'yxnn rffw kjgu negk' // Le mot de passe d'application généré
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // Important pour contourner les erreurs de certificat
  },
});

router.post("/send-reference-email", async (req, res) => {
  const { to, reference, firstName, lastName } = req.body;
  //      <a href="https://casiergn.vercel.app/voir-mes-demandes?ref=${reference}"

  //      <span style="word-break: break-all;">https://casiergn.vercel.app/voir-mes-demandes?ref=${reference}</span>

  try {
    const mailOptions = {
      from: '"Service Casier Judiciaire" <no-reply@casierjudiciair.gouv>',
      to: to,
      subject: "Votre référence de demande de casier judiciaire",
      html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f7fafc; max-width: 600px; margin: 0 auto; border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.05); overflow: hidden;">
        <div style="background: linear-gradient(90deg, #002B5B 60%, #1A4D2E 100%); color: #FFFFFF; padding: 32px 24px 20px 24px; border-radius: 0 0 24px 24px;">
          <h2 style="margin:0 0 10px 0; font-size: 1.45rem; letter-spacing: 1px;">
            ✅ Demande de casier judiciaire enregistrée
          </h2>
          <div style="font-size: 1.1rem; font-weight: 400; margin-bottom: 0;">
            Bonjour <b>${firstName} ${lastName}</b>,
          </div>
        </div>
        
        <div style="padding: 24px 24px 10px 24px; background: #fff;">
          <p style="font-size:1.08rem; color: #1A4D2E;">
            Nous avons bien reçu votre demande d'extrait de casier judiciaire n°&nbsp;:
          </p>
          <div style="margin: 18px 0; text-align: center;">
            <span style="
              background-color: #F2C94C;
              color: #002B5B;
              padding: 13px 28px;
              border-radius: 8px;
              font-size: 1.3rem;
              font-weight: bold;
              display: inline-block;
              letter-spacing: 2px;
              box-shadow: 0 2px 8px #f2c94c77;">
              ${reference}
            </span>
          </div>
          <div style="margin: 10px 0 0 0; background: #f7fafc; border-left: 2px solid #1A4D2E; padding: 18px 14px 14px 16px; border-radius: 8px;">
            <div style="font-weight:600; color:#002B5B; margin-bottom: 8px;">Pour suivre l’avancement de votre dossier :</div>
            <ol style="margin:0; padding-left: 18px; color: #1A4D2E; font-size:1.06rem;">
              <li style="margin-bottom:8px;">
                <b>Copiez</b> le numéro de référence affiché ci-dessus.
              </li>
              <li style="margin-bottom:8px;">
                Rendez-vous sur&nbsp;
                <a href="https://casiergn.vercel.app" target="_blank" style="color:#1A4D2E; font-weight:600; text-decoration:underline;">
                  https://casiergn.vercel.app
                </a>
              </li>
              <li style="margin-bottom:8px;">
                Cliquez sur <b>« Commencer »</b> (premier bouton de la page).
              </li>
              <li style="margin-bottom:8px;">
                Cliquez ensuite sur <b>« Voir mes documents de demande »</b>.
              </li>
              <li>
                <b>Collez</b> le numéro dans le champ prévu puis cliquez sur « Vérifier ».
              </li>
            </ol>
          </div>
          
          <p style="font-size: 1rem; margin-top: 24px;">
            <span style="font-weight: 600; color: #002B5B;">Étapes à venir :</span><br>
            <span style="color: #1A4D2E;">
            • Vérification des pièces jointes (2-3 jours ouvrés)<br>
            • Traitement par le greffe<br>
            • Notification du statut par e-mail
            </span>
          </p>
          
          <div style="margin: 28px 0 12px 0; padding: 14px 16px 10px 16px; background: #fffbe9; border: 1px solid #F2C94C; border-radius: 8px;">
            <span style="font-size: 15px; color: #B91C1C; font-weight: 500; font-style: italic;">
              ⚠️ Ce numéro de référence est strictement personnel. Ne le communiquez à personne pour protéger vos informations.
            </span>
          </div>
          
          <div style="margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
            <p style="font-size: 1rem; color: #1A4D2E; margin:0;">
              Pour toute question :
            </p>
            <p style="margin: 7px 0 0 0; font-size: 0.99rem;">
              📞 <a href="tel:+224624138395" style="color:#002B5B; text-decoration:underline;">+224&nbsp;624&nbsp;138&nbsp;395</a><br>
              ✉️ <a href="mailto:contact@casierjudiciair.gouv" style="color:#002B5B; text-decoration:underline;">contact@casierjudiciair.gouv</a>
            </p>
          </div>
          <p style="font-size: 11.5px; color: #6B7280; margin-top: 25px;">
            Ce message est envoyé automatiquement, merci de ne pas y répondre.
          </p>
        </div>
      </div>
    `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Erreur envoi email:", error);
    res.status(500).json({ error: "Erreur lors de l'envoi de l'email" });
  }
});

//Pour là notificàtion de la demande si le stàtut devien terminé
// Configuration du transporteur email (à adapter selon votre configuration)
router.post("/send-status-email", async (req, res) => {
  try {
    const { email, reference, status, fullName } = req.body;
    console.log("Requête reçue pour l'email:", { email, reference, status });

    if (status !== "completed") {
      console.log("Statut non complet - pas d'email envoyé");
      return res.status(400).json({
        success: false,
        message: "Email de notification seulement pour le statut 'completed'",
      });
    }

    const mailOptions = {
      from: `"Service Casier Judiciaire" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `[${reference}] Votre casier judiciaire est prêt`,
      html: `
     <div style="font-family: 'Segoe UI', Roboto, Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
  <div style="background-color: #1A4D2E; color: white; padding: 20px;">
    <h2 style="margin: 0; font-size: 22px;">📄 Votre casier judiciaire est prêt</h2>
  </div>

  <div style="padding: 20px; color: #333;">
    <p style="font-size: 16px;">Bonjour <strong>${fullName}</strong>,</p>

    <p style="font-size: 15px; line-height: 1.6;">
      Nous avons le plaisir de vous informer que votre demande de casier judiciaire portant la référence
      <strong style="color: #1A4D2E;">${reference}</strong> a été traitée avec succès et est désormais <strong>prête à être récupérée</strong>.
    </p>

    <div style="background-color: #F7FAFC; border-left: 5px solid #1A4D2E; padding: 15px; margin: 20px 0; font-size: 15px;">
      <p><strong>📦 Mode de livraison :</strong> ${
        req.body.deliveryMethod || "Non spécifié"
      }</p>
    </div>

    <p style="font-size: 15px;">
      Si vous avez des questions ou si vous souhaitez planifier un retrait, n’hésitez pas à nous contacter.
    </p>

    <p style="margin-top: 25px;">
      Cordialement,<br>
      <strong>Le Service des casiers judiciaires</strong><br>
      ☎️ <a href="tel:+22462413889" style="color: #1A4D2E; text-decoration: none;">+224 625 888 145</a><br>
      ✉️ <a href="mailto:casier@service.gn" style="color: #1A4D2E; text-decoration: none;">casier@service.gn</a>
    </p>
  </div>

  <div style="background-color: #F0F4F8; padding: 15px; font-size: 13px; text-align: center; color: #666;">
    Ce message vous a été envoyé automatiquement. Merci de ne pas y répondre directement.
  </div>
</div>

      `,
    };

    console.log("Envoi de l'email...");
    const info = await transporter.sendMail(mailOptions);
    console.log("Email envoyé:", info.messageId);

    res.status(200).json({
      success: true,
      message: "Email de notification envoyé avec succès",
      messageId: info.messageId,
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'envoi de l'email de notification",
      error: error.message,
    });
  }
});
module.exports = router;
