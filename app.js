const express = require("express");
require("dotenv").config();
const bodyParser = require("body-parser");
const userRouter = require("./router/user.router");
const postRouter = require("./router/post.router");
const app = express();
const cors = require("cors");

const mongoose = require("mongoose");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.get("/", (req, res) => {
  console.log(res);
  res.send("Hello World");
});

//#region connect to MONGODB

mongoose
  .connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(function (success) {
    console.info("connected to database...");
  })
  .catch(function (e) {
    console.info("fail to connect..");
    console.log(e.stack);
  });
////#endregion

app.use("/user", userRouter);
app.use("/post", postRouter);

app.listen(3000, () => {
  console.log(`Server running on port ${process.env.PORT}...`);
});
