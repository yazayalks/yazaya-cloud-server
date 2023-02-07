import globalPath from 'path';

export default function filePath(path) {
    return function (req, res, next) {
        req.filePath = globalPath.posix.join(path, 'files');
        req.staticPath = globalPath.posix.join(path, 'static');
        next();
    }
}

