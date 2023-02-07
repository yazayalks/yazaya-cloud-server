import FileService from "../services/fileService.js";
import FileModel from "../models/FileModel.js";
import UserModel from "../models/UserModel.js";
import ApiError from "../exceptions/apiError.js";
import mongoose from 'mongoose';

import fs from 'fs'
import {v4 as uuidv4} from 'uuid'
import globalPath from "path";


class FileController {

    async createDir(req, res, next) {
        try {
            console.log("createDir")
            const {name, type, parent} = req.body
            const file = new FileModel({name, type, parent, user: req.user.id})
            const parentFile = await FileModel.findOne({_id: parent})
            if (!parentFile) {
                file.path = name
                await FileService.createDir(req.filePath, file)
            } else {
                file.path = globalPath.posix.join(String(parentFile.path), String(file.name))
                await FileService.createDir(req.filePath, file)
                parentFile.childs.push(file.id)
                await parentFile.save()
            }
            await file.save()
            return res.json(file)
        } catch (e) {
            next(e);
        }
    }

    async fetchFiles(req, res, next) {
        try {
            console.log("fetchFiles")
            const {sort} = req.query
            let files
            switch (sort) {
                case 'name':
                    files = await FileModel.find({user: req.user.id, parent: req.query.parent}).sort({name: 1})
                    break;
                case 'type':
                    files = await FileModel.find({user: req.user.id, parent: req.query.parent}).sort({type: 1})
                    break;
                case 'date':
                    files = await FileModel.find({user: req.user.id, parent: req.query.parent}).sort({date: 1})
                    break;
                default:
                    files = await FileModel.find({user: req.user.id, parent: req.query.parent})
                    break;
            }

            return res.json(files)
        } catch (e) {
            next(e);
        }
    }

    uploadFile = async (req, res, next) => {
        try {
            console.log("uploadFile")
            const file = req.files.file


            const parent = await FileModel.findOne({user: req.user.id, _id: req.body.parent})
            const user = await UserModel.findOne({_id: req.user.id})

            if (user.usedSpace + file.size > user.diskSpace) {
                return next(ApiError.BadRequest('There no space on the disk'))
            }

            await UserModel.findByIdAndUpdate({_id: user._id}, {$inc: {usedSpace: file.size}})


            let path;
            if (parent) {

                path = globalPath.posix.join(req.filePath, String(user._id), String(parent.path), String(file.name))
            } else {
                path = globalPath.posix.join(req.filePath, String(user._id), String(file.name))
            }

            if (fs.existsSync(path)) {
                return next(ApiError.BadRequest('File already exist'))
            }

            file.mv(path)

            const type = file.name.split('.').pop()
            let filePath = file.name
            if (parent) {
                filePath = globalPath.posix.join(String(parent.path), String(file.name))
            }

            const dbFile = new FileModel({
                name: file.name,
                type,
                size: file.size,
                path: filePath,
                parent: parent?._id,
                user: user._id,
            })

            if (parent) {
                parent.childs.push(dbFile._id)
                await parent.save();
                await this.editSizeDir(parent, file.size, next)
            }
            await dbFile.save();
            await user.save();
            return res.json(dbFile)
        } catch (e) {
            next(e);
        }
    }

    async downloadFile(req, res, next) {
        try {
            console.log("downloadFile")
            const file = await FileModel.findOne({_id: req.query.id, user: req.user.id})
            const path = FileService.getPath(req.filePath, file)
            console.log("ЭЭЭТТООТ")
            console.log(path)
            if (fs.existsSync(path)) {
                return res.download(path, file.name)
            }
            return next(new ApiError(400, 'File not found'))
        } catch (e) {
            return next(new ApiError(500, 'Download error', e))
        }
    }

    async editSizeDir(parent, fileSize, next) {
        try {
            while (true) {
                await FileModel.findByIdAndUpdate({_id: parent._id}, {$inc: {size: fileSize}})

                const nextParent = await FileModel.findOne({_id: parent.parent})
                if (!nextParent) {
                    break
                }
                parent = nextParent
            }
        } catch (e) {
            return next(new ApiError(500, e.message))
        }
    }


    deleteFile = async (req, res, next) => {
        try {
            console.log("deleteFile")
            const file = await FileModel.findOne({_id: req.query.id})
            const user = await UserModel.findOne({_id: req.user.id})

            if (!file) {
                return next(new ApiError(500, 'File not found'))
            }

            if (file.parent) {
                const parent = await FileModel.findOne({_id: file.parent})
                await this.editSizeDir(parent, file.size * (-1))
            }
            if (file.type === 'dir') {

                user.usedSpace = user.usedSpace - file.size
                await this.deleteAllFilesInDir(req, file)
                await user.save();
                return res.json({message: 'Dir was deleted'})
            }


            if (file.parent) {
                const parent = await FileModel.findOne({_id: file.parent})
                parent.childs = this.removeArrayValue(parent.childs, file._id);
                await parent.save()
            }

            let size = file.size
            FileService.deleteFile(req, file)
            user.usedSpace = user.usedSpace - size
            await user.save();
            await file.remove()

            return res.json({message: 'File was deleted'})

        } catch (e) {
            return next(new ApiError(400, e.message))
        }
    }


    deleteAllFilesInDir = async (req, file) => {
        for (const childId of file.childs) {
            let child = await FileModel.findOne({_id: childId})
            if (child.type !== 'dir') {
                FileService.deleteFile(req, child)
                await child.remove()
                await file.save()
            }
            if (child.type === 'dir') {
                await this.deleteAllFilesInDir(req, child)
            }
        }
        file.childs = null
        await file.save()
        if (file.parent) {
            const parent = await FileModel.findOne({_id: file.parent})
            parent.childs = this.removeArrayValue(parent.childs, file._id);
            await parent.save()
        }
        FileService.deleteFile(req, file)
        await file.remove()
    }

    removeArrayValue(array, value) {
        let index = array.indexOf(value);
        if (index >= 0) {
            array.splice(index, 1);
            return this.reindexArray(array);
        }
    }

    reindexArray(array) {
        let result = [];
        for (let key in array) {
            result.push(array[key]);
        }
        return result;
    }


    async searchFiles(req, res, next) {
        try {
            console.log("searchFiles")
            const {sort} = req.query
            const searchName = req.query.search
            let files;
            switch (sort) {
                case 'name':
                    files = await FileModel.find({user: req.user.id, parent: req.query.parent}).sort({name: 1})
                    break;
                case 'type':
                    files = await FileModel.find({user: req.user.id, parent: req.query.parent}).sort({type: 1})
                    break;
                case 'date':
                    files = await FileModel.find({user: req.user.id, parent: req.query.parent}).sort({date: 1})
                    break;
                default:
                    files = await FileModel.find({user: req.user.id, parent: req.query.parent})
                    break;
            }

            if (files) {
                let foundFiles = files.filter(file => file.name.includes(searchName))
                return res.json(foundFiles)
            }
            return next(new ApiError(500, 'Disk empty', e))

        } catch (e) {
            return next(new ApiError(500, 'Search error', e))
        }
    }

    async uploadAvatar(req, res, next) {
        try {
            const file = req.files.file
            const user = await UserModel.findOne({_id: req.user.id})
            const avatarName = uuidv4() + ".jpg"
            file.mv(globalPath.posix.join(req.staticPath, avatarName))
            user.avatar = avatarName;
            await user.save();
            return res.json(user)
        } catch (e) {
            return next(new ApiError(e.status, e.message))
        }
    }

    async deleteAvatar(req, res, next) {
        try {
            const user = await UserModel.findOne({_id: req.user.id})
            fs.unlinkSync(globalPath.posix.join(req.staticPath, user.avatar))
            user.avatar = null
            await user.save();
            return res.json({message: "Avatar was deleted"})
        } catch (e) {
            return next(new ApiError(e.status, e.message))
        }
    }


    async getUsedSpace(req, res, next) {
        try {
            const user = await UserModel.findOne({_id: req.user.id})
            return res.json(user)
        } catch (e) {
            return next(new ApiError(e.status, e.message))
        }
    }
}


export default new FileController()