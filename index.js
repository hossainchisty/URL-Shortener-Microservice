require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns')
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const Schema = mongoose.Schema;
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));


//Schema n Model
var urlSchema = Schema({
  id: Number,
  url: String
});

var urlModel = mongoose.model("url", urlSchema);



app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post('/api/shorturl', (req, res) => {
  const { url } = req.body;
  // Validate URL format
  try {
    const urlObj = new URL(url);
    dns.lookup(urlObj.hostname, (err) => {
      if (err) {
        res.json({ error: 'invalid URL' });
      } else {
        urlModel
          .find()
          .exec()
          .then(data => {
            new urlModel({
              id: data.length + 1,
              url: req.body.url
            })
              .save()
              .then(() => {
                res.json({
                  original_url: req.body.url,
                  short_url: data.length + 1
                });
              })
              .catch(err => {
                res.json(err);
              });
          });
      }
    });
  } catch (error) {
    res.json({ error: 'invalid URL' });
  }
});

app.get("/api/shorturl/:number", function (req, res) {
  urlModel
    .find({ id: req.params.number })
    .exec()
    .then(url => {
      res.redirect(url[0]["url"]);
    });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});