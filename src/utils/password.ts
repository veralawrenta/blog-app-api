import { hash } from 'bcrypt';

export const hashPassword = async (plainPassword: string) => {
    const salt = 10; // bisa dari 8 -12.
    return await hash(plainPassword, salt);
}