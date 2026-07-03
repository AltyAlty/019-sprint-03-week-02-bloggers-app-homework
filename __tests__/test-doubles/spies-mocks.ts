import { nodemailerAdapter } from '../../src/auth/adapters/nodemailer.adapter';

/*Одновременно шпион и мок для метода "nodemailerAdapter.sendMail()".*/
export const createNodemailerAdapterSendMailSpyAndMock = (): jest.SpyInstance => {
  return jest.spyOn(nodemailerAdapter, 'sendMail').mockImplementation(() => Promise.resolve(true));
};
