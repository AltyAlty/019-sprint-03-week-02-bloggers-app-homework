import { WithId } from 'mongodb';
import { RecoveryCodeDataType } from '../../application/types/recovery-code-data.type';

/*Тип для данных о коде восстановления пароля пользователя в БД.*/
export type RecoveryCodeDataDBType = WithId<RecoveryCodeDataType>;
