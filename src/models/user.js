const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    username:{type:String, require:true},
    password: { type: String, required: true },
    profileImage: { type: String, default: 'defaultImage'}
})

const User = mongoose.model('User', userSchema);

module.exports = User;