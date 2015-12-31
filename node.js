var express = require('express');
var http = require('http');
var url = require('url');
var bodyParser = require('body-parser');
var app = express();
var pg = require('pg');
var port = process.env.PORT || 5000
var fs = require('fs');
var parse = require('csv-parse');
var async = require('async');
var multer  =   require('multer');
var csv = require("fast-csv");
var storage =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './uploads');
  },
  filename: function (req, file, callback) {
    callback(null, 'spemco_list.csv');
  }
});
var upload = multer({ storage : storage}).single('userPhoto');

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.all('*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, Authorization, Content-Type');
  next();
});

app.listen(port);
console.log('Listening at ' + port);
var records = [];

var inputFile='uploads/spemco_list.csv';

var parser = parse({delimiter: ','}, function (err, data) {
  console.log('Length: ' + data.length)
  async.eachSeries(data, function (line, callback) {
  	records.push({
    	Product_Code: line[0],
      Manufacturer: line[1],
      On_Hand: line[2]
    });
    // console.log(line[0],line[1], line[2]);
    // console.log(records.length);
    callback();
  });
}
);
fs.createReadStream(inputFile).pipe(parser);

function search(nameKey, myArray){
	var myNewArray = [];
    for (var i=1; i < myArray.length; i++) {

        if(myArray[i].Product_Code.toLowerCase().indexOf(nameKey.toLowerCase()) > -1 ||
        	 myArray[i].Manufacturer.toLowerCase().indexOf(nameKey.toLowerCase()) > -1 ||
        	 myArray[i].On_Hand.indexOf(nameKey) > -1) {
              myNewArray.push(myArray[i]);
        }
    }
    return myNewArray;
}

app.get('/', function (req, res) {
    if(req.query.q != undefined){
    	// res.send(req.query.q);	
    	res.json(search(req.query.q, records));
    }else {
    	res.send('No Support yet');	
    }
    // res.send('Hello World!');
    
});



app.post('/upload',function(req,res){
    upload(req,res,function(err) {
        if(err) {
          console.log(err)
            // return res.end("Error uploading file.");
            res.redirect('http://localhost/SpemcoStockCheck/FrontEnd/upload.html?uploaded=false');
        }
        console.log('success...')
        records = [];
        var parser = parse({delimiter: ','}, function (err, data) {
          console.log('Length: ' + data.length)
          async.eachSeries(data, function (line, callback) {
            records.push({
              Product_Code: line[0],
              Manufacturer: line[1],
              On_Hand: line[2]
            });
            // console.log(line[0],line[1], line[2]);
            // console.log(records.length);
            callback();
          });
        }
        );
        fs.createReadStream(inputFile).pipe(parser);

        res.redirect('http://spemcostockcheck.azurewebsites.net/upload.html?uploaded=true');
        // res.end("File is uploaded");

    });
});







