import ApiError from "../exceptions/apiError.js";
import TokenService from "../services/tokenService.js";

export default function(req, res, next)  {
    try {

        const authorizationHeader = req.headers.authorization;

        if (!authorizationHeader) {
            return next(ApiError.UnauthorizedError('User unauthorized'))
        }

        const accessToken = authorizationHeader.split(' ')[1];
        if (!accessToken) {
            return next(ApiError.UnauthorizedError('User unauthorized'))
        }

        const userData = TokenService.validateAccessToken(accessToken);
        if (!userData) {
            return next(ApiError.UnauthorizedError('Expired  accessToken'))
        }

        req.user = userData;
        next();
    }
    catch (e) {
        return next(ApiError.UnauthorizedError('Error authMiddleware'))
    }
}

