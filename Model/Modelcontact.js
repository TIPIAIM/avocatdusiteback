const mongoose = require("mongoose");

const AjouterContactSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  email: { type: String },
  message: { type: String },
});
const AjouterContactBDModel = mongoose.model(
  "LesContacts",
  AjouterContactSchema
);
module.exports = AjouterContactBDModel;
