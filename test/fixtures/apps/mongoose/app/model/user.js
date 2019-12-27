'use strict';

const stream = require('stream');

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const UserSchema = new Schema(
    {
      username: {
        type: String,
      },
      password: {
        type: String,
      },
      desc: {
        type: String,
      },
    },
    {
      collection: 'users',
      timestamps: false,
    }
  );

  UserSchema.virtual('id').get(id => id);
  UserSchema.set('toJSON', { virtuals: true });

  const User = mongoose.model('User', UserSchema);

  User.findByPk = User.findById;

  /**
   * 排除未找到错误
   * @param  {String} msg 错误描述
   * @return {Error} error
   */
  User.errorModelNotFound = function(msg = 'Not found Model') {
    const error = new Error(msg);
    error.statusCode = 404;
    error.code = 'MODEL_NOT_FOUND';
    return error;
  };

  User.index = async function(ctx, filter) {
    return User.find(filter);
  };

  User.BelongOwnerById = async function BelongOwnerById(userId, id) {
    return parseInt(userId, 10) === parseInt(id, 10);
  };

  User.prototype.show = async function() {
    return this;
  };

  User.exists = async function(ctx, id) {
    const instance = await User.findByPk(id);
    return { exists: !!instance };
  };

  User.destroyById = async function(ctx, id) {
    const instance = await this.findByPk(id);
    if (instance) {
      return instance.remove();
    }
    throw this.errorModelNotFound(`Unknown ${this.name} id ${id}`);
  };

  User.create = async function(ctx, data) {
    const instance = new User(data);
    return instance.save();
  };

  User.prototype.updateAttributes = async function(ctx, data) {
    const instance = this;
    return instance.findOneAndUpdate({ _id: instance._id }, data);
  };

  User.updateAll = async function(ctx, data, where = {}) {
    const [ ok ] = await User.update({ where }, data);
    return { affected: ok };
  };

  User.prototype.uploadFile = async function(ctx, data, file1, file2) {
    let file1IsinstanceOfFileStream = false;
    if (file1 && file1.filename) {
      file1IsinstanceOfFileStream = file1 instanceof stream.Readable;
    }
    let file2IsinstanceOfFileStream = false;
    if (file2 && file2.filename) {
      file2IsinstanceOfFileStream = file2 instanceof stream.Readable;
    }
    const result = {
      file1Name: (file1 && file1.filename) || '',
      file2Name: (file2 && file2.filename) || '',
      file1IsinstanceOfFileStream,
      file2IsinstanceOfFileStream,
      data,
      userId: this.id,
    };

    return result;
  };

  return User;
};
