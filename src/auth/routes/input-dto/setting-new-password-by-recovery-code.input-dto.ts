/*Input DTO для установления нового пароля пользователя по коду восстановления.*/
export type settingNewPasswordByRecoveryCodeInputDTO = {
  newPassword: string;
  recoveryCode: string;
};
