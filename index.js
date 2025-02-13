const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');
require("dotenv").config();
const { createServer } = require('./config/db.config');
const app = express();

app.use(morgan("dev"));
app.use(cors("dev"));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

const router = require("./router/index.router");

app.use("/api", router);

createServer(app);
