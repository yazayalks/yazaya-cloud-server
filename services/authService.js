import UserModel from '../models/UserModel.js'
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import mailService from './mailService.js';
import TokenService from './tokenService.js';
import UserDTO from "../dtos/UserDTO.js";
import ApiError from "../exceptions/apiError.js";
import FileService from "./fileService.js";
import FileModel from "../models/FileModel.js";


class AuthService {
    async getAllUsers() {
        return UserModel.find();
    }

    async registration(filePath, email, password) {
        const candidate = await UserModel.findOne({email});

        if (candidate) {
            throw ApiError.BadRequest(`User with email ${email} already exist`)
        }
        const hashPassword = await bcrypt.hash(password, 8);
        const activationLink = uuidv4();

        const user = await UserModel.create({email, password: hashPassword, activationLink});
        await mailService.sendActivationMail(email, activationLink);
        await user.save();
        console.log(user)

        await FileService.createDir(filePath, new FileModel({user:user.id, name: ''}))

        const userDto = new UserDTO(user);
        const tokens = TokenService.generateTokens({...userDto});
        await TokenService.saveToken(userDto.id, tokens.refreshToken);

        return {...tokens, user: userDto}
    }
    async login(email, password) {
        const user = await UserModel.findOne({email})
        if (!user) {
            throw ApiError.BadRequest(`User with this email "${email}" not found`)
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
        if(!refreshToken) {
            throw ApiError.UnauthorizedError();
        }
        const userData = TokenService.validateRefreshToken(refreshToken);
        const tokenFromDb = await TokenService.findToken(refreshToken);
        if(!userData || !tokenFromDb) {
            throw ApiError.UnauthorizedError();
        }
        const user = await UserModel.findById(userData.id);
        const userDto = new UserDTO(user);
        const tokens = TokenService.generateTokens({...userDto});

        await TokenService.saveToken(userDto.id, tokens.refreshToken);
        return {...tokens, user: userDto}
    }

}

export default new AuthService();