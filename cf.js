const functions = require(`firebase-functions`);
const admin = require(`firebase-admin`);
const webpush = require("web-push");
const apn = require('apn');
const keys = {
	GCMAPIKey: "AAAAK51wxvE:APA91bHbG2pKnltu9PF2vwMSrS9Ev3bTPzufjeeSUwuCm5OI2nXK93XSyxCEfPE20kbJnMTsR3ajxCsBEg2c4BBgY7hz_Tj_2pClHHlLXGsFepvZKM27WPdOthGqfAQCyU1x3aPibkhc02uj_1snanDcbw0d6GNRqw",
	publicKey: 'BHEaekpS-pAfp4pYeqyJHw6cBmhlxx9bxBHjowhsxyDcuYR-ipUrWT9wAf_AP-q_mgGSwQryLaPMpyhcqByDyqo',
	privateKey: 'l7firirlNjF1iVi9ZvCisoJG5D8QAO5kCWP8NDuYeOo',
	subject: "mailto:kento24gs@outlook.com"
};
admin.initializeApp();
exports.sendNotification = functions.database.ref(`/users/{uid}/feed/{id}/`).onWrite((change, context) => {
    let uid = context.params.uid;
    let id = context.params.id;
    let fireDB = change.after.ref.root;
    return fireDB.child(`/users/${uid}/subs`).once(`value`).then(subs => {
    	webpush.setGCMAPIKey(keys.GCMAPIKey);
    	webpush.setVapidDetails(keys.subject,keys.publicKey,keys.privateKey);
    	return fireDB.child(`/users/${uid}/feed/${id}/`).once(`value`).then(payload => {
    		if(payload.val()!==null&&payload.val()!==undefined){
    			var returns=[];
    			subs.forEach(list=>{
    				var sub=list.val();
    				if(sub!=="apns"){
    					sub.keys.auth=list.key;
		    			returns.push(webpush.sendNotification(sub,JSON.stringify(payload.val())).catch(error=>{
		    				return fireDB.child(`/users/${uid}/subs/`+list.key).remove();
		    			}));
	    			}else{
						var options = {
							token: {
								key: "./AuthKey_K6YBZQN7QY.p8",
								keyId: "K6YBZQN7QY",
								teamId: "BH5H97HY4S"
							},
							production: false
						};
						let deviceToken =list.key;
						var apnProvider = new apn.Provider(options);
						var note = new apn.Notification();
						sub.tag=((payload.val().tag.split("/").length>0&&payload.val().tag.split("/")[1]==="board"?"":Date.now()+":")+payload.val().tag);
						note.alert={"title":payload.val().title,"body":payload.val().content};
						note.sound="default";/*
								"apns-collapse-id": sub.tag,
								"tag": sub.tag,
								"thread-id": sub.tag
							},*/
						note.topic="v1.gatherapp-14b50.GatherApp.GatherApp";
	//					};
						return apnProvider.send(note, deviceToken).then(function(result){
							console.log("SENT MESSAGE: "+JSON.stringify(result));
							return Promise.resolve().then(function(){
								return apnProvider.shutdown();
							});
						});
	    			}
    			});
    			return Promise.all(returns).then(function(){
    				var load={[payload.val().tag.split("/").length===2?payload.val().tag.split("/")[1]:"info"]:0};
    				if(Object.keys(load)[0]!=="board"){
	    				return fireDB.child(`/users/${uid}/events/`+payload.val().tag.split("/")[0]).update(load);
    				}else{
    					return Promise.resolve();	
    				}
    			});
			}else{
				return Promise.resolve();
			}
		});
	}).then(function(){
		return fireDB.child(`users/${uid}/feed/${id}`).remove();
	});
});

exports.detectLeave = functions.database.ref(`/users/{uid}/events/{id}`).onWrite((change, context) => {
    let uid = context.params.uid;
    let id = context.params.id;
    let fireDB = admin.database().ref("/");
    if(change.after.val()!==null&&change.after.val()!==undefined&&change.after.val().status===0){
	    return fireDB.child(`/events/${id}/members/${uid}`).remove().then(function(){
	    	return fireDB.child(`/events/${id}/pending/${uid}`).remove().then(function(){
	    		return fireDB.child(`/events/${id}/left/`).update({[uid]:0});
	    	});
	    });
    }else if(change.after.val()!==null&&change.after.val()!==undefined&&change.after.val().status===4){
	    return fireDB.child(`/events/${id}/pending/`).update({[uid]:0}).then(function(){
	    	return fireDB.child(`/events/${id}/members/${uid}`).remove();
    	});
    }else{
    	return Promise.resolve();	
    }
});

exports.sendBoardFeed = functions.database.ref(`/events/{id}/board/{push}/`).onWrite((change, context) => {
    let id = context.params.id;
    let fireDB = change.after.ref.root;
    let push=context.params.push;
    return fireDB.child(`/events/${id}/board/${push}`).once(`value`).then(post => {
	    return fireDB.child(`/events/${id}/info`).once(`value`).then(info => {
		    if(post.val()!==undefined&&post.val()!==null&&post.val().content!==undefined&&post.val().content!==null&&post.val().author!==undefined&&post.val().author!==null){
		    	return fireDB.child(`/events/${id}/members`).once(`value`).then(people => {
		    		var returns=[];
		    		people.forEach(person=>{
		    			if(person.key!==post.val().author){
				    			returns.push(
				    				fireDB.child(`/users/${(person.key)}/events/${id}`).once("value").then(count=>{
				    					var messageNumber=((count.val()!==null&&count.val()!==undefined&&count.val().board!==null&&count.val().board!==undefined?count.val().board:0)+1);
				    					var s=((messageNumber>1)?"s":"");
					    				return fireDB.child("users/"+person.key+"/feed").push({title:info.val().title+" - New Post",content:"You have "+messageNumber+" new message"+s+".",tag:id+"/board"}).then(function(){
						    				return fireDB.child(`/users/${(person.key)}/events/${id}/board`).transaction(counts => {
						    					return (counts!==undefined&&counts!==null?counts:0)+1;
					    					});
					    				});
				    				})
			    				);
		    			}else{
		    				returns.push(Promise.resolve());
		    			}
		    		});
		    		return Promise.all(returns);
	    		});
		    }else{
				return Promise.resolve();
		    }
	    });
	});
});

exports.cancelEvent = functions.database.ref(`/events/{id}/info/cancel`).onWrite((change, context) => {
    let id = context.params.id;
    let fireDB = change.after.ref.root;
    if(change.after.val()!==undefined&&change.after.val()!==null){
    	return fireDB.child(`/events/${id}/members/`).once(`value`).then(members => {
		    	var returns=[];
		    	members.forEach(member=>{
		    		var uid=member.key;
		    		returns.push(fireDB.child(`/users/${uid}/events/${id}`).update({status:3}));
	   			});
	   			return Promise.all(returns);
		});
	}else{
		return fireDB.child(`/events/${id}/info/`).once("value").then(info=>{
			if(info.val()!==null&&info.val()!==undefined){
				var status=2;
				if(info.val().date.time===null||info.val().date.time===undefined||new Date(info.val().date.time+info.val().date.duration*60*1000).getTime()>new Date().getTime()){
					status=1;
				}
		    	return fireDB.child(`/events/${id}/members/`).once(`value`).then(members => {
				    	var returns=[];
				    	members.forEach(member=>{
				    		var uid=member.key;
				    		returns.push(fireDB.child(`/users/${uid}/events/${id}`).update({status:status}));
			   			});
			   			return Promise.all(returns);
				});
			}else{
				return Promise.resolve();
			}
		});
	}
});

exports.sendGroup = functions.database.ref(`/events/{id}/info/`).onWrite((change, context) => {
    let id = context.params.id;
    let fireDB = change.after.ref.root;
    if(change.after.val()!==null){
	    return fireDB.child(`/events/${id}/members/`).once(`value`).then(members => {
	    	var returns=[];
	    	members.forEach(member=>{
	    		var uid=member.key;
	    		var edits=difference(change.before.val(),change.after.val());
	    		edits.forEach(edit=>{
		    		if(edit==="title"||edit==="date"||edit==="location"||edit==="cancel"){
		    			if(context.auth!==undefined&&context.auth.uid!==null&&uid!==context.auth.uid){
		    				var cont="";
							if(edit==="cancel"){
								if(change.after.val().cancel!==undefined&&change.after.val().cancel!==null){
									cont="Event was cancelled.";
								}else{
									cont="Event was reactivated.";
								}
							}else{
	 							cont="Event "+edit.replace("date","time")+(edit!=="date"?"":" was")+" changed"+(edit!=="date"?(" to "+(edit!=="location"?change.after.val()[edit]:(change.after.val().location!==null?(change.after.val().location.name+", "+change.after.val().location.formatted_address.split(",").slice(1,change.after.val().location.formatted_address.split(",").length-2).join(",")):"an unknown location"))):"")+".";
							}
				    		returns.push(fireDB.child(`/users/${uid}/feed/`).push().update({
				    			title:change.before.val().title+" - Edited",
				    			content:cont,
				    			tag:id
							}));
						}else{
							returns.push(Promise.resolve());
						}
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
		}if(o1.date.time!==o2.date.time){
			returns.push("date");
		}if(JSON.stringify(o1.location)!==JSON.stringify(o2.location)){
			returns.push("location");
		}if(o1.cancel!==o2.cancel){
			returns.push("cancel");
		}
	}
	return returns;
}

exports.abandonGroup = functions.database.ref(`/events/{id}/left/{uid}/`).onDelete((change, context) => {
    let uid = context.params.uid;
    let id = context.params.id;
    let fireDB = admin.database().ref("/");
    return fireDB.child(`/events/${id}/info`).once("value").then(info=>{
    	if(info.val()===undefined||info.val()===null){
	   		return fireDB.child(`/users/${uid}/events/`+id).remove(); 	
   		}else{
   			return Promise.resolve();	
   		}
    });
});

exports.denyInvite = functions.database.ref(`/events/{id}/pending/{uid}/`).onDelete((change, context) => {
    let uid = context.params.uid;
    let id = context.params.id;
    let fireDB = admin.database().ref("/");
    return fireDB.child(`/events/${id}/info`).once("value").then(info=>{
    	if(info.val()===undefined||info.val()===null){
	   		return fireDB.child(`/users/${uid}/events/`+id).remove(); 	
   		}else{
   			return Promise.resolve();	
   		}
    });
});

exports.toggleGroup = functions.database.ref(`/events/{id}/members/{uid}/`).onWrite((change, context) => {
    let uid = context.params.uid;
    let id = context.params.id;
    let fireDB = change.after.ref.root;
		return fireDB.child(`/events/${id}/info/`).once(`value`).then(value => {
			if(value.val()!==null){
	    		var date=value.val().date.time;
	    		if(date!==null&&new Date(new Date(date).getTime()-(change.after.val()*1000*60)).getTime()>new Date().getTime()){
	    			var time=Math.ceil((new Date(date).getTime()-change.before.val()*1000*60)/(60*1000)).toString();
				    return fireDB.child(`/notifications/${time}/${id}/${uid}`).remove().then(function(){
				    	time=Math.ceil((new Date(date).getTime()-change.after.val()*1000*60)/(60*1000)).toString();
				    	if(change.after.val()!==null&&change.after.val()>0){
					    	return fireDB.child(`/notifications/${time}/${id}/`).update({
					    		[uid]:change.after.val()
					   		});
				   		}else{	
							return fireDB.child(`/events/${id}/members`).once(`value`).then(members => {
								if((members.val()===null||members.val()===undefined)&&(change.after.val()===undefined||change.after.val()===null)){
									return fireDB.child(`/events/${id}/`).remove();
								}else{
									return Promise.resolve();
								}
							});
				   		}
				    });
	    		}else{
					return fireDB.child(`/events/${id}/members`).once(`value`).then(members => {
						if((members.val()===null||members.val()===undefined)&&(change.after.val()===undefined||change.after.val()===null)){
							return fireDB.child(`/events/${id}/`).remove();
						}else{
							return Promise.resolve();
						}
					});
	    		}
			}else{
				return Promise.resolve();
			}
		}).then(function(){
	    	if(change.after.val()!==undefined&&change.after.val()!==null){
		    	return fireDB.child("events/"+id+"/left/"+uid).remove().then(function(){
			    	return fireDB.child("events/"+id+"/pending/"+uid).remove();
		    	});
	    	}else{
	    		return Promise.resolve();	
	    	}
		});
});

exports.detectAbandonedGroup = functions.database.ref(`/events/{id}/members/{uid}/`).onWrite((change, context) => {
    let uid = context.params.uid;
    let id = context.params.id;
    let fireDB=admin.database().ref("/");
		return fireDB.child(`/events/${id}/members`).once(`value`).then(members => {
			return fireDB.child(`events/${id}/info/`).once("value",info=>{
					return fireDB.child(`/users/${uid}/events/${id}/status`).once("value",userval=>{
					var datestatus=0;
					if(change.after.val()!==undefined&&change.after.val()!==null){
						datestatus=2;
						if(info.val().date.time===null||info.val().date.time===undefined||new Date(info.val().date.time+info.val().date.duration*60*1000).getTime()>new Date().getTime()){
							datestatus=1;
						}
						if(info.val().cancel!==null&&info.val().cancel!==undefined){
							datestatus=3;
						}
					}
					var status=(members.val()===undefined||members.val()===null)?null:(datestatus);
				/*	if(userval.val()===3){
						status=3;
					}*/
					return fireDB.child(`/users/${uid}/events/`+id).update({
		    			status:status
		   			}).then(function(){
		   				return fireDB.child(`/events/${id}/pending/${uid}`).once(`value`).then(me => {
			   				if(status===0){
			   					if(me.val()===null||me.val()===undefined){
				   					return fireDB.child(`/events/${id}/left/`).update({[uid]:0});
			   					}else{
			   						return Promise.resolve();
			   					}
			   				}else{
			   					return Promise.resolve();
			   				}
	   					});
		   			});
	   			});
	   		});
   		});
});

exports.countMembersCreate = functions.database.ref(`/events/{id}/members/{uid}`).onCreate((change, context) => {
	let fireDB=admin.database().ref("/");
	let id=context.params.id;
	return fireDB.child(`/events/${id}/members`).once("value").then(after=>{
		var members=after.val();
		var number=Object.keys(members).length;
		return fireDB.child(`/events/${id}/info`).update({
			people:number
		});	
	});
});

exports.countMembers = functions.database.ref(`/events/{id}/members/{uid}`).onDelete((change, context) => {
	let fireDB=admin.database().ref("/");
	let id=context.params.id;
	return fireDB.child(`/events/${id}/members`).once("value").then(after=>{
		if(after.val()!==null){
			var members=after.val();
			var number=Object.keys(members).length;
			return fireDB.child(`/events/${id}/info`).update({
				people:number
			});	
		}else{
			return Promise.resolve();
		}
	});
});

exports.markAsComplete = functions.database.ref(`/events/{id}/info/date`).onWrite((change, context) => {
	let fireDB=change.after.ref.root;
	let id=context.params.id;
	return fireDB.child(`/events/${id}/info`).once("value").then(info=>{
		if(change.after.val()!==undefined&&change.after.val()!==null&&
		change.after.val().time!==undefined&&change.after.val().time!==null&&
		change.after.val().duration!==undefined&&change.after.val().duration!==null&&
		((change.before.val()===null||change.before.val()===undefined)||(change.after.val().time!==change.before.val().time||change.after.val().duration!==change.before.val().duration))){
			if(change.after.val()!==undefined&&change.after.val()!==null&&change.after.val().time!==null&&change.after.val().time!==undefined&&
			change.after.val().duration!==null&&change.after.val().duration!==undefined&&new Date(change.after.val().time+((change.after.val().duration*60*1000)||0)).getTime()<=new Date().getTime()){
				let date=change.after.val().time;
				return fireDB.child(`/events/${id}/members`).once("value").then(members=>{
					var returns=[];
					members.forEach(member=>{
						if(info.val().cancel===null||info.val().cancel===undefined){
							returns.push(fireDB.child(`/users/${(member.key)}/events/${id}/`).update({status:2}));
						}else{
							returns.push(Promise.resolve());
						}
					});
					return Promise.all(returns);
				});
			}else{
				return fireDB.child(`/events/${id}/members`).once("value").then(members=>{
					var returns=[];
					members.forEach(member=>{
						if(info.val().cancel===null||info.val().cancel===undefined){
							returns.push(fireDB.child(`/users/${(member.key)}/events/${id}/`).update({status:1}));
						}else{
							returns.push(Promise.resolve());
						}
					});
					return Promise.all(returns);
				});
			}
		}else{
			return Promise.resolve();	
		}
	});
});

//!!!
exports.setTask = functions.database.ref(`/events/{id}/info/date`).onWrite((change, context) => {
	let fireDB=change.after.ref.root;
	let id=context.params.id;
	if(change.after.val()!==null&&change.after.val()!==undefined){
		let date=change.after.val().time;
		let duration=change.after.val().duration;
		if(change.after.val()!==null&&change.after.val()!==undefined&&
		(
		change.after.val().time!==null&&change.after.val().time!==undefined&&
		change.after.val().duration!==null&&change.after.val().duration!==undefined&&
		((change.before.val()===null||change.before.val()===undefined)||(change.before.val().duration!==duration||change.before.val().time!==date))
		)
		){
			if(date!==null&&(new Date(date).getTime()+(duration*1000*60))>Date.now()){
				return fireDB.child("tasks/"+Math.ceil((new Date(date).getTime()+(duration*1000*60))/(60*1000))).update({
					[id]:0
				}).then(function(){
					if(change.before.val()!==null&&change.before.val()!==undefined&&change.before.val().time!==null&&change.before.val().time!==undefined&&
					change.before.val().duration!==null&&change.before.val().duration!==undefined&&new Date(change.before.val().time).getTime()!==null&&
						Math.ceil((new Date((new Date(change.before.val().time)).getTime()+(change.before.val().duration*1000*60)))/(60*1000))!==Math.ceil((new Date(date).getTime()+(duration*1000*60))/(60*1000))){
						return fireDB.child("tasks/"+Math.ceil((new Date((new Date(change.before.val().time)).getTime()+(change.before.val().duration*1000*60)))/(60*1000))+"/"+id).remove();
					}else{
						return Promise.resolve();
					}
				});
			}else{
				if(change.before.val()!==null&&change.before.val()!==undefined&&change.before.val().time!==null&&change.before.val().time!==undefined&&
				change.before.val().duration!==null&&change.before.val().duration!==undefined&&new Date(change.before.val().time).getTime()!==null&&
					Math.ceil((new Date((new Date(change.before.val().time)).getTime()+(change.before.val().duration*1000*60)))/(60*1000))!==Math.ceil((new Date(date).getTime()+(duration*1000*60))/(60*1000))){
					return fireDB.child("tasks/"+Math.ceil((new Date((new Date(change.before.val().time)).getTime()+(change.before.val().duration*1000*60)))/(60*1000))+"/"+id).remove();
				}else{
					return Promise.resolve();
				}
			}
		}else{
			return Promise.resolve();	
		}
	}else{
			return Promise.resolve();	
	}
});


exports.changeTime = functions.database.ref(`/events/{id}/info/date/time`).onWrite((change, context) => {
    let id = context.params.id;
    let fireDB = change.after.ref.root;
    let date=change.after.val();
    return fireDB.child(`/events/${id}/members/`).once(`value`).then(members => {
    	var returns=[];
    	members.forEach(member=>{
    		var time=Math.ceil((new Date(change.before.val()).getTime()-(member.val()*1000*60))/(1000*60));
    		var uid=member.key;
    		returns.push(fireDB.child(`/notifications/${time}/${id}/${uid}`).remove().then(function(){
				if(date!==null&&new Date(new Date(date).getTime()-(member.val()*1000*60)).getTime()>new Date().getTime()){
					time=Math.ceil((new Date(change.after.val()).getTime()-(member.val()*1000*60))/(1000*60));
					if(member.val()>0){
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
			returns.push(fireDB.child(`/events/${id}/info`).once(`value`).then(gather => {
				if(gather.val().cancel===null||gather.val().cancel===undefined){
					var promises=[];
					alert.forEach(user=>{
						var uid=user.key;
						var info={
							title:gather.val().title+" - Event",
							content:((gather.val().location!==null&&gather.val().location!==undefined)?(gather.val().location.name+", "+gather.val().location.formatted_address.split(",").slice(1,gather.val().location.formatted_address.split(",").length-2).join(",")):"Unknown location")+", in "+user.val()+" minutes.",
							tag:id
						};
						promises.push(fireDB.child(`/users/${uid}/feed/`).push().update(info));
					});
					return Promise.all(promises);
				}else{
					return Promise.resolve();	
				}
			}));
		});
		return Promise.all(returns).then(function(){
			return fireDB.child(`/notifications/${time}`).remove();
		});
	});
});

exports.min_tick = functions.pubsub.topic('min-tick').onPublish((event) => {
    let fireDB = admin.database().ref("/");
    var time=Math.floor(new Date().getTime()/(60*1000));
	return fireDB.child(`/tasks/${time}`).once(`value`).then( events=> {
		var returns=[];
		events.forEach(event=>{
			returns.push(fireDB.child("events/"+event.key+"/members").once("value").then(members=>{
				return fireDB.child("events/"+event.key+"/info/cancel").once("value").then(info=>{
					if(info.val()===undefined||info.val()===null){
						var promises=[];
						members.forEach(user=>{
							promises.push(fireDB.child("users/"+user.key+"/events/"+event.key).update({status:2}));
						});
						return Promise.all(promises);
					}else{
						return Promise.resolve();	
					}
				});
			}));
		});
		return Promise.all(returns);
	}).then(function(){
		return fireDB.child(`/tasks/${time}`).remove();
	});
});
