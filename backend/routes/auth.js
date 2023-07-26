const express = require("express");
const User = require("../models/User");

const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
var fetchuser = require('../middleware/fetchuser');

const JWT_SECRET = "manu is a good boy";

//ROUTE-1create a user using : post "/api/auth/createuser".no login required

router.post(
  "/createuser",
  [
    body("name", "enter a valid name").isLength({ min: 3 }),
    body("email", "enter a valid email").isEmail(),
    body("password", "password must be atleast five character").isLength({ min: 5, }),
  ],
  async (req, res) => {
    let success=false;
    //if there are error ,return bad request nd the errors

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({success, errors: errors.array() });
    }
    //check weather the user with this email exist already
    try {
      let user = await User.findOne({ email: req.body.email });

      if (user) {
        return res.status(400).json({success,error:"sorry the user with this email already exist" })
      }
      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);
      //create a new user
      user = await User.create({
        name: req.body.name,
        password: secPass,
        email: req.body.email,
      });
      const data = {
        user: {
          id: user.id,
        },
      };
      const authtoken = jwt.sign(data, JWT_SECRET);

      //res.json(user);
      success=true;
      res.json({ success, authtoken });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("internal server error ");
    }
  }
);

//ROUTE-2 authenticate a user using : post "/api/auth/login".no login required

router.post( "/login", [
    body("email", "enter a valid email").isEmail(),
    body("password", "password can not be blanked").exists(),
  ],
  async (req, res) => {
    let success=false;
    //if there are error ,return bad request nd the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        success=false
        return res.status(400) .json({ error: "please try to login with correct credentials" });
      }
      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        success=false
        return res .status(400) .json({success, error: "please try to login with correct credentials" });
      }

      const data = {
        user: {
          id: user.id,
        },
      };
      const authtoken = jwt.sign(data, JWT_SECRET);
      success=true;
      res.json({success, authtoken });

    } catch (error) {
      console.error(error.message);
      res.status(500).send("internal server error ");
    }

    
  });


//ROUTE-3 get logged in user detail using : post "/api/auth/getuser".no login required

router.post("/getuser", fetchuser ,async (req, res) => {

 try {
      userId = req.user.id;
      const user = await User.findById(userId).select("-password")
      res.send(user)
    } catch (error) {
      console.error(error.message);
      res.status(500).send("internal server error ");
    }
  })

module.exports = router
