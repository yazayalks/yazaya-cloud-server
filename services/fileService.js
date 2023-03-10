import fs from 'fs';
import globalPath from "path";

class FileService{

    createDir(filePath, file) {
        const newFilePath = this.getPath(filePath, file)
        return new Promise(((resolve, reject) => {
            try {
                if(!fs.existsSync(newFilePath)) {
                    fs.mkdirSync(newFilePath)
                    return resolve({message: 'File was created'})
                } else {
                    return reject({message: 'File already exist'})
                }
            }
            catch (e) {
                return reject({message: 'File error'})
            }
        }))
    }

    deleteFile(req, file) {
        const path = this.getPath(req.filePath, file)
        if (file.type === 'dir') {
            fs.rmdirSync(path)
        } else {
            fs.unlinkSync(path)
        }
    }

    getPath(filePath, file) {
        return globalPath.posix.join(filePath, String(file.user), String(file.path))
    }
}

export default new FileService();