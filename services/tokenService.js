import jwt from "jsonwebtoken";
import TokenModel from "../models/TokenModel.js";
class TokenService {
    generateTokens(payload) {
        const accessToken =jwt.sign(payload, process.env.JWT_ACCESS_SECRET_KEY,{expiresIn: "1h"},undefined)
        const refreshToken =jwt.sign(payload, process.env.JWT_REFRESH_SECRET_KEY,{expiresIn: "30d"},undefined)
        return {
            accessToken,
            refreshToken
        }
    }
    async saveToken(userId, refreshToken) {
        const tokenData = await TokenModel.findOne({user: userId})
        if(tokenData) {
            tokenData.refreshToken = refreshToken;
            return tokenData.save();
        }
        return await TokenModel.create({user: userId, refreshToken})
    }

    async removeToken(refreshToken) {
        return TokenModel.deleteOne({refreshToken})
    }

    async findToken(refreshToken) {
        return TokenModel.findOne({refreshToken});
    }

    validateAccessToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_ACCESS_SECRET_KEY)
        }
        catch (e) {
            return null;
        }
    }
    validateRefreshToken(token) {
        try {
            return jwt.verify(token,  process.env.JWT_REFRESH_SECRET_KEY)
        }
        catch (e) {
            return null;
        }
    }
}

export default new TokenService();