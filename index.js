const express = require("express");
const app = express();
const dotenv = require("dotenv");

//routes
const authRoute = require("./routes/auth");
const groupRoute = require("./routes/groups");
const expenseRoute = require("./routes/expenses");

dotenv.config();

//middlewares
app.use(express.json());
//route middleware
app.use("/api/user", authRoute);
app.use("/api/groups", groupRoute);
app.use("/api/expenses", expenseRoute);

app.listen(3000);
