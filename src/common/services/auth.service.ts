import bcrypt from 'bcrypt';
import config from 'config';
import jwt from 'jsonwebtoken';
import { CreateUserDto } from '@/biz/user/UsersDTO';
import HttpException from '@exceptions/HttpException';
import { DataStoredInToken, TokenData } from '@/common/entity/auth.interface';
import { User } from '@/biz/user/UsersEntity';
import userModel from '@/biz/user/UsersRepository';
import { isEmpty } from '@/common/utils/util';

class AuthService {
  public users = userModel;

  public async signup(userData: CreateUserDto): Promise<User> {
    if (isEmpty(userData)) throw new HttpException(400, "You're not userData");

    const findUser: User = await this.users.findOne({ email: userData.email });
    if (findUser) throw new HttpException(409, `You're email ${userData.email} already exists`);

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const createUserData: User = await this.users.create({ ...userData, password: hashedPassword });

    return createUserData;
  }

  public async login(userData: CreateUserDto, password:string): Promise<{ cookie: string; findUser: User }> {
    if (isEmpty(userData)) throw new HttpException(400, "You're not userData");
    const findUser: User = await this.users.findOne({ user_id: userData.user_id }); //
    if (!findUser) throw new HttpException(409, `You're user_id ${userData.user_id} not found`);
    const isPasswordMatching: boolean = await bcrypt.compare(userData.password as string, findUser.password);
    if (!isPasswordMatching) throw new HttpException(409, "You're password not matching");
    const tokenData = this.createToken(findUser);
    const cookie = this.createCookie(tokenData);
    return { cookie, findUser };
  }

  public async logout(userData: User): Promise<User> {
    if (isEmpty(userData)) throw new HttpException(400, "You're not userData");
    const findUser: User = await this.users.findOne({ email: userData.email, password: userData.password });
    if (!findUser) throw new HttpException(409, `You're email ${userData.email} not found`);
    return findUser;
  }

  public createToken(user: User): TokenData {
    const dataStoredInToken: DataStoredInToken = { _id: user._id };
    const secret: string = config.get('secretKey');
    const expiresIn: number = 60 * 60;
    return { expiresIn, token: jwt.sign(dataStoredInToken, secret, { expiresIn }) };
  }

  public createCookie(tokenData: TokenData): string {
    return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn};`;
  }
}

export default AuthService;
