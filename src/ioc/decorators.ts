import getDecorators from 'inversify-inject-decorators';
import { container } from './container';

/*Получаем декоратор "@lazyInject()", используя пакет inversify-inject-decorators. Обязательно нужно указывать в
отдельном файле для избежания циклической зависимости.*/
export const { lazyInject } = getDecorators(container);
