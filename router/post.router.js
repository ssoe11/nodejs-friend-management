const express = require("express");
const router = express.Router();
const Post = require("./../model/post.model");
const User = require("./../model/user.model");

//#region post update
router.route("/update").post((req, res) => {
  let _firstEmail = req.body.email;
  let _secondEmail = req.body.friendEmail;
  let _text = req.body.text;

  //check if both emails in db from user collection
  //User.findTwoEmails(_firstEmail, _secondEmail);
  User.findOne({ email: _firstEmail })
    .then((firstEmail) => {
      //find email in db
      if (!firstEmail) {
        return res.json({
          status: "error",
          message: "Email(s) cannot be found",
        });
      } else {
        //find friend email in db
        User.findOne({ email: _secondEmail })
          .then((secondEmail) => {
            if (!secondEmail) {
              return res.json({
                status: "error",
                message: "Friend's email cannot be found",
              });
            } else {
              //create new post
              const post = new Post({
                email: _secondEmail,
                text: _text,
                createdAt: Date.now(),
                postBy: firstEmail._id,
              });

              //save the newly created post
              post
                .save()
                .then((result) => {
                  console.log(result);
                })
                .catch((err) => {
                  console.log(err.stack);
                });

              User.findOneAndUpdate(
                { email: _firstEmail },
                { $push: { posts: post._id } },
                { new: true }
              ).then((user) => console.log("updated:" + user));
              // User.findOne({ email: _firstEmail }).then((d) =>
              //   d.posts.push(result._id)
              // );
              res.json({
                status: "succesful",
                message: "Updates succesfully posted",
                data: post,
              });
            }
          })
          .catch((err) => console.log(err.stack));
      }
    })
    .catch((err) => console.log(err.stack));
});

module.exports = router;
