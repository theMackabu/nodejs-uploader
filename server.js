const express = require('express')
const app = express()
const port = 80

const serveIndex = require('serve-index');
const path = require('path');
const fs = require('fs');
const formidable = require('formidable');
const upload_html = fs.readFileSync("public/index.html");
const upload_path = "files/";
const dirstamp = "";

var badRequest = {
  success: false,
  result: {
    status: 400,
    source: "/api/get/"
  },
  details: {
    message: "bad request"
  }
};

var notFound = {
  success: false,
  result: {
    status: 404,
    source: "/api/files/"
  },
  details: {
    message: "file or directory not found"
  }
};

app.get('/api/files/list', (req, res) => {
  fs.readdirSync(upload_path).forEach(file => {
    res.write(file + "\n");
  });
  return res.end();
});

app.get('/api/send', (req, res) => {
  res.writeHead(200);
  res.write(upload_html);
  console.log('got request');
  return res.end();
});

app.get('/api/get/', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(badRequest));
  console.log('got bad post request');
});

app.use('/api/get', (req, res) => {
  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    var oldpath = files.fileUpload.path;
    var newpath = upload_path + dirstamp + files.fileUpload.name;

    var goodRequest = {
      success: true,
      result: {
        status: 200,
        source: "/api/get/"
      },
      details: {
        file: files.fileUpload.name,
        url: "https://fileserver.sajjaadfarzad.repl.co/api/files/" + files.fileUpload.name
      }
    };

    fs.copyFile(oldpath, newpath, function (err) {
      if (err) throw err;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(goodRequest));
      console.log('file uploaded (1/2)');
      console.log('file moved (2/2)');
      console.log(`+ ${files.fileUpload.name}`)
      res.end();
    });
  });
});

app.get('/', (req, res) => {
  res.send("Nothing here...")
  console.log('got empty request');
});

app.get('/api/files/', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(notFound));
  console.log('file not found');
});

app.get('/api/files/:file(*)', function (req, res, next) {
  var filePath = path.join(__dirname, 'files', req.params.file);

  res.download(filePath, function (err) {
    if (!err) return;
    if (err.status !== 404) return next(err);
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    var fileNotFound = {
      success: false,
      result: {
        status: 404,
        source: `/api/files/${req.params.file}`
      },
      details: {
        message: "file or directory not found"
      }
    };
    res.end(JSON.stringify(fileNotFound));
    console.log(`file not found (${req.params.file})`);
  });
});
app.listen(port, () => {
  console.log(`page starting...`)
})