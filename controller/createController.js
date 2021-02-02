const express = require('express');
const mongoose = require('mongoose');

const qpm = require('query-params-mongo');
const _ = require('lodash');
const { validationResult } = require('express-validator');

module.exports = (controller, formSchema = {}, methods = ['list', 'get', 'count', 'create', 'remove', 'update']) => {
  const router = express.Router();
  const processQuery = qpm();

  const validationMiddleware = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    return next();
  };

  const queryParseMiddleware = (req, res, next) => {
    try {
      req.mongoQuery = processQuery(req.query);
    } catch (err) {
      return res.status(500).json({ message: 'query error' });
    }
    return next();
  };

  const afterMiddlewares = [validationMiddleware, queryParseMiddleware];

  // const controller = controller2;

  if (methods.includes('create')) {
    // create
    if (formSchema.create) {
      router.post('/', formSchema.create, afterMiddlewares, async (req, res) => {
        try {
          return res.json(await controller.create(req.body));
        } catch (err) {
          return res.status(500).json({ message: 'db error' });
        }
      });
    } else {
      router.post('/', afterMiddlewares, async (req, res) => {
        try {
          return res.json(await controller.create(req.body));
        } catch (err) {
          return res.status(500).json({ message: 'db error' });
        }
      });
    }
  }

  if (methods.includes('update')) {
    // update
    if (formSchema.update) {
      router.put('/:id', formSchema.update, afterMiddlewares, async (req, res) => {
        try {
          const ret = await controller.update({ _id: mongoose.Types.ObjectId(req.params.id), ...req.mongoQuery.filter }, req.body);
          return res.json({ success: ret !== null });
        } catch (err) {
          return res.status(500).json({ message: 'db error' });
        }
      });
    } else {
      router.put('/:id', afterMiddlewares, async (req, res) => {
        try {
          const ret = await controller.update({ _id: mongoose.Types.ObjectId(req.params.id), ...req.mongoQuery.filter }, req.body);
          return res.json({ success: ret !== null });
        } catch (err) {
          return res.status(500).json({ message: 'db error' });
        }
      });
    }
  }

  if (methods.includes('remove')) {
    // delete
    if (formSchema.remove) {
      router.delete('/:id', formSchema.remove, afterMiddlewares, async (req, res) => {
        try {
          return res.json(await controller.remove({ _id: mongoose.Types.ObjectId(req.params.id), ...req.mongoQuery.filter }));
        } catch (err) {
          return res.status(500).json({ message: 'db error' });
        }
      });
    } else {
      router.delete('/:id', afterMiddlewares, async (req, res) => {
        try {
          return res.json(await controller.remove({ _id: mongoose.Types.ObjectId(req.params.id), ...req.mongoQuery.filter }));
        } catch (err) {
          return res.status(500).json({ message: 'db error' });
        }
      });
    }
  }

  if (methods.includes('count')) {
    // count
    if (formSchema.count) {
      router.get('/count', formSchema.count, afterMiddlewares, async (req, res) => {
        try {
          let count;
          if (_.isEqual(req.mongoQuery.filter, {})) {
            // no filter query
            count = await controller.count(req.mongoQuery.filter);
          } else {
            count = await controller.countDocuments(req.mongoQuery.filter);
          }
          return res.json({ count });
        } catch (err) {
          return res.status(500).json({ message: 'db error' });
        }
      });
    } else {
      router.get('/count', afterMiddlewares, async (req, res) => {
        try {
          let count;
          if (_.isEqual(req.mongoQuery.filter, {})) {
            // no filter query
            count = await controller.count(req.mongoQuery.filter);
          } else {
            count = await controller.countDocuments(req.mongoQuery.filter);
          }
          return res.json({ count });
        } catch (err) {
          return res.status(500).json({ message: 'db error' });
        }
      });
    }
  }

  if (methods.includes('list')) {
    // get list
    if (formSchema.list) {
      router.get('/', formSchema.list, afterMiddlewares, async (req, res) => {
        const {
          filter,
          sort,
          limit,
          offset,
          skip,
        } = req.mongoQuery;

        try {
          return res.json(await controller.list(filter, {
            sort, limit, offset, skip,
          }));
        } catch (err) {
          return res.status(500).json({ message: 'db error' });
        }
      });
    } else {
      router.get('/', afterMiddlewares, async (req, res) => {
        try {
          const {
            filter,
            sort,
            limit,
            offset,
            skip,
          } = req.mongoQuery;

          return res.json(await controller.list(filter, {
            sort, limit, offset, skip,
          }));
        } catch (err) {
          return res.status(500).json({ message: 'db error' });
        }
      });
    }
  }

  if (methods.includes('get')) {
    // get one
    if (formSchema.get) {
      router.get('/:id', formSchema.get, afterMiddlewares, async (req, res) => {
        try {
          return res.json(await controller.get({ _id: mongoose.Types.ObjectId(req.params.id), ...req.mongoQuery.filter }));
        } catch (err) {
          return res.status(500).json({ message: 'db error' });
        }
      });
    } else {
      router.get('/:id', afterMiddlewares, async (req, res) => {
        try {
          return res.json(await controller.get({ _id: mongoose.Types.ObjectId(req.params.id), ...req.mongoQuery.filter }));
        } catch (err) {
          return res.status(500).json({ message: 'db error' });
        }
      });
    }
  }

  return router;
};
