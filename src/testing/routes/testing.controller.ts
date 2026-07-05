import { Request, Response } from 'express';
import { HttpStatuses } from '../../core/types/http-statuses';
import { db } from '../../db/mongodb/mongo.db';
import { errorsHandler } from '../../core/errors/errors.handler';
import { injectable } from 'inversify';

/*Контроллер для тестирования приложения.*/
@injectable()
export class TestingController {
  /*Метод-обработчик для DELETE-запросов по очистке БД для целей тестирования.*/
  async clearDBHandler(req: Request, res: Response): Promise<void | Response> {
    try {
      /*Очищаем коллекции.*/
      await db.dropDB();
      /*Сообщаем об очистке БД клиенту.*/
      return res.sendStatus(HttpStatuses.NoContent_204);
    } catch (error: unknown) {
      /*Если была перехвачена ошибка, то обрабатываем ее.*/
      return errorsHandler(error, res);
    }
  }
}
