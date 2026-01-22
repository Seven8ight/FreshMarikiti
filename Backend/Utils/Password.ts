import bcrypt from "bcryptjs";

export const hashPassword = (password: string): string =>
    bcrypt.hashSync(password, 10),
  comparePasswordAndHash = (password: string, hash: string): boolean =>
    bcrypt.compareSync(password, hash);
