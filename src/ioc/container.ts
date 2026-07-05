import { Container } from 'inversify';

/*Создаем IoC-контейнер, используя фреймворк "InversifyJS". Обязательно нужно указывать в отдельном файле для избежания
циклической зависимости.*/
export const container: Container = new Container();
