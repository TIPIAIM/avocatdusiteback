



const mongoose = require("mongoose"); //Pour importer le module mongoose.
require("dotenv").config(); //Pour charger les variables d'environnement.
const MONGO_URI = process.env.MONGO_URI; //MONGO_URI : Pour définir l'URI de la base de données.
const connectDB = async () => {

  try {
    //Pour gérer les erreurs.
    const conn = await mongoose.connect(MONGO_URI); //Pour se connecter à la base de données.
    console.log(`Connecté a mongodb: ${conn.connection.host}`); //Pour afficher le message de connexion.
  } catch (error) {
    //Pour gérer les erreurs.
    console.error(`Error: ${error.message}`); //Pour afficher le message d'erreur.
    process.exit(1); //Pour arrêter le processus.
  }
};
module.exports = connectDB; //Pour exporter la fonction connectDB.
