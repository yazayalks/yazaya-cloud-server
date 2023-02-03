import globalPath from 'path';

export default function filePath(path) {
    return function (req, res, next) {
        req.filePath = globalPath.resolve(path, 'files');
        req.staticPath = globalPath.resolve(path, 'static');
        next();
    }
}

