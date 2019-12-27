'use strict';

const { Types } = require('mongoose');

const data = [
  {
    _id: new Types.ObjectId('aaaaaaaaaaaaaaaaaaaaa001'),
    title: 'title1',
    desc: 'desc1',
    content: 'content1 belong user 2',
    userId: new Types.ObjectId('aaaaaaaaaaaaaaaaaaaab001'),
  },
  {
    _id: new Types.ObjectId('aaaaaaaaaaaaaaaaaaaaa002'),
    title: 'title2',
    desc: 'desc2',
    content: 'content2 belong user 2',
    userId: new Types.ObjectId('aaaaaaaaaaaaaaaaaaaab002'),
  },
  {
    _id: new Types.ObjectId('aaaaaaaaaaaaaaaaaaaaa003'),
    title: 'title3',
    desc: 'desc3',
    content: 'content3 belong user 1',
    userId: new Types.ObjectId('aaaaaaaaaaaaaaaaaaaab001'),
  },
];

module.exports = data;
