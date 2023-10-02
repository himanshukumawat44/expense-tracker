const router = require("express").Router();
const verify = require("./verify-token");
const connection = require("../database").DBConnection;

//get all expenses
router.get("/", verify, async (req, res) => {
  connection.query(
    `select * from GroupsRUsers where group_id = ${req.body.group_id} and user_id = ${req.user._id}`,
    (groupErr, result) => {
      if (groupErr || result.length === 0) {
        if (groupErr.code === "ER_NO_SUCH_TABLE" || result === undefined)
          return res.status(200).send([]);
        res.status(400).send("Error while finding the group");
      } else {
        connection.query(
          `SELECT Expenses.id, Expenses.title, Expenses.description, Users.first_name,Users.last_name, Expenses.created_on, UserGroups.name FROM (((Expenses INNER JOIN Users ON Users.id = Expenses.created_by)  inner join UserGroups on Expenses.group_id = UserGroups.id )) WHERE Expenses.group_id = ${req.body.group_id};`,
          async (err, groups) => {
            if (err) {
              if (err.code === "ER_NO_SUCH_TABLE" || groups === undefined)
                return res.status(200).send([]);
              res.status(400).send("Error while finding the user");
            }
            if (groups.length === 0) return res.status(200).send([]);

            res.json(groups);
          }
        );
      }
    }
  );
});

//add expense
router.post("/add", verify, async (req, res) => {
  connection.query(
    `create table if not exists Expenses (id int auto_increment unique primary key, title varchar(255) not null, description varchar(255), created_by int not null, created_on DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, image varchar(255), group_id int, paid_for int not null, amount DECIMAL(10,3) UNSIGNED NOT NULL DEFAULT '0000000.000' ,foreign key(created_by) references Users(id), foreign key(group_id) references UserGroups(id) );`,
    (errCreate, resCreate) => {
      if (errCreate) return res.status(400).send("Error while adding expense");
      connection.query(
        "insert into expenses set ?",
        {
          title: req.body.title,
          description: req.body.description,
          created_by: req.user._id,
          group_id: req.body.group_id,
          paid_for: req.user._id,
        },

        (err, expense) => {
          console.log(err);
          if (err) return res.status(400).send("Error while adding expense");

          return res.status(200).send({ success: true });
        }
      );
    }
  );
});

module.exports = router;
