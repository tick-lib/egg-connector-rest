'use strict';

const { Types } = require('mongoose');

const data = [
  {
    _id: new Types.ObjectId('aaaaaaaaaaaaaaaaaaaaa001'),
    title: 'title1',
    desc: 'desc1',
    content: 'content1 belong user 2',
    userId: 1,
  },
  {
    _id: new Types.ObjectId('aaaaaaaaaaaaaaaaaaaaa002'),
    title: 'title2',
    desc: 'desc2',
    content: 'content2 belong user 2',
    userId: 2,
  },
  {
    _id: new Types.ObjectId('aaaaaaaaaaaaaaaaaaaaa003'),
    title: 'title3',
    desc: 'desc3',
    content: 'content3 belong user 1',
    userId: 1,
  },
];

module.exports = data;
