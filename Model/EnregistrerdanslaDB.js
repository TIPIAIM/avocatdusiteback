const mongoose= require('mongoose')

const EnregistrementdanslaBDSchema = new mongoose.Schema({//les champs identiques a notre formulaire
    name: String,
    email :{ type: String, unique: true },
    password : String,
    role: { type: String, enum: ['admin', 'avocat','client', 'visiteur'], default: 'visiteur' } // Ajouter le champ rôle

})// 'lesenregistrees: cest nouvelle table qu'il va creer dans la bd' on met le nom qu'on v sa sera dans la base
const EnregistrementdanslaBDModel = mongoose.model("lesenregistrees",EnregistrementdanslaBDSchema )//cett table contiendra les info posté

//on exporte maintenant le module puis importons dans le serveur 
module.exports = EnregistrementdanslaBDModel
