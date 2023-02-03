import mongoose from 'mongoose'

const UserModel = new mongoose.Schema({
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    isActivated: {type: Boolean, default: false},
    activationLink: {type: String},
    diskSpace: {type: Number, default: 1024**3*10},
    usedSpace: {type: Number, default: 0},
    avatar: {type: String},
    files : [{type: mongoose.Schema.Types.ObjectId, ref:'FileModel'}]
})

export default  mongoose.model('UserModel', UserModel)