const express = require('express');
const mongoose = require('mongoose');

const qpm = require('query-params-mongo');
const _ = require('lodash');
const {validationResult} = require('express-validator');


module.exports = (controller, formSchema = {}, methods = ["list", "get", "count", "create", "remove", "update"]) => {
  const router = express.Router();

  const processQuery = qpm();

  // const c = controller(model);
  const c = controller;

  if (methods.includes("create")) {
    // create
    if (formSchema.create) {
      router.post("/", formSchema.create, async (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({errors: errors.array()});
        }
        try {
          return res.json(await c.create(req.body))

        } catch (err) {
          return res.status(500).json({message: "db error"});
        }
      });

    } else {
      router.post("/", async (req, res) => {
        res.json(await c.create(req.body))
      });
    }
  }

  if (methods.includes("update")) {
    // update
    if (formSchema.update) {
      router.put("/:id", formSchema.update, async (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({errors: errors.array()});
        }

        try {
          const ret = await c.update({_id: mongoose.Types.ObjectId(req.params.id)}, req.body)
          res.json({success: ret !== null})
        } catch (err) {
          return res.status(500).json({message: "db error"});

        }

      });
    } else {
      router.put("/:id", async (req, res) => {

        try {
          const ret = await c.update({_id: mongoose.Types.ObjectId(req.params.id)}, req.body)
          res.json({success: ret !== null})
        } catch (err) {
          return res.status(500).json({message: "db error"});

        }

      });
    }
  }

  if (methods.includes("remove")) {
    // delete
    if (formSchema.remove) {
      router.delete("/:id", formSchema.remove, async (req, res) => {
        try {

          return res.json(await c.remove({_id: mongoose.Types.ObjectId(req.params.id)}))
        } catch (err) {
          return res.status(500).json({message: "db error"});
        }
      });
    } else {
      router.delete("/:id", async (req, res) => {
        try {
          return res.json(await c.remove({_id: mongoose.Types.ObjectId(req.params.id)}))
        } catch (err) {
          return res.status(500).json({message: "db error"});
        }
      });
    }

  }


  if (methods.includes("count")) {
    // count
    if (formSchema.count) {
      router.get("/count", formSchema.count, async (req, res) => {

        let query;
        try {
          query = processQuery(req.query);
        } catch (err) {
          return res.status(500).json({message: "query error"});
        }
        const {filter} = query;

        try {
          let count;
          if (_.isEqual(filter, {})) {
            // no filter query
            count = await c.count(filter)
          } else {
            count = await c.countDocuments(filter)
          }
          return res.json({count})
        } catch (err) {
          return res.status(500).json({message: "db error"});
        }
      });
    } else {
      router.get("/count", async (req, res) => {

        let query;
        try {
          query = processQuery(req.query);
        } catch (err) {
          return res.status(500).json({message: "query error"});
        }
        const {filter} = query;

        try {
          let count;
          if (_.isEqual(filter, {})) {
            // no filter query
            count = await c.count(filter)
          } else {
            count = await c.countDocuments(filter)
          }
          return res.json({count})
        } catch (err) {
          return res.status(500).json({message: "db error"});
        }
      });

    }


  }

  if (methods.includes("list")) {
    // get list
    if (formSchema.list) {
      router.get("/", formSchema.list, async (req, res) => {
        let query;
        try {
          query = processQuery(req.query);
        } catch (err) {
          return res.status(500).json({message: "query error"});
        }
        const {
          filter,
          sort,
          limit,
          offset,
          skip
        } = query;

        try {
          res.json(await c.list(filter, {sort, limit, offset, skip}))
        } catch (err) {
          return res.status(500).json({message: "db error"});
        }
      });

    } else {
      router.get("/", async (req, res) => {
        let query;
        try {
          query = processQuery(req.query);
        } catch (err) {
          return res.status(500).json({message: "query error"});
        }
        const {
          filter,
          sort,
          limit,
          offset,
          skip
        } = query;

        try {
          res.json(await c.list(filter, {sort, limit, offset, skip}))
        } catch (err) {
          return res.status(500).json({message: "db error"});
        }
      });

    }
  }

  if (methods.includes("get")) {
    // get one
    if (formSchema.get) {
      router.get("/:id", formSchema.get, async (req, res) => {
        try {
          return res.json(await c.get({_id: mongoose.Types.ObjectId(req.params.id)}))
        } catch (err) {
          return res.status(500).json({message: "db error"});
        }
      });

    } else {
      router.get("/:id", async (req, res) => {
        try {
          return res.json(await c.get({_id: mongoose.Types.ObjectId(req.params.id)}))
        } catch (err) {
          return res.status(500).json({message: "db error"});
        }
      });

    }

  }


  return router;
}
