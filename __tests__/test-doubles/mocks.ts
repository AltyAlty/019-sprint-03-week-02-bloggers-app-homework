import { NodemailerAdapter } from '../../src/auth/adapters/nodemailer.adapter';

/*Моковый адаптер для работы с email.*/
export const createMockEmailAdapter = (): jest.Mocked<typeof NodemailerAdapter> => {
  return { sendMail: jest.fn().mockResolvedValue(true) };
};
