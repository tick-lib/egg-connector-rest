'use strict';

const { Types } = require('mongoose');

const data = [
  {
    _id: new Types.ObjectId('aaaaaaaaaaaaaaaaaaaab001'),
    username: 'u1',
    password: '123456',
    desc: 'desc',
  },
  {
    _id: new Types.ObjectId('aaaaaaaaaaaaaaaaaaaab002'),
    username: 'u2',
    password: '123456',
    desc: 'desc2',
  },
  {
    _id: new Types.ObjectId('aaaaaaaaaaaaaaaaaaaab003'),
    username: 'u3',
    password: '123456',
    desc: 'desc2',
  },
];

module.exports = data;
