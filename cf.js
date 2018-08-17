const functions = require(`firebase-functions`);
const admin = require(`firebase-admin`);
const webpush = require("web-push");
const keys = require("./push-keys.js");
admin.initializeApp();
exports.sendNotification = functions.database.ref(`/users/{uid}/feed/{id}/`).onWrite((change, context) => {
    let uid = context.params.uid;
    let id = context.params.id;
    let fireDB = change.after.ref.root;
    return fireDB.child(`/users/${uid}/subs`).once(`value`).then(subs => {
    	webpush.setGCMAPIKey(keys.GCMAPIKey);
    	webpush.setVapidDetails(keys.subject,keys.publicKey,keys.privateKey);
    	return fireDB.child(`/users/${uid}/feed/${id}/`).once(`value`).then(payload => {
    		if(payload.val()!==null){
    			var returns=[];
    			subs.forEach(list=>{
    				var sub=list.val();
    				sub.keys.auth=list.key;
	    			returns.push(webpush.sendNotification(sub,JSON.stringify(payload.val())).catch(error=>{
	    				return fireDB.child(`/users/${uid}/subs/`+list.key).remove();
	    			}));
    			});
    			return Promise.all(returns);
			}else{
				return Promise.resolve();	
			}
		});
	});
});
exports.sendGroup = functions.database.ref(`/gatherups/{id}/info/`).onWrite((change, context) => {
    let id = context.params.id;
    let fireDB = change.after.ref.root;
    if(change.after.val()!==null){
	    return fireDB.child(`/gatherups/${id}/members/`).once(`value`).then(members => {
	    	var returns=[];
	    	members.forEach(member=>{
	    		var uid=member.key;
	    		var edits=difference(change.before.val(),change.after.val());
	    		edits.forEach(edit=>{
		    		if(edit==="title"||edit==="date"||edit==="location"){
			    		returns.push(fireDB.child(`/users/${uid}/feed/`).push().update({
			    			title:change.before.val().title+" - Edited",
			    			content:"Event "+edit+(edit!=="date"?"":" was")+" changed"+(edit!=="date"?(" to "+(edit!=="location"?change.after.val()[edit]:(change.after.val().location!==null?(change.after.val().location.name+", "+change.after.val().location.formatted_address.split(",").slice(1,change.after.val().location.formatted_address.split(",").length-2).join(",")):"an unknown location"))):"")+".",
			    			tag:id
						}));
					}else{
						returns.push(Promise.resolve());
					}
				});
	    	});
	    	return Promise.all(returns);
		});
	}else{
    	return Promise.resolve();
	}
});

function difference(o1, o2) {
	var returns=[];
	if(o1!==null&&o2!==null){
		if(o1.title!==o2.title){
			returns.push("title");
		}if(o1.date!==o2.date){
			returns.push("date");
		}if(JSON.stringify(o1.location)!==JSON.stringify(o2.location)){
			returns.push("location");
		}
	}
	return returns;
}

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
				    	if(change.after.val()!==null&&change.after.val()>=0){
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
					var uid=user.key;
					var info={title:gather.val().title+" - Event",content:(gather.val().location!==null?(gather.val().location.name+", "+gather.val().location.formatted_address.split(",").slice(1,gather.val().location.formatted_address.split(",").length-2).join(",")):"unknown location")+", in "+user.val()+" minutes.",tag:id};
					promises.push(fireDB.child(`/users/${uid}/feed/`).push().update(info));
				});
				return Promise.all(promises);
			}));
		});
		return Promise.all(returns).then(function(){
			return fireDB.child(`/notifications/${time}`).remove();
		});
	});
});
