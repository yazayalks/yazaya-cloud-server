import {validationResult} from "express-validator";
import authService from "../services/authService.js";
import ApiError from "../exceptions/apiError.js";


class AuthController {

    async getUsers(req, res, next) {
        try {
            const users = await authService.getAllUsers();
            return res.json(users);
        } catch (e) {
            next(e);
        }
    }
    async registration(req, res, next) {
        try {
            const errors = validationResult(req);


            if (!errors.isEmpty()) {

                return next(ApiError.BadRequest('Validation error', errors.array()))
            }
            const {email, password, firstName, lastName} = req.body;

            const userData = await authService.registration(req.filePath, email, password, firstName, lastName)
            console.log(123)
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
            return res.json(userData)

        } catch (e) {
            next(e);
        }
    }

    async login(req, res, next) {
        try {
            const {email, password} = req.body;
            const userData = await authService.login(email, password);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
            return res.json(userData)

        } catch (e) {
            next(e);
        }
    }

    async logout(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            const token = await authService.logout(refreshToken);
            res.clearCookie('refreshToken');
            return res.json(token)
        } catch (e) {
            next(e);
        }
    }

    async activateLink(req, res, next) {
        try {

        } catch (e) {
            next(e);
        }
    }

    async refresh(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            const userData = await authService.refresh(refreshToken);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
            return res.json(userData)

        } catch (e) {
            next(e);
        }
    }

}

export default new AuthController()