import { WithId } from 'mongodb';
import { RecoveryCodeType } from '../../application/types/recovery-code.type';

/*Тип для кода восстановления пароля пользователя в БД.*/
export type RecoveryCodeDBType = WithId<RecoveryCodeType>;
