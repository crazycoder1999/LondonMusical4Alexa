'use strict'
var express = require('express');
var bodyParser = require('body-parser')
const util = require('util');
var app = express();
var LondonDataHelper = require('./src/lt_data_helper');
var AlexaRequestParser = require('./src/alexa_request_parser');
var AlexaResponseForger = require('./src/alexa_response_forger');
var ldh = new LondonDataHelper();
var alexaReq = new AlexaRequestParser();
var alexaResp = new AlexaResponseForger();
var welcomeMSG = "Hi, I can give you information on musicals in London. Please ask tell me musicals or give me musicals.";
app.set('port', (process.env.PORT || 5000));

app.use( bodyParser.json() ); 
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static(__dirname + '/public'));


// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.post('/alexa',function(request,response) {
	request.setEncoding(null);
	console.log(util.inspect(request.body, {showHidden: false, depth: null}));
//	console.log("PARSING REQUEST" + (Object.keys(request.body)[0])); //questo funziona con i test locali.. boh.. sbaglio la CURL?
//		alexaReq.parseRequest(JSON.parse(request.body[0])).then(function(intent) { //vedi riga sopra
	console.log(request.body.version);
	alexaReq.parseRequest(request.body).then(function(intent) {
		console.log("INTENT RECEIVED: " + intent);
		if(intent==='ListMusicalsIntent') {
			intentListMusicals(response);
		} else if(intent==='NoIntent') {
			answerMSG(response,"Please ask tell me musicals or give me musicals or what\'s up tonight");
		} else if(intent==='AMAZON.HelpIntent') {
			defaultAnswer(response);
		} else if(intent === 'AMAZON.StopIntent'){
			answerMSG(response,"Done");		
		} else if(intent === 'AMAZON.CancelIntent'){
			answerMSG(response,"Done");
		} else if(intent === 'AMAZON.SessionEndedRequest'){ //NOT TRUE.. MASQUERADING
			response.end();
		} else if(intent === 'AMAZON.LaunchIntent'){ //NOT TRUE.. MASQUERADING
			defaultAnswer(response);
		} else {
			console.log("INTENT UNKNOWN: " + intent);
			answerMSG(response,"I'm sorry, can't handle this. Please ask tell me musicals");
		}
	}).catch(function(err) { 
		//default Response
		console.log("INTENT ERROR: " + intent);
		answerMSG(response,"I'm sorry, can't handle this. Please ask tell me musicals");
	});
	
});


app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

function intentListMusicals(response){
	console.log("IntentListMusicals response");
	ldh.eventsForAlexa().then(function(obj) {
		//forge Response	
		var ress = alexaResp.oneSimpleAudio(obj);
		console.log("SENDING BACK"+ress + " Alexa " +alexaResp );
		response.send(ress);
	}).catch(function(err) { 
		//default Response
		console.log("RESPONSE FAILED reason"+err);
		response.send("not found " + err);
	});			
}

function defaultAnswer(response) {
	answerMSG(response,welcomeMSG);
}

function answerMSG(response,msg){
	console.log("Default Response");
	//forge Response	
	var ress = alexaResp.oneSimpleAudio(msg);
	response.send(ress);
}



