module.exports = (Model, customHandler) => {

  const defaultHandler = {
    list: (filter = {}, options = null) => Model.find(filter, null, options),
    get: (filter = {}) => Model.findOne(filter),
    count: (filter = {}) => Model.estimatedDocumentCount(filter),
    countDocuments: (filter = {}) => Model.countDocuments(filter),
    create: (object = {}) => Model.create({...object, createdAt: Date.now()}),
    remove: (filter = {}) => Model.deleteOne(filter),
    update: (filter = {}, data = {}) => Model.findOneAndUpdate(filter, {...data, updatedAt: Date.now()}),
  }

  return {...defaultHandler, ...customHandler}
}
