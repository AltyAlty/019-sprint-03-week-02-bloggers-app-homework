/*Тип для данных о коде восстановления пароля пользователя.*/
export type RecoveryCodeDataType = {
  userId: string;
  recoveryCode: string;
  expirationDate: Date;
};
