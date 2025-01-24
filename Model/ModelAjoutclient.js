const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Le nom est obligatoire"],
      maxlength: [30, "Le nom ne doit pas dépasser 30 caractères"],
    },
    adresse: {
      type: String,
      required: [true, "L'adresse est obligatoire"],
      maxlength: [50, "L'adresse ne doit pas dépasser 50 caractères"],
    },
    dateajout: {
      type: Date,
      required: [true, "La date d'ajout est obligatoire"],
    },
    numero: {
      type: String,
      required: [true, "Le numéro de téléphone est obligatoire"],
      match: [
        /^[0-9]{8,15}$/,
        "Numéro de téléphone invalide (8 à 15 chiffres)",
      ],
    },
    naturedaffaire: {
      type: String,
      required: [true, "La nature de l'affaire est obligatoire"],
      enum: [
        "Droit Minier et de l’Environnement",
        "Droit Sociale et Sécurité Sociale",
        "Droit des Affaires",
        "Droit du Sport",
        "Défense Pénale",
        "Arbitrage",
        "Correctionnelle",
        "Civile",
        "Commerciale",
        "Autres",
      ], // Restreint les valeurs possibles
    },
    avocat: {
      type: String,
      required: [true, "L'avocat en charge est obligatoire"],
    },
  },
  {
    timestamps: true, // Ajoute createdAt et updatedAt
  }
);

const AjouterClientBDModel = mongoose.model("Client", clientSchema);

module.exports = AjouterClientBDModel;
