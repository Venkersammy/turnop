const mongoose = require('mongoose');

const phoneSchema = new mongoose.Schema({
    phoneNumber: mongoose.SchemaTypes.String,
})

module.exports = mongoose.model('phone', phoneSchema)