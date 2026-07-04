/*Тип для кода восстановления пароля пользователя.*/
export type RecoveryCodeType = {
  userId: string;
  recoveryCode: string;
  expirationDate: Date;
};
