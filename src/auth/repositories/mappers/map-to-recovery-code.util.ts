import { RecoveryCodeDBType } from '../types/recovery-code-db.type';
import { RecoveryCodeType } from '../../application/types/recovery-code.type';

/*Функция для преобразования кода восстановления пароля пользователя из БД в подготовленный для работы внутри приложения
код восстановления пароля пользователя.*/
export const mapToRecoveryCode = (recoveryCode: RecoveryCodeDBType): RecoveryCodeType => {
  return {
    userId: recoveryCode.userId,
    recoveryCode: recoveryCode.recoveryCode,
    expirationDate: recoveryCode.expirationDate,
  };
};
