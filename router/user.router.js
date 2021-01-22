const express = require("express");
const router = express.Router();
const User = require("./../model/user.model");

//test
router.route("/").get((req, res) => {
  let filter = req.query;
  User.find(filter, (err, data) => {
    if (err) {
      console.log(err.stack);
      return res.status(500).send(err);
    }
    console.log(data.length);
    res.json(data);
  });
});

//#region add acount
router.route("/add-account").post((req, res) => {
  //check if email has already existing friend account
  User.findOne({ email: req.body.email }).then((data) => {
    //find email in db
    if (data) {
      return res.json({
        status: "error",
        message: "This email already has an existing account",
      });
    }
    let newAccount = new User({
      name: req.body.name,
      email: req.body.email,
    });

    //save the newly created post
    newAccount
      .save()
      .then((result) => {
        console.log(result);
        return res.json({
          status: "succesful",
          message: `Friend account succesfully created for ${req.body.name}`,
        });
      })
      .catch((err) => {
        console.log(err.stack);
      });
  });
});

//#endregion

//#region link up friends
router.route("/link-up").put((req, res) => {
  console.log(req.body);
  let _firstEmail = req.body.email;
  let _secondEmail = req.body.friendEmail;

  //check if both emails in db from user collection
  User.findOne({ email: _firstEmail })
    .then((firstEmail) => {
      //find email in db
      if (!firstEmail) {
        return res.json({ status: "error", message: "Email cannot be found" });
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
              //check if email1 is in the email2 friend list
              let friends_1 = firstEmail.friends;
              const found_1 = friends_1.find(
                (element) => element.email == _secondEmail
              );
              //link up - add friend list if not in the existing friend list
              if (!found_1) {
                let update = {
                  email: _secondEmail,
                  isBlock: false,
                  isSubscribe: false,
                };
                friends_1.push(update);
                User.findOneAndUpdate(
                  { email: _firstEmail },
                  { friends: friends_1 },
                  {
                    new: true,
                  }
                )
                  .then((data) => {
                    if (data) {
                    }
                  })
                  .catch((err) => console.log(err.stack));
              }

              //check if email2 is in the email1 friend list
              let friends_2 = secondEmail.friends;
              const found_2 = friends_2.find(
                (element) => element.email == _firstEmail
              );
              //link up - add friend list if not in the existing friend list
              if (!found_2) {
                let update = {
                  email: _firstEmail,
                  isBlock: false,
                  isSubscribe: false,
                };
                friends_2.push(update);
                User.findOneAndUpdate(
                  { email: _secondEmail },
                  { friends: friends_2 },
                  {
                    new: true,
                  }
                )
                  .then((data) => {
                    if (data) {
                      console.log(data);
                    }
                  })
                  .catch((err) => console.log(err.stack));
                return res.json({
                  status: "succesful",
                  message: "Succesfully Link up!",
                });
              } else
                return res.json({ message: "Both emails already link up" });
            }
          })
          .catch((err) => console.log(err.stack));
      }
    })
    .catch((err) => console.log(err.stack));
});

//#endregion link up friends

//#region list friends by email
router.route("/friends-list/:e").get((req, res) => {
  console.log(req.params.e);
  User.findOne({ email: req.params.e })
    .then((data) => {
      //find email in db
      if (!data) {
        return res.json({ status: "error", message: "Email cannot be found" });
      }
      res.json({ status: "succesful", result: data.friends });
    })
    .catch((err) => console.log(err.stack));
});
//#endregion list friends by email

//#region list friends with updates by email
router.route("/friends-update-list/:e").get((req, res) => {
  console.log(req.params.e);
  User.findOne({ email: req.params.e })
    .then((data) => {
      //find email in db
      if (!data) {
        return res.json({ status: "error", message: "Email cannot be found" });
      }

      let update = [];
      for (let i = 0; i < data.friends.length; i++) {
        if (
          data.friends[i].isBlock == false &&
          data.friends[i].isSubscribe == true
        ) {
          update.push(data.friends[i]);
        }
      }
      console.log(update);
      data.friends = update;

      res.json({ status: "succesful", result: data.friends });
    })
    .catch((err) => console.log(err.stack));
});
//#endregion list friends by email

//#region block friends
router.route("/block-friend").put((req, res) => {
  let _firstEmail = req.body.email;
  let _secondEmail = req.body.friendEmail;

  //check if both emails in db from user collection
  User.findOne({ email: _firstEmail })
    .then((firstEmail) => {
      //find email in db
      if (!firstEmail) {
        return res.json({ status: "error", message: "Email cannot be found" });
      }

      let index = firstEmail.friends.findIndex((e) => e.email == _secondEmail);
      firstEmail.friends[index].isBlock = true;
      User.findOneAndUpdate(
        { email: _firstEmail },
        { friends: firstEmail.friends }
      ).then((e) => {
        return res.json({
          status: "succesful",
          message: `Succesfully block ${_secondEmail}`,
        });
      });
    })
    .catch((err) => console.log(err.stack));
});
//#endregion block friends

//#region unblock friends
router.route("/unblock-friend").put((req, res) => {
  let _firstEmail = req.body.email;
  let _secondEmail = req.body.friendEmail;

  //check if both emails in db from user collection
  User.findOne({ email: _firstEmail })
    .then((firstEmail) => {
      //find email in db
      if (!firstEmail) {
        return res.json({ status: "error", message: "Email cannot be found" });
      }

      let index = firstEmail.friends.findIndex((e) => e.email == _secondEmail);
      firstEmail.friends[index].isBlock = false;
      User.findOneAndUpdate(
        { email: _firstEmail },
        { friends: firstEmail.friends }
      ).then((e) => {
        return res.json({
          status: "succesful",
          message: `Succesfully unblock ${_secondEmail}`,
        });
      });
    })
    .catch((err) => console.log(err.stack));
});
//#endregion unblock friends

//#region subscribe updates
router.route("/subscribe-update").put((req, res) => {
  let _firstEmail = req.body.email;
  let _secondEmail = req.body.friendEmail;

  //check if both emails in db from user collection
  User.findOne({ email: _firstEmail })
    .then((firstEmail) => {
      //find email in db
      if (!firstEmail) {
        return res.json({ status: "error", message: "Email cannot be found" });
      }

      let index = firstEmail.friends.findIndex((e) => e.email == _secondEmail);
      firstEmail.friends[index].isSubscribe = true;
      User.findOneAndUpdate(
        { email: _firstEmail },
        { friends: firstEmail.friends }
      ).then((e) => {
        return res.json({
          status: "succesful",
          message: `Succesfully subscribe to ${_secondEmail} update`,
        });
      });
    })
    .catch((err) => console.log(err.stack));
});
//#endregion subscribe updates

//#region unsubscribe updates
router.route("/unsubscribe-update").put((req, res) => {
  let _firstEmail = req.body.email;
  let _secondEmail = req.body.friendEmail;

  //check if both emails in db from user collection
  User.findOne({ email: _firstEmail })
    .then((firstEmail) => {
      //find email in db
      if (!firstEmail) {
        return res.json({ status: "error", message: "Email cannot be found" });
      }

      let index = firstEmail.friends.findIndex((e) => e.email == _secondEmail);
      firstEmail.friends[index].isSubscribe = false;
      User.findOneAndUpdate(
        { email: _firstEmail },
        { friends: firstEmail.friends }
      ).then((e) => {
        return res.json({
          status: "succesful",
          message: `Succesfully unsubscribe to ${_secondEmail} update`,
        });
      });
    })
    .catch((err) => console.log(err.stack));
});
//#endregion unsubscribe updates

//#region common friends
router.route("/common-friends").post((req, res) => {
  console.log(req.body);
  let _firstEmail = req.body.email;
  let _secondEmail = req.body.friendEmail;

  //check if both emails in db from user collection
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
              let friends_1 = firstEmail.friends;
              let friends_2 = secondEmail.friends;
              let matches = [];

              for (let i = 0; i < friends_1.length; i++) {
                for (let j = 0; j < friends_2.length; j++) {
                  if (friends_1[i].email === friends_2[j].email) {
                    matches.push({ email: friends_1[i].email });
                  }
                }
              }
              if (matches.length == 0) {
                return res.json({
                  status: "error",
                  message: "No Common Friends",
                });
              } else return res.json({ status: "succesful", data: matches });
            }
          })
          .catch((err) => console.log(err.stack));
      }
    })
    .catch((err) => console.log(err.stack));
});
//#endregion common friends
module.exports = router;
