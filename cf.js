const functions = require(`firebase-functions`);
const admin = require(`firebase-admin`);
admin.initializeApp();
exports.propagateMessages =
  functions.database.ref(`/groups/{PUSH_ID}/feed/{MESSAGE_ID}`).onWrite((change, context) => {
    let pushId = context.params.PUSH_ID;
    let messageID = context.params.MESSAGE_ID;
    let fireDB = change.after.ref.root;
    return fireDB.child(`/groups/${pushId}/members`).once(`value`)
      .then(listenersSnapshot => {

        let listener_promises = [];
        listenersSnapshot.forEach(childSnapshot => {
          let child_key = childSnapshot.key;
          listener_promises.push(
            fireDB.child(`/users/${child_key}/feed/`).update({[messageID]:change.after.val()})
          );
        });
        return Promise.all(listener_promises);
      })
      .catch(err => {
        console.log(err);
   });
});
    
exports.limitMessages =
  functions.database.ref(`/users/{UID}/feed/{MESSAGE_ID}`).onWrite((change, context) => {
    let UID = context.params.UID;
    let messageID = context.params.MESSAGE_ID;
    let fireDB = change.after.ref.root;
    let listener_promises = [];
	var keys=[];
    return fireDB.child(`users/${UID}/feed`).once('value').then(snap=>{
	    snap.forEach(childSnapshot => {
	      let child_key = childSnapshot.key;
	      keys.push(child_key);
	    });
	    for(var i=0;i<keys.length;i++){
	    	if(i<keys.length-25){
	    		listener_promises.push(fireDB.child(`/users/${UID}/feed/`+keys[i]).remove());
	    	}
	    }
	    return Promise.all(listener_promises);
    });

  });
    
exports.shrinkMessages =
  functions.database.ref(`/groups/{UID}/feed/{MESSAGE_ID}`).onWrite((change, context) => {
    let UID = context.params.UID;
    let messageID = context.params.MESSAGE_ID;
    let fireDB = change.after.ref.root;
    let listener_promises = [];
	var keys=[];
    return fireDB.child(`groups/${UID}/feed`).once('value').then(snap=>{
    	snap.forEach(childSnapshot => {
	      let child_key = childSnapshot.key;
	      keys.push(child_key);
	    });
	    for(var i=0;i<keys.length;i++){
	    	if(i<keys.length-25){
	    		listener_promises.push(fireDB.child(`/groups/${UID}/feed/`+keys[i]).remove());
	    	}
	    }
	    return Promise.all(listener_promises);
    });

  });
   
exports.cleanGroups =
  functions.database.ref(`/groups/{PUSH_ID}/members/{USER}`).onWrite((change, context) => {
    let pushId = context.params.PUSH_ID;
    let user = context.params.USER;
    let fireDB = change.after.ref.root;
    let listener_promises = [];/*
    change.before.ref.root.child(`groups/${pushId}/feed`).forEach(childSnapshot => {
		listener_promises.push(fireDB.child(`/users/${user}/feed/`+childSnapshot.key).remove());
    });
    return Promise.all(listener_promises);
    */
  // /*
      return fireDB.child(`/users/${user}/groups/`).update({[pushId]:change.after.val()}).then(function(){
      	return fireDB.child(`groups/${pushId}/feed`).once('value').then(snap=>{
      		var returns=[];
      		snap.forEach(child=>{
      			var key=child.key;
				returns.push(fireDB.child(`/users/${user}/feed/${key}`).remove());
      		});
      		return Promise.all(returns);
  		});
      }).then(value=>{
      	return fireDB.child(`groups/${pushId}/members`).once('value').then(snap=>{
      		if(snap.val()===null){
      			return fireDB.child(`/groups/${pushId}`).remove();
      		}else{
	      		return true;
      		}

  		});
      	}).catch(err => {
        console.log(err);
      });
   //   */
});

exports.newGather =
  functions.database.ref(`/groups/{PUSH_ID}/gatherups/{USER}`).onWrite((change, context) => {
    let pushId = context.params.PUSH_ID;
    let user = context.params.USER;
    let fireDB = change.after.ref.root;
    return fireDB.child(`/groups/${pushId}/feed/`).update({[user]:change.after.val()})
      .catch(err => {
        console.log(err);
      });
});
