
var express = require("express");
var expressPublicIp = require("express-public-ip");
var bodyParser = require("body-parser");
var fs = require("fs");
app = express();
app.enable("trust proxy");

app.use(expressPublicIp());
app.use(bodyParser.json());

var MOCK_EMP_DATA_LOC = __dirname+"/data/employees.json";
var MOCK_PUSH_DATA_LOC = __dirname+"/data/findpushid.json";

function findInList(list, key, match) {
	var foundItems = [];
	for ( var listIdx in list ) {
		var item = list[listIdx];
		if ( item[key].indexOf(match) >= 0 ) {
			foundItems.push( item );
		}
	}
	return foundItems;
}
function sendResponse(res, data) {
	res.jsonp( data );
}
function sendError(res, msg) {
	res.status(500);
	res.jsonp({"message": msg});
}

app.get("/api/visinfo/employees", function(req, res) {
	console.log("Received request", req.path);
	function onMockData(err, text) {
		if ( err ) {
			sendError( res, err );
			return;
		}
		var persons = JSON.parse(text);
		var matches = findInList( persons, "name", req.query.name );
		sendResponse( res, matches );
	}
	fs.readFile(MOCK_EMP_DATA_LOC, "utf-8", onMockData);
});
app.post("/api/visinfo/createpushid", function(req, res) {
	
	function writeMockData( newData ) {
		fs.writeFile(MOCK_PUSH_DATA_LOC, JSON.stringify(newData), onWriteMockData);
	}
	function onWriteMockData(err) {
		if (err) {
			sendError( res, err );
			return;
		}
		sendResponse(res, null);
	}

	function onMockData(err,text) {
		if (err) {
			sendError( res, err );
			return;
		}
		var pushDataRows = JSON.parse(text);
		var pushData = findInList( pushDataRows, "lanUserId", req.query.lan_id);
		if ( pushData.length> 0 ) { 
			pushData[0].lanUserId=req.query.lan_id;
			pushData[0].pushId=req.query.push_id;	
			writeMockData( pushDataRows );
			return;
		}
		pushDataRows.push({
			"lanUserId": req.query.lan_id,
			"pushId": req.query.pushId
		});
		writeMockData( pushDataRows );	
	 }

	fs.readFile(MOCK_PUSH_DATA_LOC, "utf-8", onMockData);

});
app.get("/api/visinfo/findpushid", function(req, res) {
	function onMockData(err,text) {
		if (err) {
			sendError(res, err);
			return;
		}
		var pushDataRows = JSON.parse(text);
		var pushData = findInList( pushDataRows, "lanUserId", req.query.lan_id);
		sendResponse( res, pushData );
	 }
	fs.readFile(MOCK_PUSH_DATA_LOC, "utf-8", onMockData);
});

app.listen(3000, function() {
	console.log("Started Mock API server");
});
