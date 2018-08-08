
var likeSchema, Like, clickSchema, Click, dislikeSchema, Dislike, entitiesSchema, Entity, errorEntriesSchema, ErrorEntry, adminLikeSchema, AdminLike;
var mongoose = require('mongoose');
var db = mongoose.createConnection('mongodb://localhost/museoshadersmutation');

module.exports = {
	initializeDatabase: initializeDatabase,
	getEntityByIndex: getEntityByIndex,
	getWithCriteria: getWithCriteria,
	getAdminLikeWithCriteria: getAdminLikeWithCriteria,
	getLastClick: getLastClick,
	deleteEntity: deleteEntity,
	adminLikeObject: adminLikeObject,
	adminDislikeObject: adminDislikeObject,
	likeObject: likeObject,
	clickedOn: clickedOn,
	dislikeObject: dislikeObject,
	registerShaderEntity: registerShaderEntity,
	registerError: registerError
}


function initializeDatabase() {	
	// Entities
	entitiesSchema = mongoose.Schema({
		user: String,
		id: String,
		entity: String,
		entityTranslated: String,
		entityClass: String
	});
		
	Entity = db.model('entities', entitiesSchema);
	
	// Likes
	likeSchema = mongoose.Schema({
		user: { type: String, trim: true, index: true },
		id: String,
		entity: String,
		entityClass: String
	});
		
	Like = db.model('likes', likeSchema);
	
	// Dislikes
	dislikeSchema = mongoose.Schema({
		user: { type: String, trim: true, index: true },
		id: String,
		entity: String,
		entityClass: String
	});
		
	Dislike = db.model('dislikes', dislikeSchema);
	
	// Admin Likes
	adminLikeSchema = mongoose.Schema({
		user: { type: String, trim: true, index: true },
		id: String,
		entity: String,
		entityClass: String
	});

	AdminLike = db.model('adminlikes', adminLikeSchema);
	
	// Error entries
	errorEntriesSchema = mongoose.Schema({
		user: { type: String, trim: true, index: true },
		id: String,
		description: String,
	});
		
	ErrorEntry = db.model('errorentries', errorEntriesSchema);
	
	// User clicks 
	clickSchema = mongoose.Schema({
		user: { type: String, trim: true, index: true },
		id: String,
		entity: String,
		entityClass: String
	});
		
	Click = db.model('click', clickSchema);	
}

function getEntityByIndex(res, args) {	
	var args = args.index;
	var entity = Entity.find({ }, function(err, entities) {
		if (args < entities.length) {
			var result = replaceAllOn(entities[args].object, "\n", "");
			res.end(result);
		}
		else
			res.end("null");
	});
}

function getWithCriteria(res, req, args) {
	var a = Like.find(args, function(err, likes) {
		var value = Math.random() * likes.length;
		var result = likes[Math.floor(value)];
	
		if (result != null)	
			res.end(result.entity + " | " + result.entityClass + " | " + result.id);
		else
			res.end("none");
	}); 
}

function getAdminLikeWithCriteria(res, req, args) {
	AdminLike.find(args, function(err, adminlikes) {
		var value = Math.random() * adminlikes.length;
		var result = adminlikes[Math.floor(value)];
		if (result != null)	
			res.end(result.entity + " | " + result.entityClass + " | " + result.id);
		else
			res.end("none");
	}); 
}


function getClickWithCriteria(res, req, args) {
	AdminLike.find(args, function(err, adminlikes) {
		var value = Math.random() * adminlikes.length;
		var result = adminlikes[Math.floor(value)];
		if (result != null)	
			res.end(result.entity + " | " + result.entityClass + " | " + result.id);
		else
			res.end("none");
	}); 
}

function getLastClick(res, req, args) {
	Click.find({ }, function(err, clicks) {
		var value = clicks.length-1;
		var result = clicks[value];
		if (result != null)	
			res.end(result.entity + " | " + result.entityClass + " | " + result.id);
		else
			res.end("none");
	}); 
}

function clickedOn(res, req, args) {
	var id = uuid.v1();
	var value = new Click({ id: id, entity: args.entity, entityClass: args.entityClass, time: new Date() });
	//console.log(value);
	value.save(printBDError);
	res.end(id);
}

function deleteEntity(res, args) {
	Entity.remove( { id: args.id }, 
		function () {
			res.end(args.id);
		});
}

function adminLikeObject(res, args) {
	var id = uuid.v1();
	var value = new AdminLike({ id: id, entity: args.entity, entityClass: args.entityClass });
	value.save(printBDError);
	res.end(id);
}

function adminDislikeObject(res, req, args) {
	console.log("ID: " + args.id)
	var a = AdminLike.findOne( { id: args.id }, function(err, objects) {
		if (objects != null)
			objects.remove(function (err) {if (err) throw err; });
		console.log("Deleted " + args.id);
	}); 
	res.end("ok");
}

function likeObject(res, args) {
	var id = uuid.v1();
	var value = new Like({ id: id, entity: args.entity, entityClass: args.entityClass });
	value.save(printBDError);
	res.end(id);
}

function dislikeObject(res, args) {
/*	var id = uuid.v1();
	var value = new Dislike({ id: id, entity: args.entity, entityClass: args.entityClass });
	value.save(printBDError);
	res.end(id);	*/
	
	res.end();
	console.log("ID: " + args.id);
	var myquery = { id: args.id };
	db.collection("likes")
		.deleteOne(myquery, function(err, obj) {
			if (err) throw err;
			console.log("entity " + obj + "deleted");
		});
}

function registerShaderEntity(res, object) {
	var id = uuid.v1();
	var value = new Entity({ id: id, object: object.object.toString(), type: "entity-shader" });
	value.save(printBDError);
	res.end(id);
}

function registerError (res, args) {
	res.end();
	//var id = uuid.v1();
	//var value = new ErrorEntry({ id: id, description: args.description, code: args.code });
	//console.log(value);
	//value.save(printBDError);
}

function printBDError (err, result) {
      if (err) throw err;
      console.log(result);
}
