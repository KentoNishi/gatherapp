var config = {
	apiKey: "AIzaSyB4meNlwVUltd007qmH9hPQpn6Oz_CF3xM",
	authDomain: "gatherapp-14b50.firebaseapp.com",
	databaseURL: "https://gatherapp-14b50.firebaseio.com",
	projectId: "gatherapp-14b50",
	storageBucket: "",
	messagingSenderId: "187325007601"
};
firebase.initializeApp(config);

var uid = "";
var name = "";
var pic = "";
//var city="";
var lat;
var lng;
var worker;

document.querySelectorAll(".metas")[0].innerHTML=('<meta name="viewport" content="width=device-width,height='+window.innerHeight+', initial-scale=1.0">');

function menu(){
	clear();
	write(name,[{html:"<img src='"+pic+"' class='pic'></img>"},{text:"Standard User"}],[{href:"signOut();",text:"Sign Out"}]);
}

function feed(){
	clear();
	firebase.database().ref("users/"+uid+"/feed").once("value",function(notifications){
		if(notifications.val()==null){
			write("Welcome!",[{text:"Welcome to GatherApp, "+name+"!"}]);
		}
		notifications.forEach(function(notification){
			write(notification.val().title,[{text:notification.val().content}],[{text:"Dismiss",href:"clearFeed('"+notification.key+"');event.stopPropagation();"}],"loadGatherUp('"+notification.val().tag+"');");
		});
	});
}

function clearFeed(id){
	firebase.database().ref("users/"+uid+"/feed/"+id).remove().then(function(){
		feed();
	});
}

//http://jsfiddle.net/gydL0epa/542/
/*
function clearFeed(){
	firebase.database().ref("users/"+uid+"/feed").remove().then(function(){
		feed();
	});
}
*/

/*
function sendFeed(path,title,content){
	firebase.database().ref("users/"+path+"/feed").push().update({
		title:title,
		content:content
	});
}
*/

function start(){/*
	clear();
	write("New Group",null,null,"newGroup();");
	write("Find Groups",null,null,"findGroups();");
	write("My Groups",null,null,"myGroups();");*/
	requestGatherUp();
}


var map;
function requestGatherUp(){
	navigator.permissions.query({'name': 'geolocation'}).then( permission => {
/*
        var autocomplete = new google.maps.places.Autocomplete((document.querySelectorAll(".inputs")[0].querySelectorAll("input")[1]));

        autocomplete.addListener('place_changed', fillInAddress);
function fillInAddress() {
	console.log(autocomplete.getPlace());
}
*/
		clear();
		var contents=[];
		var extra="";
		if(permission.state!="granted"){
			extra="<button onclick='if(navigator.geolocation){navigator.geolocation.getCurrentPosition(pos=>{lat=pos.coords.latitude;lng=pos.coords.longitude;start();});}'>Use Precise Location</button>";
		}
		contents.push({html:""+extra+"<div class='inputs'>"});
		contents.push({html:"<input placeholder='Title' onclick=''></input>"});
		contents.push({html:"<input placeholder='Address/Location'></input>"});
		//contents.push({html:"<input placeholder='GPS' disabled style='display:none;'></input>"});
		contents.push({html:"<input type='datetime-local'></input>"});
		contents.push({html:"</div>"});
		contents.push({html:"<button onclick='newGatherUp();'>Schedule</button>"});
		write("New Gather-Up",contents,[{href:"feed();",text:"Cancel"}]);
		autocomplete = new google.maps.places.Autocomplete((document.querySelectorAll(".inputs")[0].querySelectorAll("input")[1]));
		/*
		map = new google.maps.Map(document.getElementById('map'), {
			zoom: 15,
			center: {lat:lat,lng:lng}
		});
		var marker = new google.maps.Marker({
			position: {lat:lat,lng:lng},
			map: map,
			draggable:true
		});
		google.maps.event.addListener(marker, 'dragend', function(evt){
			map.panTo(marker.getPosition());
			moveMapView(evt.latLng.lat(),evt.latLng.lng());
		});
		moveMapView(lat,lng,true);*/
	//	document.querySelectorAll(".inputs")[0].querySelectorAll("input")[3].value=new Date(Date.now()-new Date().getTimezoneOffset()*60*1000+(60*60*1000*24)).toISOString().split(".")[0].slice(0,-3);

	});
}

var autocomplete;
function editGatherUp(id){
	firebase.database().ref("gatherups/"+id+"/info").once("value",function(info){
		navigator.permissions.query({'name': 'geolocation'}).then( permission => {
			clear();/*
			var lati=lat;
			var long=lng;
			if(info.val().gps!=null){
				lati=parseFloat(info.val().gps.split(",")[0]);
				longi=parseFloat(info.val().gps.split(",")[1]);
			}*/
			var contents=[];
			var extra="";
			if(permission.state!="granted"){
				extra="<button onclick='if(navigator.geolocation){navigator.geolocation.getCurrentPosition(pos=>{lat=pos.coords.latitude;lng=pos.coords.longitude;start();});}'>Use Precise Location</button>";
			}
			contents.push({html:""+extra+"<div class='inputs'>"});
			contents.push({html:"<input placeholder='Title' onclick=''></input>"});
			contents.push({html:"<input placeholder='Location'></input>"});
			//contents.push({html:"<input placeholder='GPS' disabled style='display:none;'></input>"});
			contents.push({html:"<!--<input placeholder='GPS' disabled style='display:none;'></input>--><input type='datetime-local'></input>"});
			contents.push({html:"</div>"});
			contents.push({html:"<button onclick='saveGatherUp("+'"'+id+'"'+");'>Save</button>"});
			write("Edit Gather-Up",contents,[{href:"loadGatherUp('"+id+"');",text:"Cancel"}]);
			document.querySelectorAll(".inputs")[0].querySelectorAll("input")[0].value=info.val().title||null;
			document.querySelectorAll(".inputs")[0].querySelectorAll("input")[1].value=info.val().location||null;
			//document.querySelectorAll(".inputs")[0].querySelectorAll("input")[2].value=info.val().gps||null;
			if(info.val().date!=null){
				document.querySelectorAll(".inputs")[0].querySelectorAll("input")[2].value=document.querySelectorAll(".inputs")[0].querySelectorAll("input")[2].value=new Date(new Date(info.val().date).getTime()-(new Date().getTimezoneOffset()*60*1000)).toISOString().split(".")[0].substr(0,16);
			}
			autocomplete = new google.maps.places.Autocomplete((document.querySelectorAll(".inputs")[0].querySelectorAll("input")[1]));
 //      			autocomplete.addListener('place_changed', fillInAddress);
			/*
			map = new google.maps.Map(document.getElementById('map'), {
				zoom: 15,
				center: {lat:lati,lng:long}
			});
			var marker = new google.maps.Marker({
				position: {lat:lati,lng:long},
				map: map,
				draggable:true
			});
			google.maps.event.addListener(marker, 'dragend', function(evt){
				map.panTo(marker.getPosition());
				moveMapView(evt.latLng.lat(),evt.latLng.lng());
			});
			moveMapView(lati,long,true);*/
		//	document.querySelectorAll(".inputs")[0].querySelectorAll("input")[3].value=new Date(Date.now()-new Date().getTimezoneOffset()*60*1000+(60*60*1000*24)).toISOString().split(".")[0].slice(0,-3);
		});
	});
}

function saveGatherUp(id){
	var title=document.querySelectorAll(".inputs")[0].querySelectorAll("input")[0].value||null;
	var loc=document.querySelectorAll(".inputs")[0].querySelectorAll("input")[1].value||null;
//var gps=document.querySelectorAll(".inputs")[0].querySelectorAll("input")[2].value||null;
	var date=document.querySelectorAll(".inputs")[0].querySelectorAll("input")[2].value||null;
	if(date!=null){
		date=new Date(new Date(date).getTime());//+(new Date().getTimezoneOffset()*60*1000));
	}
	if(title!=null&&title!=""){
		var key=id;
		firebase.database().ref("gatherups/"+key+"/info").update({
			title:title,
			location:loc,
//			gps:gps,
			date:date
		}).then(function(){
			loadGatherUp(key);
		});
	}else{
		alert("A title is required to edit a gather-up.");
	}
}

function newGatherUp(){
	var title=document.querySelectorAll(".inputs")[0].querySelectorAll("input")[0].value||null;
	var loc=document.querySelectorAll(".inputs")[0].querySelectorAll("input")[1].value||null;
//	var gps=document.querySelectorAll(".inputs")[0].querySelectorAll("input")[2].value||null;
	var date=document.querySelectorAll(".inputs")[0].querySelectorAll("input")[2].value||null;
	if(date!=null){
		date=new Date(new Date(date).getTime());//+(new Date().getTimezoneOffset()*60*1000));
	}
	if(title!=null&&title!=""){
		var key=firebase.database().ref("gatherups/").push().key;
		firebase.database().ref("gatherups/"+key).update({
			info:{
				title:title,
				location:loc,
//				gps:gps,
				date:date
			},
			members:{
				[uid]:15
			}
		}).then(function(){
			loadGatherUp(key);
		});
	}else{
		alert("A title is required to schedule a gather-up.");
	}
}

function loadGatherUp(id){
	clear();
	window.location.hash=id;
	firebase.database().ref("gatherups/"+id+"/info").once("value",function(gather){
		firebase.database().ref("gatherups/"+id+"/members/"+uid).once("value",function(member){
			try{
				var link=[{text:"Leave Gather-Up",href:"if(confirm('Are you sure you want to leave "+gather.val().title+"?')){leaveGatherUp('"+id+"');}"}];
				if(member.val()==null){
					link=[{text:"Join Gather-Up",href:"joinGatherUp('"+id+"');"}];
				}else{
					link.unshift({text:"Edit Info",href:"editGatherUp('"+id+"');"});
				}
				var value=member.val();
				var contents=[{text:gather.val().location||"Unknown Location"},{text:gather.val().date||"Unknown Date"}];
				var check="checked";
				if(value<0){
					value=(-value);
					check="";
				}
				var cb="<input type='checkbox' style='width:3vh;height:3vh;' "+check+" onclick='saveReminderTime(this.classList[0]);' class='"+id+"' />";
				var extra="";
				if(Notification.permission!="granted"){
					extra="<button onclick='offerNotifications("+'"'+id+'"'+");'>Enable Notifications</button>";
				}
				if(member.val()!=null){
					contents.push({html:cb+"Remind me <input type='number' style='width:10vh;text-align:center;' value='"+value+"' step='5' min='0' onchange='saveReminderTime(this.classList[0]);' class='"+id+"'></input> minutes before the event"+extra});
				}
				if(navigator.share){
					link.unshift({text:"Invite",href:"navigator.share({title: '"+gather.val().title+"'+' - GatherApp', text: 'Join '+'"+gather.val().title+"'+' on GatherApp!', url: 'https://kentonishi.github.io/gatherapp#"+id+"'})"});
				}
				contents.push({html:""});
				write(gather.val().title,contents,link);
			}catch(TypeError){
				write("Error",[{text:"Error loading gather-up."}]);
			}
		});
	});
}

function saveReminderTime(id){
	var value=parseInt(document.querySelectorAll('input[type="number"]')[0].value||0);
	if(!document.querySelectorAll('input[type="checkbox"]')[0].checked){
		value=(-value);
	}
	firebase.database().ref("gatherups/"+id+"/members").update({
		[uid]:value
	});
}

function loadGatherUps(){
	clear();
	firebase.database().ref("users/"+uid+"/gatherups").once("value",function(gathers){
		if(gathers.val()==null){
			write("No Gather-Ups",[{text:"You have no scheduled gather-ups."}]);
		}
		gathers.forEach(gather=>{
			firebase.database().ref("gatherups/"+gather.key+"/info").once("value",function(gatherup){
				write(gatherup.val().title,null,null,"loadGatherUp('"+gather.key+"');");
			});
		});
	});
}

function joinGatherUp(id){
	firebase.database().ref("gatherups/"+id+"/members/").update({
		[uid]:15
	}).then(function(){
		loadGatherUp(id);
	});
}

function leaveGatherUp(id){
	firebase.database().ref("gatherups/"+id+"/members/"+uid).remove().then(function(){
		feed();
	});
}

function moveMapView(x,y,z){
	map.setCenter(new google.maps.LatLng(x,y));
	new google.maps.Geocoder().geocode({'latLng' : {lat:x,lng:y}}, function(results, status) {
    		if (status == google.maps.GeocoderStatus.OK) {
			if (results[0]) {
				if(z==null){
					document.querySelectorAll(".inputs")[0].querySelectorAll("input")[1].value=results[0].formatted_address;
				}
			}
		}
		if(z==null){
			document.querySelectorAll(".inputs")[0].querySelectorAll("input")[2].value=x+","+y;
		}
	});
}


if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register('/gatherapp/worker.js').then(function(reg){
		firebase.messaging().useServiceWorker(reg);
		worker=reg;
	});
}

function login(provider) {
	var provider;
	if(provider=="Google"){
		provider = new firebase.auth.GoogleAuthProvider();
	}
	firebase.auth().signInWithPopup(provider).then(function(result) {
	}).catch(function(error) {
	});
}

function signOut() {
	firebase.auth().signOut().then(function() {
		location.reload(true);
	}).catch(function(error) {
	});
}


if(navigator.onLine){
	firebase.auth().onAuthStateChanged(function(me) {
		if (me) {
			uid = me.uid;
			name = me.displayName;
			pic = me.photoURL;
			me.getIdToken().then(function(userToken) {
			});
			$.get("https://ipinfo.io", function(response) {
	//				city=response.city+", "+response.country;
				lat=parseFloat(response.loc.split(",")[0]);
				lng=parseFloat(response.loc.split(",")[1]);
				city=response.city+", "+response.country;
			}, "jsonp").then(function(){
				geolocation();
			}).catch(function(){
				geolocation();
			});
			firebase.database().ref("users/"+uid+"/info").update({
				name:name,
	//				search:name.toLowerCase().replace(/ /g,""),
				pic:pic
	//				city:city
			});
			if(window.location.hash.substr(1,window.location.hash.length)!=""){
				loadGatherUp(window.location.hash.substr(1,window.location.hash.length));
			}else{
				action("home");
			}
		}
	});
}else{
	clear();
	write("No internet connection",[{text:"You are not connected."}],[{text:"Try Again",href:"location.reload();"}]);
}

function offerNotifications(id){
	Notification.requestPermission().then(permission=>{
		if(permission==="granted"){
			navigator.serviceWorker.ready.then(function(reg){
				return reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:urlBase64ToUint8Array("BHEaekpS-pAfp4pYeqyJHw6cBmhlxx9bxBHjowhsxyDcuYR-ipUrWT9wAf_AP-q_mgGSwQryLaPMpyhcqByDyqo")});
			}).then(function(sub){
				firebase.database().ref("users/"+uid+"/info").update({sub:sub}).then(function(){
					loadGatherUp(id);
				});
			});
		 }
	});
}

function urlBase64ToUint8Array(base64String) {
	const padding = '='.repeat((4 - base64String.length % 4) % 4);
	const base64 = (base64String + padding)
	.replace(/\-/g, '+')
	.replace(/_/g, '/')
	;
	const rawData = window.atob(base64);
	return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

function geolocation(){
	navigator.permissions.query({'name': 'geolocation'}) .then( permission => {
		if (navigator.geolocation&&permission.state=="granted") {
			navigator.geolocation.getCurrentPosition(pos=>{lat=pos.coords.latitude;lng=pos.coords.longitude;});
		}
	});
}

function action(act) {
	window.location.hash="";
	if(uid!=""){
		if (act == "menu") {
		//	menu();
			loadGatherUps();
		} else if (act == "add") {
			start();
		} else if (act == "home") {
			feed();
		}
	}
}

function clear(e){
	document.querySelectorAll(".body")[0].innerHTML="";
} 

function reverse(snapshot) {
	let reversed = [];
	snapshot.forEach(child => {
		reversed.unshift(child);
	});
	return reversed;
}

function write(title,contents,links,href){
	try{
		var body='';
		contents=contents||[];
		links=links||[];
		if(href!=null){
			body+='<div class="card" onclick="'+href+'">';
		}else{
			body+='<div class="card">';
		}
		if((title==null&&contents!=null)){
		}else{
			body+='<span style="font-size:5.5vh;">';
			body+='<strong>';
			body+=encode(title);
			body+='</strong>';
			body+='</span>';
			body+='<br />';
		}
		for(var i=0;i<contents.length;i++){
			if(contents[i].html!=null){
				body+=contents[i].html;
			}else if(contents[i].text!=null){
				body+='<span style="font-size:4vh">';
				body+=encode(contents[i].text);
				body+='</span>';
			}
			body+='<br />';
		}
		for(var i=0;i<links.length;i++){
			if(links[i].href!=null&&links[i].text!=null){
				body+='<span style="font-size:4vh">';
				body+='<a href="#" onclick="'+links[i].href+';return false;">';
				body+=encode(links[i].text);
				body+='</a>';
				body+='</span>';
			}
			body+='<br />';
		}
		body+='</div>';
		document.querySelectorAll('.body')[0].innerHTML=body+document.querySelectorAll('.body')[0].innerHTML;
	}catch(TypeError){
		write('Error',[{text:'GatherApp encountered an error.'}]);
	}
}

function encode(e){
	return e.replace(/[^]/g,function(e){return"&#"+e.charCodeAt(0)+";"}).replace(/&amp;quot;/g,'"');
}

function decode(html) {
	var txt = document.createElement("textarea");
	txt.innerHTML = html;
	return txt.value;
}

function getFormattedDate(date) {
	date=new Date(date);
	var year = date.getFullYear();
	var month = (1 + date.getMonth()).toString();
	month = month.length > 1 ? month : '0' + month;
	var day = date.getDate().toString();
	day = day.length > 1 ? day : '0' + day;
	return month + '/' + day + '/' + year;
}

window.onerror = function (message, file, line, col, error) {
	clear();
	write();
};
