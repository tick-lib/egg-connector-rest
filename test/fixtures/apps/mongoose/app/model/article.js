'use strict';

// import * as debug from 'debug';
// const logger = debug('app:model:admin');

module.exports = function Admin(app) {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

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
        type: Number,
      },
    },
    {
      collection: 'articles',
      timestamps: false,
    }
  );

  ArticleSchema.virtual('id').get(id => id);
  ArticleSchema.set('toJSON', { virtuals: true });
  const Article = mongoose.model('Article', ArticleSchema);

  Article.BelongOwnerById = async function BelongOwnerById(userId, id) {
    if (!userId || !id) {
      return false;
    }
    const instance = await Article.findOne({ userId, id });
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
    return Article.find(filter);
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
      return instance.remove();
    }
    throw this.errorModelNotFound(`Unknown ${this.name} id ${id}`);
  };

  Article.create = async function(ctx, data) {
    const instance = new Article(data);
    return instance.save();
  };

  Article.prototype.updateAttributes = async function(ctx, data) {
    const instance = this;
    return instance.findOneAndUpdate({ _id: instance._id }, data);
  };

  Article.updateAll = async function(ctx, data, where = {}) {
    const { ok } = await Article.update({ where }, data);
    return { affected: ok };
  };

  return Article;
};
