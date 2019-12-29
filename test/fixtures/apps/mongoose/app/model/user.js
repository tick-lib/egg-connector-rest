'use strict';
// use es6 class

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

  class UserModel {
    errorModelNotFound(msg = 'Not found Model') {
      const error = new Error(msg);
      error.statusCode = 404;
      error.code = 'MODEL_NOT_FOUND';
      return error;
    }

    static async index(ctx, filter) {
      return this.find(filter);
    }

    static async BelongOwnerById(userId, id) {
      return parseInt(userId, 10) === parseInt(id, 10);
    }

    findByPk(...args) {
      return this.findById(...args);
    }

    async show() {
      return this;
    }

    static async exists(ctx, id) {
      const instance = await this.findById(id);
      return { exists: !!instance };
    }

    async updateAttributes(ctx, data) {
      const instance = this;
      return UserModel.findOneAndUpdate({ _id: instance._id }, data);
    }

    static async destroyById(ctx, id) {
      const instance = await this.findByPk(id);
      if (instance) {
        return instance.remove();
      }
      throw this.errorModelNotFound(`Unknown ${this.name} id ${id}`);
    }

    static create(ctx, data) {
      const Model = this;
      const instance = new Model(data);
      return instance.save();
    }

    static async updateAll(ctx, data, where = {}) {
      const [ ok ] = await UserModel.update({ where }, data);
      return { affected: ok };
    }

    async uploadFile(ctx, data, file1, file2) {
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
    }
  }

  UserSchema.loadClass(UserModel);

  const User = mongoose.model('User', UserSchema);

  return User;
};
