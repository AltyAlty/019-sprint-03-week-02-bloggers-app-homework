import { RecoveryCodeDataDBType } from '../types/recovery-code-data-db.type';
import { RecoveryCodeDataType } from '../../application/types/recovery-code-data.type';

/*Функция для преобразования данных о коде восстановления пароля пользователя из БД в подготовленные для работы внутри
приложения данные о коде восстановления пароля пользователя.*/
export const mapToRecoveryCodeData = (recoveryCodeData: RecoveryCodeDataDBType): RecoveryCodeDataType => {
  return {
    userId: recoveryCodeData.userId,
    recoveryCode: recoveryCodeData.recoveryCode,
    expirationDate: recoveryCodeData.expirationDate,
  };
};
