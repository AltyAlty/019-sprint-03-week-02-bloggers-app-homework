import { Router } from 'express';
import { SETTINGS } from '../../core/settings/settings';
import { container } from '../../composition-root';
import { TestingController } from './testing.controller';

/**/
const testingController = container.get<TestingController>(TestingController);

/*Роутер из Express для тестирования приложения.*/
export const testingRouter = Router({});

/*Конфигурируем роутер "testingRouter".*/
testingRouter
  /*DELETE-запрос по очистке БД для целей тестирования.*/
  .delete(SETTINGS.CLEAR_DB_PATH, testingController.clearDBHandler.bind(testingController));
