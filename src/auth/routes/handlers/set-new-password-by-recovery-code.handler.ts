import { Request, Response } from 'express';
import { ExtensionType, Result } from '../../../core/types/result/result.type';
import { HttpStatuses } from '../../../core/types/http-statuses';
import { mapResultCodeToHttpStatus } from '../../../core/utils/result/mappers/map-result-code-to-http-status';
import { errorsHandler } from '../../../core/errors/errors.handler';
import { settingNewPasswordByRecoveryCodeInputDTO } from '../input-dto/setting-new-password-by-recovery-code.input-dto';
import { usersService } from '../../../users/application/users.service';

/*Функция-обработчик для POST-запросов по установлению нового пароля пользователя по коду восстановления.*/
export const setNewPasswordByRecoveryCodeHandler = async (
  req: Request<{}, {}, settingNewPasswordByRecoveryCodeInputDTO>,
  res: Response<void | ExtensionType[]>
): Promise<void | Response<void | ExtensionType[]>> => {
  try {
    /*Получаем новый пароль пользователя.*/
    const password: string = req.body.newPassword;
    /*Получаем код восстановления пароля пользователя.*/
    const recoveryCode: string = req.body.recoveryCode;

    /*Просим сервис "usersService" установить новый пароль пользователя по коду восстановления.*/
    const updatePasswordByRecoveryCodeResult: Result<{} | null> = await usersService.updatePasswordByRecoveryCode(
      recoveryCode,
      password
    );

    /*Получаем HTTP-статус операции по установлению нового пароль пользователя по коду восстановления.*/
    const updatePasswordByRecoveryCodeResultHttpStatus: HttpStatuses = mapResultCodeToHttpStatus(
      updatePasswordByRecoveryCodeResult.status
    );

    /*Если установление нового пароля пользователя по коду восстановления не прошла успешно, то сообщаем об этом
    клиенту.*/
    if (updatePasswordByRecoveryCodeResultHttpStatus !== HttpStatuses.NoContent_204) {
      return res
        .status(updatePasswordByRecoveryCodeResultHttpStatus)
        .send(updatePasswordByRecoveryCodeResult.extensions);
    }

    /*Если установление нового пароля пользователя по коду восстановления прошла успешно, то сообщаем об этом клиенту.*/
    return res.sendStatus(updatePasswordByRecoveryCodeResultHttpStatus);
  } catch (error: unknown) {
    /*Если была перехвачена ошибка, то обрабатываем ее.*/
    return errorsHandler(error, res);
  }
};
