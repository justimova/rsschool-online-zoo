export interface ILoginInfo {
  login: string;
  password: string;
}

export interface IRegisterInfo {
  login: string;
  password: string;
  name: string;
  email: string;
}

export interface IUser {
  login: string;
  name: string;
  email: string;
}

export interface IAuthData {
    access_token: string;
    user: IUser;
}

export interface IAuthResponse {
  data: IAuthData;
  message: string;
}

export type TLoginPayload = Readonly<Pick<ILoginInfo, 'login' | 'password'>>;
export type TRegisterPayload = Readonly<Pick<IRegisterInfo, 'login' | 'password' | 'name' | 'email'>>;
