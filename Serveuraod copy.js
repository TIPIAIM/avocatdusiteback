const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
require("dotenv").config();
const cookieparser = require("cookie-parser");

const AjouterContactBDModel = require("./Model/Modelcontact");

const app = express();
//POUR LA CONNEXION
const jwt = require("jsonwebtoken");
const AjouterClientBDModel = require("./Model/ModelAjoutclient");

const PORT = process.env.PORT || 2027;
const MONGO_URI = process.env.MONGO_URI;
const aod = process.env.aodlc; //mison
const aodpr = process.env.aodpr; //svpr

//-------------------------------------- Connexion à MongoDB-------------------------------------------------
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connexion à la base de donnée réussie !");
  })
  .catch((error) => {
    console.error("Erreur de connexion à a la base de donnée :", error.message);
  });

//______________________________________________________________________________________________________

// Middleware
app.use(cors());
// Middleware pour parser le JSON / C'est une fonctionnalité essentielle pour construire des API RESTful ou travailler avec des données transmises via JSON.Les données envoyées dans le corps d'une requête (comme dans une requête POST ou PUT) sont souvent en format JSON
app.use(express.json());
app.use(cookieparser());

{
  /*app.use(
  cors({
    //    origin: frontend, // Exemple : Adresse du frontend
  //  origin: "http://localhost:5173",
  //  methods: ["GET", "POST", "PUT", "DELETE"], // Méthodes HTTP acceptées
   // credentials: true, // Inclure les cookies si nécessaire
  })
);*/
}
const allowedOrigins = [
  // "https://aod-avocats-scpa.vercel.app", // Frontend en production
  //"http://localhost:5173", // Pour le développement local
  aod,
  //aodpr
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"], // Méthodes HTTP acceptées
    credentials: true, // Si vous utilisez des cookies ou des sessions
  })
);
//____________________________________________________________________________________________________
// Modèle User
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
});
// Hash du mot de passe avant de sauvegarder
userSchema.pre("save", async function (next) {
  if (this.isModified("password") || this.isNew) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);
// Middleware d'authentification
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Accès non autorisé" });
  }

  try {
    const decoded = jwt.verify(token, "votre_clé_secrète"); // Utilisez une clé secrète forte en production
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ message: "Token invalide" });
  }
};
// Contrôleurs
const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Cet email est déjà utilisé" });
    }

    // Créer un nouvel utilisateur
    const user = new User({ email, password });
    await user.save();

    // Générer un token JWT
    const token = jwt.sign({ userId: user._id }, "votre_clé_secrète", {
      expiresIn: "1h",
    });
    res.status(201).json({ token });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Erreur lors de l'inscription", error: err.message });
  }
};
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Identifiants incorrects" });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Identifiants incorrects" });
    }

    // Générer un token JWT
    const token = jwt.sign({ userId: user._id }, "votre_clé_secrète", {
      expiresIn: "1h",
    });
    res.json({ token });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Erreur lors de la connexion", error: err.message });
  }
};
// Routes
app.post("/register", register);
app.post("/login", login);
app.get("/protected", authenticate, (req, res) => {
  res.json({ message: "Accès autorisé", userId: req.userId });
});

//--------------------------Ajouter client--------------------------

app.post("/FClient", async (req, res) => {
  try {
    const client = await AjouterClientBDModel.create(req.body);
    res.status(201).json(client); // Code 201 pour "Created"
  } catch (error) {
    res.status(400).json({ message: "Erreur lors de la création", error });
  }
});

// Récupération de tous les clients

app.get("/FClientl", async (req, res) => {
  try {
    const clients = await AjouterClientBDModel.find({}); // Récupérer la liste des contacts depuis la base de données
    res.status(200).json(clients); // Répondre avec un code 200 (succès) et les données
  } catch (error) {
    console.error("Erreur lors de la récupération  :", error);
    res.status(500).json({
      message: "Une erreur est survenue lors de la récupération des données.",
      error: error.message,
    });
  }
});
//1 procedure de recupere fficher par id
app.get("/recupparidclient/:id", (req, res) => {
  //afficher la liste de nos enregistrement
  const id = req.params.id;
  AjouterClientBDModel.findById({ _id: id })
    .then((Client) => res.json(Client))
    .catch((err) => res.json(err));
}); //2-pour modifier on ajoute le put
app.put("/Metajourlerecuperer/:id", (req, res) => {
  //afficher la liste de nos enregistrement
  const id = req.params.id;
  AjouterClientBDModel.findByIdAndUpdate(
    { _id: id },
    {
      name: req.body.name,
      adresse: req.body.adresse,
      dateajout: req.body.dateajout,
      numero: req.body.numero,
      naturedaffaire: req.body.naturedaffaire,
      avocat: req.body.avocat,
    }
  )
    .then((Client) => res.json(Client))
    .catch((err) => res.json(err));
});

app.delete("/deleteCl/:clientId", (req, res) => {
  const id = req.params.clientId; // Utilisez `clientId` pour correspondre au paramètre défini dans la route
  AjouterClientBDModel.findByIdAndDelete(id) // Passez directement `id` à la méthode
    .then((deletedClient) => {
      if (!deletedClient) {
        return res.status(404).json({ message: "Client introuvable." });
      }
      res
        .status(200)
        .json({ message: "Client supprimé avec succès.", deletedClient });
    })
    .catch((err) => {
      console.error("Erreur lors de la suppression :", err);
      res.status(500).json({
        message: "Erreur serveur lors de la suppression.",
        error: err,
      });
    });

  console.log(`Requête DELETE reçue pour le client ID : ${id}`);
});

//_________________________________________________________________________________________

//--------------------------------------------conexion inscript verif--------------------------------------------------

//Middleware d'authentification ( authenticateToken) est utilisé pour protéger les routes nécessitant une authentification. Il permet de vérifier si l'utilisateur a un token JWT valide avant d'accéder à ces routes.
// Middleware pour vérifier les utilisateurs connectés

// Route de déconnexion

//_________________________________________________________________________________________________________

// Middleware pour échapper les caractères spéciaux "Protection contre les injections SQL  trim().escape() et normalizeEmail() dans les validations"
function escapeInput(input) {
  return input.replace(/<\/?[^>]+(>|$)/g, ""); // Échapper les balises HTML
}
//envoyé les données de contact------------------------------------------------------
app.post(
  "/contactenvoye",
  [
    body("message")
      .notEmpty()
      .withMessage("Le message est requis")
      .trim()
      .escape()
      .customSanitizer(escapeInput),
    body("nom")
      .notEmpty()
      .withMessage("Le nom est requis")
      .trim()
      .escape()
      .customSanitizer(escapeInput),
    body("email")
      .isEmail()
      .withMessage("Un email valide est requis")
      .normalizeEmail(),
    body("dateajout"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    AjouterContactBDModel.create(req.body)
      .then((LesContacts) =>
        res.status(201).json({ success: true, data: LesContacts })
      )
      .catch((err) =>
        res.status(500).json({ success: false, error: err.message })
      );
  }
);
app.get("/listecontact", async (req, res) => {
  try {
    const listecontacts = await AjouterContactBDModel.find({}); // Récupérer la liste des contacts depuis la base de données
    res.status(200).json(listecontacts); // Répondre avec un code 200 (succès) et les données
  } catch (error) {
    console.error("Erreur lors de la récupération des contacts :", error);
    res.status(500).json({
      message: "Une erreur est survenue lors de la récupération des contacts.",
      error: error.message,
    });
  }
});
app.delete("/deletecontact/:id", (req, res) => {
  const id = req.params.id;
  AjouterContactBDModel.findByIdAndDelete({ _id: id })
    .then((LesContacts) => res.json(LesContacts))
    .catch((err) => res.json(err));
});
//_________________________________________________________________________________________

// Démarrer le serveur______________________________________________________________________
app.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur http://localhost:${PORT}`);
});
