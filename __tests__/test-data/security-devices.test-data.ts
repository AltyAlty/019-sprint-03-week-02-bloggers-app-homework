import { ObjectId } from 'mongodb';

export const validDeviceIds = { id_01: new ObjectId().toString() };

export const invalidDeviceIds = {
  id_01: 'ABC',
  id_02: 2,
  id_03: null,
};
