import { NodemailerAdapter } from '../../src/auth/adapters/nodemailer.adapter';
import { container } from '../../src/ioc/container';
import { TYPES } from '../../src/ioc/types';

/*Одновременно шпион и мок для метода "nodemailerAdapter.sendMail()".*/
export const createNodemailerAdapterSendMailSpyAndMock = (): jest.SpyInstance => {
  const nodemailerAdapter = container.get<NodemailerAdapter>(TYPES.NodemailerAdapter);
  return jest.spyOn(nodemailerAdapter, 'sendMail').mockImplementation(() => Promise.resolve(true));
};
