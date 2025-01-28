const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 3000;

// Route handler
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Connect to MongoDB and start the server
mongoose
  .connect(process.env.MONGODB_URI) // Removed the misplaced semicolon here
  .then(() => {
    app.listen(process.env.PORT || 8080, () => {
      console.log("Server listening on port " + (process.env.PORT || 8080));
    });
  })
  .catch((e) => {
    console.log(e, "error");
  });
