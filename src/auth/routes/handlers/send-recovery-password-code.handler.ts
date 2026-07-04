import { Request, Response } from 'express';
import { PasswordRecoveryEmailInputDTO } from '../input-dto/password-recovery-email.input-dto';
import { Result } from '../../../core/types/result/result.type';
import { authService } from '../../application/auth.service';
import { HttpStatuses } from '../../../core/types/http-statuses';
import { mapResultCodeToHttpStatus } from '../../../core/utils/result/mappers/map-result-code-to-http-status';
import { errorsHandler } from '../../../core/errors/errors.handler';

/*Функция-обработчик для POST-запросов по отправке письма с кодом восстановления пароля пользователя.*/
export const sendRecoveryPasswordCodeHandler = async (
  req: Request<{}, {}, PasswordRecoveryEmailInputDTO>,
  res: Response<void>
): Promise<void | Response<void>> => {
  try {
    /*Получаем почту пользователя.*/
    const email: string = req.body.email;
    /*Просим сервис "authService" отправить письмо с кодом восстановления пароля пользователя.*/
    const sendRecoveryPasswordCodeResult: Result<{} | null> = await authService.sendRecoveryPasswordCode(email);

    /*Получаем HTTP-статус операции по отправке письма с кодом восстановления пароля пользователя.*/
    const sendRecoveryPasswordCodeResultHttpStatus: HttpStatuses = mapResultCodeToHttpStatus(
      sendRecoveryPasswordCodeResult.status
    );

    /*Сообщаем клиенту об отправке письма с кодом восстановления пароля пользователя.*/
    return res.sendStatus(sendRecoveryPasswordCodeResultHttpStatus);
  } catch (error: unknown) {
    /*Если была перехвачена ошибка, то обрабатываем ее.*/
    return errorsHandler(error, res);
  }
};
