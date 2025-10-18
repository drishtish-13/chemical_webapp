const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/compoundController");
const { body } = require("express-validator");

console.log("routes/compounds.js loaded - controller keys:", ctrl && Object.keys(ctrl) );

const validateCompound = [
  body("name").trim().isLength({ min: 1 }).withMessage("Name is required"),
  body("image").trim().isURL().withMessage("Image must be a valid URL"),
  body("description").optional().isString()
];

router.get("/", ctrl.getPaginated);
router.get("/:id", ctrl.getById);
router.put("/:id", validateCompound, ctrl.update);
router.post("/", validateCompound, ctrl.create);
router.delete("/:id", ctrl.delete);

module.exports = router;
