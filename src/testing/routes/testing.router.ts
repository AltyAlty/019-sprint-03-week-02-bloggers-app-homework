import { Router } from 'express';
import { SETTINGS } from '../../core/settings/settings';
import { testingController } from '../../ioc/composition-root';

/*Роутер из Express для тестирования приложения.*/
export const testingRouter = Router({});

/*Конфигурируем роутер "testingRouter".*/
testingRouter
  /*DELETE-запрос по очистке БД для целей тестирования.*/
  .delete(SETTINGS.CLEAR_DB_PATH, testingController.clearDBHandler.bind(testingController));
