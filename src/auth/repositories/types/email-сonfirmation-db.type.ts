import { EmailConfirmationType } from '../../application/types/email-сonfirmation.type';
import { WithId } from 'mongodb';

/*Тип для данных о подтверждении регистрации пользователя в БД.*/
export type EmailConfirmationDBType = WithId<EmailConfirmationType>;
