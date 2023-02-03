import {Router} from "express";
import authMiddleware from '../middleware/authMiddleware.js'
import FileController from "../controllers/FileController.js";


const fileRouter = new Router()

fileRouter.post('',authMiddleware,
    FileController.createDir)
fileRouter.post('/upload',authMiddleware,
    FileController.uploadFile)
fileRouter.post('/avatar',authMiddleware,
    FileController.uploadAvatar)
fileRouter.delete('/avatar',authMiddleware,
    FileController.deleteAvatar)
fileRouter.get('/download', authMiddleware,
    FileController.downloadFile)
fileRouter.get('/search', authMiddleware,
    FileController.searchFiles)
fileRouter.get('/size', authMiddleware,
    FileController.getUsedSpace)
fileRouter.delete('/', authMiddleware,
    FileController.deleteFile)
fileRouter.get('',authMiddleware,
    FileController.fetchFiles)

export default fileRouter;