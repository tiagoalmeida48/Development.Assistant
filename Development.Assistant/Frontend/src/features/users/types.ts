export interface User {
  id: number;
  username: string;
  login: string;
}

export interface UserCreateDto {
  username: string;
  login: string;
  password: string;
}

export interface UserUpdateDto {
  id: number;
  username: string;
  login: string;
  password: string;
}
