var https = require('https');
var http = require('http');
var express=require('express');
var fs = require('fs');
var url= require('url');

var app = express();

//Replace this with the URI to your proxy
var RESTURI = "https://rd-flp2.qliktech.com:4243/qps";

app.configure(function () {
    app.use(express.bodyParser());
	app.use(express.cookieParser());
    app.use(app.router);
});

app.get('/', function (req, res) {
      //Return HTML page
      console.log("Send login page");
      res.sendfile('SelectUser.htm');
 });

//Create endpoint for logout
app.get('/logout', function (req, res) {
	logout(req,res);
});

//Create endpoint for login
app.get('/login', function (req, res) {
    var selectedUser = req.query.selectedUser;
    var userDirectory = req.query.userDirectory;
    console.log("Create session for user "+selectedUser+" directory "+userDirectory);
	//Create session for the user and user directory
    createsession(req, res, selectedUser, userDirectory);
});

//Create endpoint for user information
app.get('/info', function (req, res) {
    info(req, res);
});

//Create resource endpoints
app.get("/resource/font", function (req, res) {
    res.sendfile('qlikview-sans.svg');
});

app.get("/resource/icon", function (req, res) {
    res.sendfile("users.png");
});

app.get("/resource/qv", function (req, res) {
    res.sendfile("QlikLogo-RGB.png");
});

app.get("/resource/background", function (req, res) {
    res.sendfile("ConnectingCircles-01.png");
});

//Generates a random number that we use as the session token
function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
    });
    return uuid;
};


// Uses the session API to request information about the current user
function info(req, res) {
    //Configure parameters for the user information request
    var options = {
        host: url.parse(RESTURI).hostname,
        port: url.parse(RESTURI).port,
        path: url.parse(RESTURI).path + '/session/' + req.cookies['X-Qlik-Session'] + '?xrfkey=aaaaaaaaaaaaaaaa',
        method: 'GET',
        pfx: fs.readFileSync('Client.pfx'),
        passphrase: 'test',
        headers: { 'x-qlik-xrfkey': 'aaaaaaaaaaaaaaaa', 'Content-Type': 'application/json' },
        rejectUnauthorized: false,
        agent: false
    };

    console.log("Path:", options.path.toString());
    //Send request to get information about the user
    var sessionreq = https.request(options, function (sessionres) {
        console.log("statusCode: ", sessionres.statusCode);
     
        sessionres.on('data', function (d) {
            if(d.toString()!="null") {
                var session = JSON.parse(d.toString());

                console.log(session.UserId + " is using session " + session.SessionId);
                res.send("<HTML><HEAD></HEAD><BODY>" + session.UserId + " is using session " + session.SessionId + "<BR><a href=' / '>Back to start page</a></BODY><HTML>");
            } else {
                res.send("<HTML><HEAD></HEAD><BODY>No active user<BR><a href=' / '>Back to start page</a></BODY><HTML>");
            }
        });

    });

    //Send request 
    sessionreq.end();

    sessionreq.on('error', function (e) {
        console.error('Error' + e);
    });
};

// Uses the session API to logout the current user
function logout(req, res) {
    //Configure parameters for the logout request
    var options = {
        host: url.parse(RESTURI).hostname,
        port: url.parse(RESTURI).port,
        path: url.parse(RESTURI).path+'/session/'+req.cookies['X-Qlik-Session']+'?xrfkey=aaaaaaaaaaaaaaaa',
        method: 'DELETE',
		pfx: fs.readFileSync('Client.pfx'),
		passphrase: 'test',
        headers: { 'x-qlik-xrfkey': 'aaaaaaaaaaaaaaaa', 'Content-Type': 'application/json' },
		rejectUnauthorized: false,
        agent: false
    };

    console.log("Path:", options.path.toString());
    //Send request to get logged out
    var sessionreq = https.request(options, function (sessionres) {
        console.log("statusCode: ", sessionres.statusCode);
      
        sessionres.on('data', function (d) {
            var session = JSON.parse(d.toString());

            console.log(session.Session.UserId + " is logged out from session " + session.Session.SessionId);
            res.send("<HTML><HEAD></HEAD><BODY>" + session.Session.UserId + " is logged out " + session.Session.SessionId + "<BR><a href=' / '>Back to start page</a></BODY><HTML>");
        });
        
    });

    //Send request to logout
    sessionreq.end();

    sessionreq.on('error', function (e) {
        console.error('Error' + e);
    });
};

// Uses the session API to create a session for the user.
function createsession(req, res, selecteduser, userdirectory) {
    
    //Configure parameters for the ticket request
    var options = {
        host: url.parse(RESTURI).hostname,
        port: url.parse(RESTURI).port,
        path: url.parse(RESTURI).path + '/session?xrfkey=aaaaaaaaaaaaaaaa',
        method: 'POST',
        headers: { 'X-qlik-xrfkey': 'aaaaaaaaaaaaaaaa', 'Content-Type': 'application/json' },
		pfx: fs.readFileSync('client.pfx'),
		passphrase: 'test',
		rejectUnauthorized: false,
        agent: false
    };

    //Send request to create session
    var sessionreq = https.request(options, function (sessionres) {
        console.log("statusCode: ", sessionres.statusCode);

        sessionres.on('data', function (d) {
            //Parse response
            var session = JSON.parse(d.toString());
            
            res.set('Content-Type', 'text/html');
            res.cookie('X-Qlik-Session', session.SessionId, { expires: 0, httpOnly: true });
            res.send("<html><head></head><body>Session set to  " + session.SessionId + "<BR><a href=' / '>Back to start page</a></body></html>");
            
        });
    });

    //Send JSON request for session
    var jsonrequest = JSON.stringify({ 'UserDirectory': userdirectory.toString() , 'UserId': selecteduser.toString(), "SessionId": generateUUID() });
	
    sessionreq.write(jsonrequest);
    sessionreq.end();

    sessionreq.on('error', function (e) {
        console.error('Error' + e);
    });
};

//Server options to run an HTTPS server
var httpsoptions = {
    pfx: fs.readFileSync('server.pfx'),
    passphrase: 'test'
};

//Start listener
https.createServer(httpsoptions, app).listen(8190);