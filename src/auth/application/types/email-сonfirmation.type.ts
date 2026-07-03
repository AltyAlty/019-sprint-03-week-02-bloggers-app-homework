/*Тип для данных о подтверждении регистрации пользователя.*/
export type EmailConfirmationType = {
  userId: string;
  confirmationCode: string;
  expirationDate: Date;
};
