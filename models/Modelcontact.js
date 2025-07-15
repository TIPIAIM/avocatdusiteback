const mongoose = require("mongoose");
const validator = require("validator");

// Définition du schéma avec validation des types et options strictes
const AjouterContactSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: [true, "Le nom est obligatoire."],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "L'email est obligatoire."],
      lowercase: true,
      trim: true,
      validate: {
        validator: validator.isEmail,
        message: "Veuillez entrer un email valide.",
      },
    },
    message: {
      type: String,
      required: [true, "Le message est obligatoire."],
      trim: true,
    },
    dateajout: {
      type: Date,
      default: Date.now, // Utilisation du type Date natif pour une meilleure gestion
    },
  },
  {
    strict: true, // Limite les champs à ceux définis dans le schéma
    timestamps: true, // Ajoute les champs `createdAt` et `updatedAt`
  }
);

// Middleware `pre-save` pour nettoyer les entrées avant de les enregistrer
AjouterContactSchema.pre("save", function (next) {
  // Sanitize le champ `nom` en retirant les espaces inutiles
  this.nom = this.nom.trim().replace(/\s+/g, " ");
  // Sanitize le champ `message`
  this.message = this.message.trim().replace(/\s+/g, " ");
  next();
});

// Création du modèle Mongoose avec validation et sécurisation
const AjouterContactBDModel = mongoose.model(
  "LesContacts",
  AjouterContactSchema
);

module.exports = AjouterContactBDModel;
