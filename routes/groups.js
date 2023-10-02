const router = require("express").Router();
const verify = require("./verify-token");
const connection = require("../database").DBConnection;

//get all groups
router.get("/", verify, async (req, res) => {
  connection.query(
    `SELECT UserGroups.id, UserGroups.name, UserGroups.description FROM (UserGroups INNER JOIN GroupsRUsers ON UserGroups.id = GroupsRUsers.group_id) WHERE GroupsRUsers.user_id = ${req.user._id};`,
    async (err, groups) => {
      if (err) {
        if (err.code === "ER_NO_SUCH_TABLE" || groups === undefined)
          return res.status(200).send([]);
        return res.status(500).send("Server error");
      }
      if (groups.length === 0) return res.status(200).send([]);

      return res.status(200).send(groups);
    }
  );
});

//add group
router.post("/add", verify, async (req, res) => {
  connection.query(
    `CREATE TABLE if not exists UserGroups (
    id int NOT NULL UNIQUE AUTO_INCREMENT primary key,
    name varchar(50) NOT NULL,
    description varchar(50) NOT NULL,
    created_by int not null,
    create_on datetime not null default current_timestamp,
    last_modified_on datetime not null default current_timestamp,
    foreign key (created_by) references Users(id)
  );`,
    (createErr, createRes) => {
      console.log(createErr);
      if (createErr) return res.status(400).send("error while adding group");
      console.log(req.body);
      const group = {
        name: req.body.name,
        description: req.body.description,
        created_by: req.user._id,
      };
      connection.query(
        `insert into UserGroups set ?`,
        group,
        (addErr, addRes) => {
          console.log(addErr);
          if (addErr) return res.status(400).send("error while adding group");
          req.body.user_id = req.user._id;
          addUserToGroup(req, res);
        }
      );
    }
  );
});

router.get("/add_user", verify, async (req, res) => {
  addUserToGroup(req, res);
});

function addUserToGroup(req, res) {
  connection.query(
    `CREATE TABLE if not exists GroupsRUsers (
    id int NOT NULL UNIQUE AUTO_INCREMENT PRIMARY KEY ,
    group_id int NOT NULL,
    user_id int NOT NULL,
    created_by int not null,
    create_on datetime not null default current_timestamp,
    last_modified_on datetime not null default current_timestamp,
    request_status ENUM('accepted', 'rejected', 'pending', 'expired') NOT NULL DEFAULT 'pending',
    FOREIGN KEY (group_id) REFERENCES UserGroups (id),
    FOREIGN KEY (user_id) REFERENCES Users (id),
    FOREIGN KEY (created_by) REFERENCES Users (id)
  );`,
    (createErr, createRes) => {
      console.log(createErr);
      if (createErr)
        return res.status(400).send("Error while adding user to group");
      const groupRUser = {
        group_id: req.body.group_id,
        user_id: req.body.user_id,
        created_by: req.user._id,
      };
      connection.query(
        `insert into GroupsRUsers set ?`,
        groupRUser,
        (addErr, addRes) => {
          console.log(addErr, req.body);
          if (addErr)
            return res.status(400).send("Error while adding user to group");
          return res.status(200).send({ success: true });
        }
      );
    }
  );
}

module.exports = router;
