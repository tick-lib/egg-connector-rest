'use strict';

const logger = require('debug')('app:model:admin');

module.exports = function Admin(app) {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
  const Types = mongoose.Types;

  const ArticleSchema = new Schema(
    {
      title: {
        type: String,
      },
      desc: {
        type: String,
      },
      content: {
        type: String,
      },
      userId: {
        type: Types.ObjectId,
      },
    },
    {
      collection: 'articles',
      timestamps: false,
    }
  );

  ArticleSchema.pre('save', function(next) {
    this.increment();
    next();
  });

  ArticleSchema.virtual('id').get(id => id);
  ArticleSchema.set('toJSON', { virtuals: true });

  ArticleSchema.statics.index = async function(ctx, filter) {
    const list = this.find(filter);
    return list;
  };


  ArticleSchema.statics.BelongOwnerById = async function BelongOwnerById(userId, id) {
    if (!userId || !id) {
      return false;
    }
    logger('userId: %o, id: %o', userId, id);
    const instance = await this.find({ userId, _id: id });
    return !!instance;
  };

  /**
   * 排除未找到错误
   * @param  {String} msg 错误描述
   * @return {Error} error
   */
  ArticleSchema.statics.errorModelNotFound = function(msg = 'Not found Model') {
    const error = new Error(msg);
    error.statusCode = 404;
    error.code = 'MODEL_NOT_FOUND';
    return error;
  };

  ArticleSchema.statics.findByPk = ArticleSchema.findById;


  ArticleSchema.methods.show = async function() {
    return this;
  };

  ArticleSchema.statics.countAll = async function(ctx, filter) {
    const count = await this.countDocuments(filter);
    return { count };
  };

  ArticleSchema.statics.exists = async function(ctx, id) {
    const instance = await this.findById(id);
    return { exists: !!instance };
  };

  ArticleSchema.statics.destroyById = async function(ctx, id) {
    const instance = await this.findById(id);
    if (instance) {
      await instance.remove();
      return instance;
    }
    throw this.errorModelNotFound(`Unknown ${this.name} id ${id}`);
  };

  ArticleSchema.statics.create = async function(ctx, data) {
    const Article = this;
    const instance = new Article(data);
    return instance.save();
  };

  ArticleSchema.methods.updateAttributes = async function(ctx, data) {
    const instance = this;
    Object.keys(data).forEach(key => {
      instance[key] = data[key];
    });

    await instance.save();

    return instance;
  };

  ArticleSchema.statics.updateAll = async function(ctx, data, where = {}) {
    const { ok } = await this.update({ where }, data);
    return { affected: ok };
  };

  const Article = mongoose.model('Article', ArticleSchema);

  return Article;
};
