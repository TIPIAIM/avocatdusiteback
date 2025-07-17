//userControllerc.js
const Session = require("../models/Session");
require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const logger = require("../logger/logger"); // Winston logger
const Userc = require("../models/Userc");
const validator = require("validator"); // Ajoute ce require en haut du fichier

const nodemailer = require("nodemailer");
// Configuration Nodemailer (à adapter si besoin)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const register = async (req, res) => {
  try {
    // ===> 1. Validation des entrées utilisateur <===
    const nameRegex = /^[A-Za-zÀ-ÿ' -]{2,50}$/;
    if (!req.body.name || !nameRegex.test(req.body.name.trim())) {
      return res.status(400).json({
        message:
          "Le nom ne doit contenir que des lettres, espaces ou tirets (pas de caractères spéciaux ou chiffres).",
      });
    }
    if (!req.body.email || !validator.isEmail(req.body.email)) {
      return res.status(400).json({ message: "Adresse email invalide." });
    }
    if (!req.body.password || req.body.password.length < 8) {
      return res.status(400).json({
        message: "Le mot de passe doit contenir au moins 8 caractères.",
      });
    }
    const { name, email, password } = req.body;

    // Génération code et expiration (15 min)
    const verificationCode = Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase();
    const verificationCodeExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    let user = await Userc.findOne({ email });

    if (user) {
      if (user.isVerified) {
        logger.warn(`[REGISTER] Email déjà vérifié : ${email}`);
        return res.status(400).json({ message: "Email déjà vérifié" });
      }
      if (user.verificationCodeExpiresAt > new Date()) {
        logger.warn(`[REGISTER] Nouveau code trop tôt pour : ${email}`);
        return res.status(400).json({
          message: "Un code vous a déjà été envoyé, attendez l’expiration...",
        });
      }
      user.name = name;
      user.password = password; // hashing géré par pre-save
      user.verificationCode = verificationCode;
      user.verificationCodeExpiresAt = verificationCodeExpiresAt;
      await user.save();
      logger.info(
        `[REGISTER] Utilisateur existant, nouveau code généré : ${email}`
      );
    } else {
      user = new Userc({
        name,
        email,
        password,
        verificationCode,
        verificationCodeExpiresAt,
      });
      await user.save();
      logger.info(`[REGISTER] Nouvel utilisateur créé : ${email}`);
    }

    // Envoi du mail de vérification
    const mailOptions = {
      from: `"AOD Avocat" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Votre code de vérification - AOD Avocat",
      html: `
        <div style="background:#f6f8fb;padding:40px 0;font-family:'Segoe UI',Arial,sans-serif;">
          <div style="max-width:470px;margin:0 auto;background:#fff;border-radius:18px;box-shadow:0 8px 32px #2e44a124;padding:36px 24px 28px 24px;">
           
          <div style="text-align:center;">
              <img 
              src="https://res.cloudinary.com/dueu8nf5j/image/upload/v1751718544/aodblanc_mtfnec.avif",
              alt="AOD Avocat"
              style="height:62px;margin-bottom:16px;" />
          </div>

            <h2 style="color:#2e44a1;font-size:1.33em;text-align:center;margin:0 0 14px 0;letter-spacing:0.05em;font-weight:800;">
              Vérification sécurisée de votre identité ${
                name ? " " + name : ""
              },
            </h2>
            
            <p style="color:#4e5b79;margin:0 0 22px 0;">
              Voici votre code de vérification afin de pouvoir accéder à votre espace sécurisé <b>AOD Avocat</b> :
            </p>
            <div style="
              display:flex;justify-content:center;align-items:center;
              margin:28px 0 18px 0;
            ">
              <span style="
                background:linear-gradient(90deg,#f1f5ff,#e7eefe);
                border-radius:12px;
                font-size:2em;
                font-weight:700;
                letter-spacing:9px;
                color:#2e44a1;
                padding:17px 36px;
                border:2.3px dashed #4e6ecc;
                box-shadow:0 3px 12px #2e44a128;
                user-select:all;
              ">
                ${verificationCode}
              </span>

            </div>
            <div style="text-align:center;margin:12px 0 18px 0;">
              <a href="https://www.aod-avocats.com/confimation-mail" style="
                display:inline-block;
                background:#2e44a1;
                color:#fff;
                border-radius:7px;
                font-weight:700;
                font-size:1.07em;
                padding:10px 34px;
                text-decoration:none;
                letter-spacing:0.04em;
                box-shadow:0 2px 8px #4e6ecc23;
                transition:background 0.15s;
              "
              onmouseover="this.style.background='#e53935';"
              onmouseout="this.style.background='#2e44a1';"
              >Se connecter</a>
            </div>

            <div style="background:#f6f8fb;border-radius:12px;padding:13px 18px;margin:20px 0 15px 0;display:flex;align-items:flex-start;gap:12px;">
               <div style="color:#1c2236;font-size:1.01em;">
                <b>Important :</b> Ce code est personnel, confidentiel, et <span style="color:#e53935;font-weight:700;">valable uniquement 15 minutes</span>.
                <br />Ne le communiquez à <u>personne</u>, même pas à un membre du cabinet.
              </div>
            </div>

            <div style="background:#fff5f5;border-radius:9px;padding:10px 15px 8px 15px;color:#d32f2f;font-size:0.99em;margin-bottom:13px;">
              <b>Attention :</b> Si vous n’êtes pas à l’origine de cette demande, ignorez ce message ou contactez-nous immédiatement.
            </div>

            <div style="text-align:center;margin-top:18px;color:#7d8597;font-size:0.96em;">
              — L’équipe <b>AOD Avocat</b><br/>
              <a href="https://www.aodavocat.com" style="color:#2e44a1;text-decoration:none;">www.aodavocat.com</a>
            </div>
            
          </div>
        </div>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        logger.error(
          `[REGISTER] Erreur envoi mail à ${email} : ${error.message}`
        );
        return res.status(500).json({ message: "Échec de l'envoi du mail" });
      }
      logger.info(`[REGISTER] Email vérification envoyé à ${email}`);
      res.status(201).json({
        message: "Code de vérification envoyé. Vérifiez votre email.",
        success: true,
      });
    });
  } catch (error) {
    logger.error(`[REGISTER] Exception : ${error.message}`, {
      stack: error.stack,
    });
    res.status(500).json({ error: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await Userc.findById(req.user.id).select("-password -__v");
    if (!user)
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const updateMe = async (req, res) => {
  try {
    // Ne mets à jour que les champs autorisés
    const fields = ["name", "prenom", "email", "tel", "profession"];
    const updateData = {};
    fields.forEach((key) => {
      if (req.body[key] !== undefined) updateData[key] = req.body[key];
    });
    if (req.file) {
      updateData.photo = `/uploads/profiles/${req.file.filename}`;
    }
    const user = await Userc.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
      select: "-password -__v",
    });
    if (!user)
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { verificationCode } = req.body;
    const user = await Userc.findOne({ verificationCode: verificationCode });

    if (!user) {
      logger.warn(`[VERIFYEMAIL] Code invalide : ${verificationCode}`);
      return res.status(400).json({ message: "Invalid verification code" });
    }
    if (user.verificationCodeExpiresAt < new Date()) {
      logger.warn(`[VERIFYEMAIL] Code expiré pour ${user.email}`);
      return res
        .status(400)
        .json({ message: "Code expiré. Veuillez vous réinscrire." });
    }
    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpiresAt = undefined;
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "5h" }
    );
    logger.info(`[VERIFYEMAIL] Email vérifié pour : ${user.email}`);
    res.status(200).json({
      message: "Email verified successfully",
      success: true,
      token: token,
    });
  } catch (error) {
    logger.error(`[VERIFYEMAIL] Exception : ${error.message}`, {
      stack: error.stack,
    });
    res.status(500).json({ error: error.message });
  }
};
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // 1️⃣ — Recherche de l'utilisateur
    const user = await Userc.findOne({ email, isVerified: true });
    // 2️⃣ — Empêcher connexion si désactivé OU utilisateur inexistant/non vérifié
    if (!user || user.active === false) {
      return res
        .status(400)
        .json({ message: "Compte désactivé ou non vérifié." });
    }
    // Validation stricte (anti XSS / injections)
    if (!email || !emailRegex.test(email.trim())) {
      return res.status(400).json({ message: "Format d'email invalide." });
    }
    if (!password || password.length < 8) {
      return res.status(400).json({
        message: "Le mot de passe doit contenir au moins 8 caractères.",
      });
    }

    const userc = await Userc.findOne({ email, isVerified: true });

    if (!userc) {
      logger.warn(
        `[LOGIN] Tentative de login email non trouvé/non vérifié : ${email}`
      );
      return res
        .status(400)
        .json({ message: "Utilisateur non trouvé ou non vérifié" });
    }

    const isMatch = await userc.comparePassword(password);
    if (!isMatch) {
      logger.warn(`[LOGIN] Mot de passe incorrect pour : ${email}`);
      return res.status(400).json({ message: "Mot de passe incorrect" });
    }

    const token = jwt.sign(
      { id: userc._id, email: userc.email, role: userc.role },
      process.env.JWT_SECRET,
      { expiresIn: "5h" }
    );
    await Session.create({
      userId: userc._id,
      token: token,
      connectedAt: new Date(),
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 60 * 60 * 1000
    });
    
    {
      /*
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 60 * 60 * 1000, // 1h
      // path: "/",            // Optionnel, mais utile si ton API n'est pas en racine
    });*/
    }

    logger.info(`[LOGIN] Connexion réussie : ${email}, rôle : ${userc.role}`);
    res.status(200).json({
      user: {
        id: userc._id,
        name: userc.name,
        email: userc.email,
        role: userc.role,
      },
      message: "Connexion réussie",
      redirectTo: userc.role === "admin" ? "/gestion" : "/adminfils",
    });
  } catch (error) {
    logger.error(`[LOGIN] Exception : ${error.message}`, {
      stack: error.stack,
    });
    res.status(500).json({ error: error.message });
  }
};

// Middleware pour sécuriser les routes admin
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    logger.warn(`[ADMIN] Accès refusé à une route admin`);
    return res
      .status(403)
      .json({ message: "Accès refusé : administrateur uniquement." });
  }
  next();
};

// Récupérer tous les utilisateurs
const getUsers = async (req, res) => {
  try {
    const users = await Userc.find();
    logger.info(
      `[ADMIN] Liste utilisateurs récupérée par : ${
        req.user ? req.user.email : "unknown"
      }`
    );
    res.status(200).json(users);
  } catch (error) {
    logger.error(
      `[ADMIN] Erreur récupération utilisateurs : ${error.message}`,
      { stack: error.stack }
    );
    res.status(500).json({ error: error.message });
  }
};

// Récupérer un utilisateur par ID
const getUserById = async (req, res) => {
  try {
    const user = await Userc.findById(req.params.id);
    if (!user) {
      logger.warn(`[ADMIN] Utilisateur non trouvé (ID: ${req.params.id})`);
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    logger.info(
      `[ADMIN] Utilisateur récupéré : ${user.email} (ID: ${user._id})`
    );
    res.status(200).json(user);
  } catch (error) {
    logger.error(`[ADMIN] Erreur récupération utilisateur : ${error.message}`, {
      stack: error.stack,
    });
    res.status(500).json({ error: error.message });
  }
};

// Mettre à jour un utilisateur
const updateUser = async (req, res) => {
  try {
    const { name, email, password, age } = req.body;
    const user = await Userc.findByIdAndUpdate(
      req.params.id,
      { name, email, password, age },
      { new: true }
    );
    if (!user) {
      logger.warn(`[UPDATE] Utilisateur non trouvé (ID: ${req.params.id})`);
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    logger.info(
      `[UPDATE] Utilisateur mis à jour : ${user.email} (ID: ${user._id})`
    );
    res.status(200).json(user);
  } catch (error) {
    logger.error(`[UPDATE] Exception : ${error.message}`, {
      stack: error.stack,
    });
    res.status(500).json({ error: error.message });
  }
};

// Supprimer un utilisateur
const deleteUser = async (req, res) => {
  try {
    const user = await Userc.findByIdAndDelete(req.params.id);
    if (!user) {
      logger.warn(
        `[DELETE] Utilisateur non trouvé pour suppression (ID: ${req.params.id})`
      );
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    logger.info(
      `[DELETE] Utilisateur supprimé : ${user.email} (ID: ${user._id})`
    );
    res.status(200).json({ message: "Utilisateur supprimé avec succès" });
  } catch (error) {
    logger.error(`[DELETE] Exception : ${error.message}`, {
      stack: error.stack,
    });
    res.status(500).json({ error: error.message });
  }
};

const loginAfter2FA = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Userc.findOne({ email, isVerified: true });

    if (!user) {
      logger.warn(`[LOGIN2FA] Utilisateur non trouvé/non vérifié : ${email}`);
      return res
        .status(400)
        .json({ message: "Utilisateur non trouvé ou non vérifié" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn(`[LOGIN2FA] Mot de passe incorrect : ${email}`);
      return res.status(400).json({ message: "Mot de passe incorrect" });
    }
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "5h" }
    );
    {
      /*
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // IMPORTANT: false en local ! true SEULEMENT en HTTPS production
      sameSite: "None", // "Lax" suffit pour du local sur deux ports différents
      maxAge: 60 * 60 * 1000, // 1 heure
    });
      
*/
    }
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 60 * 60 * 1000
    });
    
    logger.info(
      `[LOGIN2FA] Connexion réussie après double authentification : ${email}`
    );
    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      message: "Connexion réussie après double authentification",
    });
  } catch (error) {
    logger.error(`[LOGIN2FA] Exception : ${error.message}`, {
      stack: error.stack,
    });
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateMe,
  isAdmin,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  verifyEmail,
  loginAfter2FA,
};
