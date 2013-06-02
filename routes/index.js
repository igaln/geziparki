

/*
 * GET home page.
 */

exports.index = function(req, res){

	var paginationCount =  req.query.begin;
	

	 if(typeof start=='undefined'){
	 	console.log("of");
	 	start = 0;
	 } else {
	 	start = parseInt(paginationCount);
	 }

	 var end = start + 30;

	console.log(start + " " + end);

	var tweetdata  = [];


	 var Db = require('mongodb').Db
  , Connection = require('mongodb').Connection
  , Server = require('mongodb').Server
  , format = require('util').format;

  //166.78.181.167
	 var client = new Db('gezi', new Server("166.78.181.167", 27017, {}), {w: 1});
       

    	client.open(function(err, p_client) {
      		
      		var fields = {
			    "created_at": true,
			    "text": true,
			    "entities":true
			};
			var query = {"text": /.*https.*/};
			options = {"skip" : start, "limit" : end};
      		client.collection("tweets", function(err,collection) {
      			collection.find(query,fields,options ).toArray(function(err, results){
    					console.log("results " + results.length);
    					
    					var length = results.length,
						 element = null;
						for (var i = 0; i < length; i++) {
						 	 element = results[i];
						 	 var urls = element.entities.urls[0];
						 	 if(typeof urls!='undefined'){
						 	 		

						 	 		var isImage = false;
						 	 		var isVine = false;
						 	 		var isTube = false;

									if( urls.expanded_url.indexOf(".jpg") !== -1 || urls.expanded_url.indexOf(".png") !== -1 || urls.expanded_url.indexOf(".jpeg") !== -1) {
										isImage = true;
									}
									if( urls.expanded_url.indexOf("vine.co") !== -1) {
										isVine = true;
									}
									if( urls.expanded_url.indexOf("youtube") !== -1) {
										isTube = true;
									}
									

						 	 		tweetdata.push({"date":element.created_at,"url":urls.expanded_url,"text":element.text,"isImage":isImage,"isVine":isVine,"isTube":isTube})
						 	 }
						 	 
						  // Do something with element i.
						}

						 console.log(tweetdata.length);
 						 res.render('index', { tweetdata: tweetdata, start:end });
				});
      		});
		 });


};