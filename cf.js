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
    	[id]:change.after.val()
    }).then(function(){
    	return fireDB.child(`/gatherups/${id}/info/`).once(`value`).then(value => {
    		if(value.val()!==null){
	    		var date=value.val().date;
	    		if(date!==null&&new Date(new Date(date).getTime()-(change.after.val()*1000*60)).getTime()>new Date().getTime()){
	    			var time=Math.ceil((new Date(date).getTime()-change.before.val()*1000*60)/(60*1000)).toString();
				    return fireDB.child(`/notifications/${time}/${id}/${uid}`).remove().then(function(){
				    	time=Math.ceil((new Date(date).getTime()-change.after.val()*1000*60)/(60*1000)).toString();
				    	if(change.after.val()>=0){
					    	return fireDB.child(`/notifications/${time}/${id}/`).update({
					    		[uid]:change.after.val()
					   		});
				   		}else{	
							return fireDB.child(`/gatherups/${id}/members/`).once(`value`).then(members => {
								if(members.val()===null){
									return fireDB.child(`/gatherups/${id}/`).remove();
								}else{
									return Promise.resolve();
								}
							});
				   		}
				    });
	    		}else{
					return fireDB.child(`/gatherups/${id}/members/`).once(`value`).then(members => {
						if(members.val()===null){
							return fireDB.child(`/gatherups/${id}/`).remove();
						}else{
							return Promise.resolve();
						}
					});
	    		}
    		}else{
				return fireDB.child(`/users/${uid}/gatherups/${id}/`).remove().then(function(){
					return fireDB.child(`/gatherups/${id}/members/${uid}/`).remove();
				});
    		}
		});
    });
});
exports.changeTime = functions.database.ref(`/gatherups/{id}/info/date/`).onWrite((change, context) => {
    let id = context.params.id;
    let fireDB = change.after.ref.root;
    let date=change.after.val();
    return fireDB.child(`/gatherups/${id}/members/`).once(`value`).then(members => {
    	var returns=[];
    	members.forEach(member=>{
    		var time=Math.ceil((new Date(change.before.val()).getTime()-(member.val()*1000*60))/(1000*60));
    		var uid=member.key;
    		returns.push(fireDB.child(`/notifications/${time}/${id}/${uid}`).remove().then(function(){
				if(date!==null&&new Date(new Date(date).getTime()-(member.val()*1000*60)).getTime()>new Date().getTime()){
					time=Math.ceil((new Date(change.after.val()).getTime()-(member.val()*1000*60))/(1000*60));
					if(member.val()>=0){
						return fireDB.child(`/notifications/${time}/${id}/`).update({
					    	[uid]:member.val()
					    });
				    }else{			
						return Promise.resolve();	
	    			}
				}else{			
					return Promise.resolve();	
	    		}
    		}));
    	});
    	return Promise.all(returns);
	});
});
exports.min_job = functions.pubsub.topic('min-tick').onPublish((event) => {
    let fireDB = admin.database().ref("/");
    var time=Math.floor(new Date().getTime()/(60*1000));
	return fireDB.child(`/notifications/${time}`).once(`value`).then(alerts => {
		var returns=[];
		alerts.forEach(alert=>{
			var id=alert.key;
			returns.push(fireDB.child(`/gatherups/${id}/info`).once(`value`).then(gather => {
				var promises=[];
				alert.forEach(user=>{
					var uid=user.key
					var info={title:gather.val().title,content:"Gather-Up at "+(gather.val().location||"unknown location")+" in "+user.val()+" minutes!",tag:id};
					promises.push(fireDB.child(`/users/${uid}/feed/`).push(info));
				});
				return Promise.all(promises);
			}));
		});
		return Promise.all(returns).then(function(){
			return fireDB.child(`/notifications/${time}`).remove();
		});
	});
});
