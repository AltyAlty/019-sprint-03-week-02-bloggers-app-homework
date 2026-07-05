import { body, ValidationChain } from 'express-validator';
import { usersRepository } from '../../users/repositories/users.repository';
import { UserDBType } from '../../users/repositories/types/user-db.type';
import { EmailConfirmationDBType } from '../repositories/types/email-сonfirmation-db.type';
import { authRepository } from '../repositories/auth.repository';
import { RecoveryCodeDataDBType } from '../repositories/types/recovery-code-data-db.type';

const loginOrEmailValidation: ValidationChain = body('loginOrEmail')
  .exists()
  .withMessage('Field "loginOrEmail" is required')
  .isString()
  .withMessage('Field "loginOrEmail" must be a string')
  .trim()
  .notEmpty()
  .withMessage('Field "loginOrEmail" must not be empty');

const passwordValidation: ValidationChain = body('password')
  .exists()
  .withMessage('Field "password" is required')
  .isString()
  .withMessage('Field "password" must be a string')
  .trim()
  .notEmpty()
  .withMessage('Field "password" must not be empty')
  .isLength({ min: 6, max: 20 })
  .withMessage('Field "password" must be between 6 and 20 characters');

export const recoveryPasswordEmailValidation: ValidationChain = body('email')
  .exists()
  .withMessage('Field "email" is required')
  .isString()
  .withMessage('Field "email" must be a string')
  .trim()
  .notEmpty()
  .withMessage('Field "email" must not be empty')
  .matches(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/)
  .withMessage('Field "email" is invalid')
  .isEmail()
  .withMessage('Field "email" is invalid');

const newPasswordValidation: ValidationChain = body('newPassword')
  .exists()
  .withMessage('Field "newPassword" is required')
  .isString()
  .withMessage('Field "newPassword" must be a string')
  .trim()
  .notEmpty()
  .withMessage('Field "newPassword" must not be empty')
  .isLength({ min: 6, max: 20 })
  .withMessage('Field "newPassword" must be between 6 and 20 characters');

const recoveryCodeValidation: ValidationChain = body('recoveryCode')
  .exists()
  .withMessage('Field "recoveryCode" is required')
  .isString()
  .withMessage('Field "recoveryCode" must be a string')
  .trim()
  .notEmpty()
  .withMessage('Field "recoveryCode" must not be empty')
  .matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
  .withMessage('Field "recoveryCode" is invalid')
  .custom(async (recoveryCode: string) => {
    const recoveryCodeDataDB: RecoveryCodeDataDBType | null =
      await authRepository.findRecoveryPasswordCodeDataByCode(recoveryCode);

    if (!recoveryCodeDataDB) throw new Error('Field "recoveryCode" is invalid');
    if (recoveryCodeDataDB.expirationDate <= new Date()) throw new Error('Recovery code is expired');
    const userDB: UserDBType | null = await usersRepository.findById(recoveryCodeDataDB.userId);
    if (!userDB) throw new Error('Field "recoveryCode" is invalid');
    return true;
  });

/*Middleware для проверки, что поле "code":
1. Существует в запросе.
2. Является строкой.
3. Не является пустым.
4. Соответствует формату UUID.
5. Относится к пользователю, который ожидает подтверждения регистрации.
6. Не относится к пользователю, у которого уже была подтверждена регистрация.
7. Не является просроченным.*/
export const confirmationCodeValidation: ValidationChain = body('code')
  .exists()
  .withMessage('Field "code" is required')
  .isString()
  .withMessage('Field "code" must be a string')
  .trim()
  .notEmpty()
  .withMessage('Field "code" must not be empty')
  .matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
  .withMessage('Field "code" is invalid')
  .custom(async (code: string) => {
    const emailConfirmationDB: EmailConfirmationDBType | null = await authRepository.findEmailConfirmationByCode(code);
    if (!emailConfirmationDB) throw new Error('Field "code" is invalid');
    if (emailConfirmationDB.expirationDate <= new Date()) throw new Error('Confirmation code is expired');
    const userDB: UserDBType | null = await usersRepository.findById(emailConfirmationDB.userId);
    if (!userDB) throw new Error('Field "code" is invalid');
    if (userDB.isConfirmed) throw new Error('Registration has already been confirmed');
    return true;
  });

/*Middleware для проверки, что поле "email":
1. Существует в запросе.
2. Является строкой.
3. Не является пустым.
4. Соответствует формату электронной почты.
5. Относится к пользователю, который ожидает подтверждения регистрации.
6. Не относится к пользователю, у которого уже была подтверждена регистрация.*/
export const registrationEmailResendingValidation: ValidationChain = body('email')
  .exists()
  .withMessage('Field "email" is required')
  .isString()
  .withMessage('Field "email" must be a string')
  .trim()
  .notEmpty()
  .withMessage('Field "email" must not be empty')
  .matches(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/)
  .withMessage('Field "email" is invalid')
  .isEmail()
  .withMessage('Field "email" is invalid')
  .custom(async (email: string) => {
    const userDB: UserDBType | null = await usersRepository.findByEmail(email);
    if (!userDB) throw new Error('Field "email" is invalid');
    if (userDB.isConfirmed) throw new Error('Registration has already been confirmed');
    return true;
  });

/*Комбинируем вышеуказанные middlewares в один middleware для использования его при проверке запросов по аутентификации
пользователя.*/
export const authUserInputValidation = [loginOrEmailValidation, passwordValidation];

/*Комбинируем вышеуказанные middlewares в один middleware для использования его при проверке запросов по установлению
нового пароля пользователя по коду восстановления.*/
export const setNewPasswordByRecoveryCodeInputValidation = [newPasswordValidation, recoveryCodeValidation];
