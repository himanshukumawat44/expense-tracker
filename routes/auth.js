const router = require("express").Router();
const { registerValidation, loginValidation } = require("../validation");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const connection = require("../database").DBConnection;

//register
router.post("/register", async (req, res) => {
  //validation
  const { error } = registerValidation(req.body);

  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  connection.query(
    `create table if not exists Users (id int unique auto_increment not null primary key, first_name varchar(50) not null, last_name varchar(50) not null, email_id varchar(50) not null, phone_no varchar(50) not null, password varchar(255) not null, created_on datetime not null default current_timestamp, last_modified_on datetime not null default current_timestamp);`,
    (createErr, createRes) => {
      console.log(createErr);
      if (createErr) return res.status(400).send("Error registering user");
      //check if user already exist
      connection.query(
        `SELECT * FROM USERS WHERE email_id = "${req.body.email_id}"`,
        async (err, users) => {
          if (err) return res.status(500).send("Server error");
          if (users.length > 0)
            return res.status(400).send("Email already exist");
          //hash password
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(req.body.password, salt);

          //create new user
          const user = {
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            phone_no: req.body.phone_no,
            email_id: req.body.email_id,
            password: hashedPassword,
          };

          connection.query(
            "INSERT INTO USERS SET ?",
            user,
            (insertErr, user) => {
              if (insertErr) {
                console.log(insertErr);
                return res.status(500).send("Server error while inserting");
              }

              res.send(user);
            }
          );
        }
      );
    }
  );
});

//login
router.post("/login", async (req, res) => {
  //validation
  const { error } = loginValidation(req.body);

  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  //check if user already exist
  connection.query(
    `SELECT * FROM USERS WHERE email_id = "${req.body.email_id}"`,
    async (err, users) => {
      if (err) return res.status(500).send("Server error");
      if (users.length === 0) return res.status(400).send("Invalid email");
      // console.log(users);
      user = users[0];
      //if password is correct
      const validPass = await bcrypt.compare(req.body.password, user.password);
      if (!validPass) return res.status(400).send("Invalid password");

      //create and assign a token
      const token = jwt.sign({ _id: user.id }, process.env.TOKEN_SECRET);
      res.header("auth-token", token).send(token);
    }
  );
});

module.exports = router;
