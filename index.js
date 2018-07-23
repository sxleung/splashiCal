var ical = require('ical-generator');
var express = require('express');
var request = require('request');
var app = express();

const PORT=4390;

/*
function stringToDate(str1) {
	var min1  = parseInt(str1.substring(10,12));
	var hr1   = parseInt(str1.substring(8,10));
	var dt1   = parseInt(str1.substring(6,8));
	var mon1  = parseInt(str1.substring(4,6));
	var yr1   = parseInt(str1.substring(0,4));
	var date1 = new Date(yr1, mon1-1, dt1, hr1, min1);

	console.log(date1);
	return date1;
}
*/

// Lets start our server
app.listen(PORT, function () {
    //Callback triggered when server is successfully listening. Hurray!
    console.log("iCalendar app listening on port " + PORT);
});

// respond with "hello world" when a GET request is made to the homepage
app.get('/', function (req, res) {
	console.log('got call to root path');
	res.send('hello world')
})

app.get('/ical', function (req, res) {
	console.log('/ical invoked');
/*	var eventsummary = req.query.title;
	var startdate = new Date;
	var enddate = new Date;
	var description = req.query.desc;
	var location = req.query.location;

	startdate = stringToDate(req.query.start);
	enddate = stringToDate(req.query.end);
*/
	var huburl = "https://"+req.query.domain+".splashthat.com/";
	var cal = ical({
		domain: 'huburl', 
		prodId: {company: req.query.domain, product: 'splash_ical', language: 'EN'},
		name: 'Splash iCal '+req.query.domain,
		ttl: 60
	});
	
	
	console.log(cal.name());

	var hubid = req.query.hubid;

    request({ // call splash to get event information for a specific domain
        url: huburl, 
        qs: {action: 'ohmyhub', method: 'getItems', format: 'json', splash_hub_id: hubid}, //Query string data
        method: 'GET', //Specify the method
        json: true
    }, function (error, response, body) {
        if (error) {
            console.log(error);
        } else { 
			for(var idx in response.body) {
				var item = response.body[idx];
				for(var key in item) {
				    var value = item[key];
				    var startdate = new Date(value.date.start);
				    var enddate;
				    if (value.date.end == '') {
				    	enddate = startdate;
				    } else {
				     	enddate = new Date(value.date.end);
				    }
				    if (value.date.tbd) {
				    	console.log('ignoring '+ value.title);
					} else {
					    console.log('creating event '+value.title+' on '+startdate.toString());
					    cal.createEvent({
					    	uid: value.event_id,
						    start: startdate,
						    end: enddate,
						    summary: value.title,
						    description: value.description,
						    location: value.venue.address+', '+value.venue.city+', '+value.venue.state+', '+value.venue.zip_code
		//				    url: 'http://localhost/'
					});
					}
				}
			}
			// res.send(response.body);
			cal.serve(res);
        }
    })

        //	console.log(req);

})

// POST method route
app.post('/', function (req, res) {
  	res.send('POST request to the homepage')
})



