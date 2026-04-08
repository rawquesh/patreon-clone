"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const bcrypt = require("bcrypt");
const user_1 = require("../database/schemas/user");
const payments_service_1 = require("../payments/payments.service");
const axios_1 = require("axios");
let AuthService = AuthService_1 = class AuthService {
    constructor(userModel, jwtService, paymentsService) {
        this.userModel = userModel;
        this.jwtService = jwtService;
        this.paymentsService = paymentsService;
        this.logger = new common_1.Logger(AuthService_1.name);
    }
    async verifyGoogleAccessToken(accessToken) {
        try {
            this.logger.log('Attempting to verify Google access token...');
            const response = await axios_1.default.get('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            const profile = response.data;
            if (!profile || !profile.email) {
                throw new Error('Could not retrieve profile from Google.');
            }
            this.logger.log(`Google profile retrieved for email: ${profile.email}`);
            let user = await this.userModel.findOne({ email: profile.email });
            if (!user) {
                this.logger.log(`No user found for ${profile.email}, creating a new one.`);
                user = await this.userModel.create({
                    email: profile.email,
                    firstName: profile.given_name,
                    lastName: profile.family_name,
                    profilePicture: profile.picture,
                    provider: user_1.AuthProvider.GOOGLE,
                    providerId: profile.id,
                });
            }
            const token = this.generateToken(user);
            return {
                user: {
                    id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                },
                token,
            };
        }
        catch (error) {
            this.logger.error(`Google Access Token verification failed: ${error.message}`, error.stack);
            if (error.response) {
                this.logger.error(`Google API Error: ${JSON.stringify(error.response.data)}`);
            }
            throw new common_1.BadRequestException('Failed to verify Google access token.');
        }
    }
    async signup(signUpDto) {
        const { email, password, firstName, lastName } = signUpDto;
        const existingUser = await this.userModel.findOne({ email });
        if (existingUser) {
            throw new Error('User already exists');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await this.userModel.create({
            email,
            password: hashedPassword,
            firstName,
            lastName,
            provider: user_1.AuthProvider.LOCAL,
        });
        const token = this.generateToken(user);
        return {
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
            },
            token,
        };
    }
    async login(loginDto) {
        const { email, password } = loginDto;
        const user = await this.userModel.findOne({ email });
        if (!user) {
            throw new Error('User not found');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid password');
        }
        const token = this.generateToken(user);
        return {
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
            },
            token,
        };
    }
    async validateUser(email, password) {
        const user = await this.userModel.findOne({ email });
        if (user && (await bcrypt.compare(password, user.password))) {
            const { password, ...result } = user.toObject();
            return result;
        }
        return null;
    }
    async googleLogin(profile) {
        const { email, firstName, lastName, picture } = profile;
        let user = await this.userModel.findOne({ email });
        if (!user) {
            user = await this.userModel.create({
                email,
                firstName,
                lastName,
                profilePicture: picture,
                provider: user_1.AuthProvider.GOOGLE,
                providerId: profile.id,
            });
        }
        const token = this.generateToken(user);
        return {
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
            },
            token,
        };
    }
    generateToken(user) {
        const payload = { email: user.email, sub: user._id };
        return this.jwtService.sign(payload);
    }
    async getCurrentUser(userId) {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        const { password, ...userWithoutPassword } = user.toObject();
        return userWithoutPassword;
    }
    async isUsernameInUse(displayName) {
        const user = await this.userModel.findOne({ displayName });
        return !!user;
    }
    async isEmailInUse(email) {
        const user = await this.userModel.findOne({ email: email.toLowerCase() });
        if (user) {
            return {
                isInUse: true,
                passwordSet: !!user.password,
            };
        }
        else {
            return {
                isInUse: false,
                passwordSet: false,
            };
        }
    }
    async register(registerDto) {
        const { email, password, firstName, lastName, gender } = registerDto;
        const existingUser = await this.userModel.findOne({
            email: email.toLowerCase(),
        });
        if (existingUser) {
            throw new common_1.ConflictException('Email already exists');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await this.userModel.create({
            email: email.toLowerCase(),
            password: hashedPassword,
            firstName,
            lastName,
            displayName: `${firstName} ${lastName}`,
            gender,
            provider: user_1.AuthProvider.LOCAL,
        });
        const token = this.generateToken(newUser);
        return {
            user: newUser,
            token,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        jwt_1.JwtService,
        payments_service_1.PaymentsService])
], AuthService);
//# sourceMappingURL=auth.service.js.map