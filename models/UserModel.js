import mongoose from 'mongoose'

const UserModel = new mongoose.Schema({
    email: {type: String, required: true, unique: true},
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    password: {type: String, required: true},
    isActivated: {type: Boolean, default: false},
    activationLink: {type: String},
    diskSpace: {type: Number, default: 1024**3},
    usedSpace: {type: Number, default: 0},
    avatar: {type: String},
    files : [{type: mongoose.Schema.Types.ObjectId, ref:'FileModel'}]
})

export default  mongoose.model('UserModel', UserModel)