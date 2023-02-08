import UserModel from '../models/UserModel.js'
import bcrypt from 'bcryptjs';
import {v4 as uuidv4} from 'uuid';
import TokenService from './tokenService.js';
import UserDTO from "../dtos/UserDTO.js";
import ApiError from "../exceptions/apiError.js";
import FileService from "./fileService.js";
import FileModel from "../models/FileModel.js";


class AuthService {
    async getAllUsers() {
        return UserModel.find();
    }

    async registration(filePath, email, password, firstName, lastName) {
        const candidate = await UserModel.findOne({email});

        if (candidate) {
            if (candidate.isActivated) {
                throw ApiError.BadRequest(`User with email ${email} already exist`)
            }
            if (!candidate.isActivated) {
                throw ApiError.BadRequest(`User with email ${email} already exist, confirm your email `)
            }
        }
        const hashPassword = await bcrypt.hash(password, 8);
        const activationLink = uuidv4();

        const user = await UserModel.create({email, password: hashPassword, activationLink: activationLink, firstName: firstName, lastName : lastName });
        // await mailService.sendActivationMail(email, `${process.env.API_HOST}/api/activate/${activationLink}`);
        await user.save();
        console.log(user)
        await FileService.createDir(filePath, new FileModel({user: user.id, name: ''}))

        const userDto = new UserDTO(user);
        const tokens = TokenService.generateTokens({...userDto});
        await TokenService.saveToken(userDto.id, tokens.refreshToken);

        return {...tokens, user: userDto}
    }

    async login(email, password) {
        const user = await UserModel.findOne({email})
        if (!user) {
            throw ApiError.BadRequest(`User with this email "${email}" not found`)
        } else {
            if (!user.isActivated) {
                throw ApiError.BadRequest(`Confirm your email`)
            }
        }

        const isPasswordEquals = await bcrypt.compare(password, user.password)
        if (!isPasswordEquals) {
            throw ApiError.BadRequest(`Wrong password entered`)
        }
        const userDto = new UserDTO(user);
        const tokens = TokenService.generateTokens({...userDto});
        await TokenService.saveToken(userDto.id, tokens.refreshToken);

        return {...tokens, user: userDto}
    }

    async logout(refreshToken) {
        return await TokenService.removeToken(refreshToken)
    }

    async refresh(refreshToken) {
        if (!refreshToken) {
            throw ApiError.UnauthorizedError();
        }
        const userData = TokenService.validateRefreshToken(refreshToken);
        const tokenFromDb = await TokenService.findToken(refreshToken);
        if (!userData || !tokenFromDb) {
            throw ApiError.UnauthorizedError();
        }
        const user = await UserModel.findById(userData.id);
        const userDto = new UserDTO(user);
        const tokens = TokenService.generateTokens({...userDto});

        await TokenService.saveToken(userDto.id, tokens.refreshToken);
        return {...tokens, user: userDto}
    }

    async activate(activationLink) {
        const user = await UserModel.findOne({activationLink})
        if (!user) {
            throw new Error('invalid activation link')
        }
        user.isActivated = true;
        await user.save();
    }
}

export default new AuthService();