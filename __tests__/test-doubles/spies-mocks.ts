import { NodemailerAdapter } from '../../src/auth/adapters/nodemailer.adapter';

/*Одновременно шпион и мок для метода "nodemailerAdapter.sendMail()".*/
export const createNodemailerAdapterSendMailSpyAndMock = (): jest.SpyInstance => {
  return jest.spyOn(NodemailerAdapter, 'sendMail').mockImplementation(() => Promise.resolve(true));
};
