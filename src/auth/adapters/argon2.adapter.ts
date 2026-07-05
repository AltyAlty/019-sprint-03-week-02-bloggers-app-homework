import { hash, verify, Algorithm, Version } from '@node-rs/argon2';
import { injectable } from 'inversify';

/*Адаптер для работы с библиотекой @node-rs/argon2.*/
@injectable()
export class Argon2Adapter {
  /*Метод для генерации хеша пароля.*/
  async generatePasswordHash(password: string): Promise<string> {
    return hash(password, {
      memoryCost: 65536,
      timeCost: 3,
      outputLen: 32,
      parallelism: 4,
      algorithm: Algorithm.Argon2id,
      version: Version.V0x13,
    });
  }

  /*Метод для проверки валидности пароля по хешу.*/
  async checkPasswordByHash(password: string, hash: string): Promise<boolean> {
    return verify(hash, password);
  }
}
