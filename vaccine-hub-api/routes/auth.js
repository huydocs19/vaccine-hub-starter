const express = require("express")
const User = require("../models/user")
const router = express.Router()

router.post("/login", async (req, res, next) => {
    try {
      // take the user's email and password and attempt to authenticate them
      const user = await User.login(req.body)
      res.status(200).json({user})
    } catch (err) {
      next(err)
    }
})

router.post("/register", async (req, res, next) => {
    try {
      // take the user's info (e.g. name, email and password) and create a new
      // user in our database
      console.log("here")
      const user = await User.register(req.body)
      res.status(200).json({user})
    } catch (err) {
      next(err)
    }
})

module.exports = router