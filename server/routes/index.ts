import express from "express";
userRoutes = express.Router();

userRoutes.get("/app", (req, res) => {
  res.send("It do be working");
});

export default userRoutes;
