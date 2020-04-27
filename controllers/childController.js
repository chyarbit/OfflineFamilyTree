// require dependencies
const express = require('express');
const router = express.Router();
const db = require('../models');

// get routes
    // getAllChildren
    router.get("/api/children", (req,res)=>{
        db.Child.findAll({})
          .then(results => res.json(results))
          .catch(error => res.json(error))
      })
    // getOneChild
    router.get("/api/children/:id", (req, res)=>{
        db.Child.findOne({
            where:{
                id: req.params.id
            }
        })
        .then(results => res.json(results))
        .catch(error => res.json(error))
      })
    
    // getEntireFamilyTree
    router.get("/api/family", (req, res)=>{
        db.Child.findAll({
            // INNER JOIN on parents
            include: {
                model: db.Parent
            }
           
            })
        .then(results => res.json(results))
        .catch(error => res.json(error))
      })

// post routes
    // addChild
    router.post("/api/children", (req,res) =>{
        db.Child.create(req.body)
        .then(results => res.json(results))
        .catch(error => res.json(error))
    })

// update routes- backend only- not available on the front end
// updateChildren
  router.put("/api/children/:id", (req,res) =>{
    db.Child.update(req.body, {
        where: {
            id: req.params.id
        }
    })
    .then(results => res.json(results))
    .catch(error => res.json(error))
})
module.exports = router;