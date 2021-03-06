var user = require("../Model/user");
const CommonUtil = require("../util/CommonUtils");
const bcrypt = require("bcryptjs");
let app = require("../util/expressUtils").app;
var session = require("express-session");
var sessionObj;
app.use(session({ secret: "ssshhhhh" }));

//user registration
exports.userRegistration = function (req, res) {
  console.log("inside registration function");
  var userDetails = new user();
  let utcDate = new Date();

  userDetails.name = req.body.name;
  userDetails.emailID = req.body.emailID;
  userDetails.phoneNo = req.body.phoneNo;
  userDetails.dob = req.body.dob;
  userDetails.gender = req.body.gender;
  if (userDetails.roles == null) {
    console.log(
      "userDetails.roles...........................",
      userDetails.roles
    );
    userDetails.roles = "guest";
  } else userDetails.roles = req.body.roles;
  userDetails.userId = CommonUtil.generateId("C");
  userDetails.createdOn = utcDate;
  userDetails.createdBy = "self";
  userDetails.updatedOn = utcDate;
  userDetails.updatedBy = "guest";
  userDetails.password = req.body.password;
  userDetails.reportingId = "";

  userDetails.save(function (err, results) {
    console.log("inside save");
    if (err) {
      res.send({ success: false, data: err });
    }
    res.send({ success: true, message: "Registered Successfully" });
  });
};

//login
// exports.login = function(req, res) {
//   sessionObj = req.session;
//   console.log("inside login", req.body);
//   let email = req.body.emailID;
//   let password = req.body.password;
//   user.findOne({ emailID: email }, function(err, results) {
//     console.log("resuls>>>>>>>>>>>>>>>>>>>>>>>>>>>>", results);

//     if (err) {
//       res.send({ success: false, data: err });
//     } else {
//       bcrypt.hash(password, results.secret, (err, hash) => {
//         console.log("inside bcrypt");
//         if (hash == results.password) {
//           sessionObj.email = results.emailID;
//           sessionObj.role = results.roles;
//           session.userId = results.userId;
//           console.log(
//             "sessionObj.userId>>>>>>>>>>>>>>>",
//             JSON.stringify(sessionObj.email)
//           );
//           res.status(200).send({ success: true, data: results });
//         } else {
//           res.send({
//             success: false,
//             message: "Email and password does not match"
//           });
//         }
//       });
//     }
//   });
// };
var validatePassword = function (password, objToCompare, callback) {
  let incomingObj = objToCompare;
  bcrypt.hash(password, incomingObj.secret, (err, hash) => {
    if (hash == incomingObj.password) {
      sessionObj.email = incomingObj.emailID;
      sessionObj.role = incomingObj.roles;
      session.userId = incomingObj.userId;
      console.log(
        "sessionObj.userId>>>>>>>>>>>>>>>",
        JSON.stringify(sessionObj.email)
      );
      callback({ success: true, data: incomingObj });
    } else {
      callback({
        success: false,
        message: "Email and password does not match"
      });
    }
  });
};
//login
exports.login = function (req, res) {
  sessionObj = req.session;
  console.log("inside login", req.body);
  let email = req.body.emailID;
  let password = req.body.password;
  user.findOne({ emailID: email }, function (err, results) {
    console.log("resuls>>>>>>>>>>>>>>>>>>>>>>>>>>>>", results);

    if (err) {
      res.send({ success: false, data: err });
    } else {
      validatePassword(password, results, result => {
        result.success ? res.status(200).send(result) : res.send(result);
      });
    }
  });
};

//get all users
exports.getUsers = function (req, res) {
  // var userDetails = new user()
  user
    .find({})
    .then(function (results) {
      res.send({ status: 200, success: true, data: results });
    })
    .catch(err => {
      res.send({ success: false, data: err });
    });
};

//delete user
exports.deleteUser = function (req, res) {
  user.findOneAndRemove({ userId: req.params.id }, function (err, results) {
    console.log(req.params.id);
    if (err) {
      res.send({ success: false, data: err });
    }
    res.send({
      status: 200,
      success: true,
      message: "User Deleted Successfully"
    });
  });
};

//update Details by Admin
exports.updateDetails = function (req, res) {
  user
    .findOneAndUpdate({ userId: req.params.id }, { $set: req.body })
    .then(function (results) {
      console.log("req.body>>>>>>>>>>>>>>>>>>", req.body, req.params.id);
      console.log("results>>>>>>>>>>>>>>>>>>", results);
      res.send({
        status: 200,
        success: true,
        message: "Details Update Successfully"
      });
    })
    .catch(err => {
      res.send({ success: false, data: err });
    });
};

//update details By Manager
exports.updateDetailsByMg = function (req, res) {
  user
    .findOneAndUpdate(
      { userId: req.params.id },
      { $set: { emailID: req.body.emailID, phoneNo: req.body.phoneNo } }
    )
    .then(function (results) {
      res.send({
        status: 200,
        success: true,
        message: "Details Updated Successfully"
      });
    })
    .catch(err => {
      res.send({ success: false, data: err });
    });
};

//get details by Manager
// exports.getUserbyMg = function (req, res) {
//     user.find({ "roles": req.params.roles }).then(results => {
//         res.send({ status: 200, success: true, data: results })
//     }).catch(err => {
//         res.send({ success: false, data: err })
//     })
// }

//get user by Email
exports.getUserByEmail = (req, res) => {
  user
    .findOne({ emailID: sessionObj.email })
    .then(function (results) {
      res.send({ status: 200, success: true, data: results });
    })
    .catch(err => {
      res.send({ success: false, data: err });
    });
};

//get details by Manager with reportingId
exports.getUserbyMg = function (req, res) {
  user
    .find({ reportingId: req.params.id })
    .then(results => {
      res.send({ status: 200, success: true, data: results });
    })
    .catch(err => {
      res.send({ success: false, data: err });
    });
};
