const functions = require(`firebase-functions`);
const admin = require(`firebase-admin`);
const webpush = require("web-push");
const keys = require("./push-keys.js");
admin.initializeApp();
exports.sendNotification = functions.database.ref(`/users/{uid}/feed/{id}/`).onWrite((change, context) => {
    let uid = context.params.uid;
    let id = context.params.id;
    let fireDB = change.after.ref.root;
    return fireDB.child(`/users/${uid}/info/sub`).once(`value`).then(sub => {
    	webpush.setGCMAPIKey(keys.GCMAPIKey);
    	webpush.setVapidDetails(keys.subject,keys.publicKey,keys.privateKey);
    	return fireDB.child(`/users/${uid}/feed/${id}/`).once(`value`).then(payload => {
    		if(payload.val()!==null){
    			return webpush.sendNotification(sub.val(),JSON.stringify(payload.val()));
			}else{
				return Promise.resolve();	
			}
		});
	});
});
exports.toggleGroup = functions.database.ref(`/gatherups/{id}/members/{uid}/`).onWrite((change, context) => {
    let uid = context.params.uid;
    let id = context.params.id;
    let fireDB = change.after.ref.root;
    return fireDB.child(`/users/${uid}/gatherups`).update({
    	[id]:change.val()
    });
});
exports.min_job = functions.pubsub.topic('min-tick').onPublish((event) => {
	return 200;
});
