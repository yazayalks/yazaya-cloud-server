import mongoose from 'mongoose'

const FileModel = new mongoose.Schema({
    name: {type: String, required: true},
    type: {type: String, required: true},
    activationLink: {type: String},
    size: {type: Number, default: 0},
    path: {type: String, default: ''},
    date: {type: Date, default: Date.now()},
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'UserModel'},
    parent: {type: mongoose.Schema.Types.ObjectId, ref: 'FileModel'},
    childs : [{type: mongoose.Schema.Types.ObjectId, ref:'FileModel'}]
})

export default  mongoose.model('FileModel', FileModel)