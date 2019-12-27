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
  const Article = mongoose.model('Article', ArticleSchema);

  Article.BelongOwnerById = async function BelongOwnerById(userId, id) {
    if (!userId || !id) {
      return false;
    }
    logger('userId: %o, id: %o', userId, id);
    const instance = await Article.find({ userId, _id: id });
    return !!instance;
  };

  /**
   * 排除未找到错误
   * @param  {String} msg 错误描述
   * @return {Error} error
   */
  Article.errorModelNotFound = function(msg = 'Not found Model') {
    const error = new Error(msg);
    error.statusCode = 404;
    error.code = 'MODEL_NOT_FOUND';
    return error;
  };

  Article.findByPk = Article.findById;

  Article.index = async function(ctx, filter) {
    const list = Article.find(filter);
    return list;
  };

  Article.prototype.show = async function() {
    return this;
  };

  Article.countAll = async function(ctx, filter) {
    const count = await Article.countDocuments(filter);
    return { count };
  };

  Article.exists = async function(ctx, id) {
    const instance = await Article.findByPk(id);
    return { exists: !!instance };
  };

  Article.destroyById = async function(ctx, id) {
    const instance = await this.findByPk(id);
    if (instance) {
      await instance.remove();
      return instance;
    }
    throw this.errorModelNotFound(`Unknown ${this.name} id ${id}`);
  };

  Article.create = async function(ctx, data) {
    const instance = new Article(data);
    return instance.save();
  };

  Article.prototype.updateAttributes = async function(ctx, data) {
    const instance = this;
    Object.keys(data).forEach(key => {
      instance[key] = data[key];
    });

    await instance.save();

    return instance;
  };

  Article.updateAll = async function(ctx, data, where = {}) {
    const { ok } = await Article.update({ where }, data);
    return { affected: ok };
  };

  return Article;
};
