import bcrypt from 'bcrypt';
import { injectable } from 'inversify';

/*Адаптер для работы с библиотекой bcrypt.*/
@injectable()
export class BcryptAdapter {
  /*Метод для генерации хеша пароля.*/
  async generatePasswordHash(password: string): Promise<string> {
    /*Генерируем хеш-соль. В качестве параметра для генерации хеш-соли указываем количество раундов, что является
    степенью двойки.*/
    const salt: string = await bcrypt.genSalt(10);
    /*Хешируем пароль, используя хеш-соль.*/
    return bcrypt.hash(password, salt);
  }

  /*Метод для проверки валидности пароля по хешу.*/
  async checkPasswordByHash(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
