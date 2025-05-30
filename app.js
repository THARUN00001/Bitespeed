

const express = require('express');
require('dotenv').config();
// then use process.env.DATABASE_URL as shown above

const identify = require("./routes/indentify.js");

const app = express();
app.use(express.json());
// app.use(bodyParser.urlencoded({ extended: true }));





app.use("/", identify);






app.listen(process.env.PORT, () => {
  console.log('Server is listening on port 3000');
});