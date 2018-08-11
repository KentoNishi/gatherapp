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

function menu(){
	clear();
	write(name,[{html:"<img src='"+pic+"' class='pic'></img>"},{text:"Standard User"}],[{href:"signOut();",text:"Sign Out"}]);
//	write("My Gather-Ups",null,null,"loadGatherUps();");
}

function feed(){
	clear();
	firebase.database().ref("users/"+uid+"/feed").once("value",function(notifications){
		if(notifications.val()==null){
			write("Welcome!",[{text:"Welcome to GatherApp, "+name+"!"}]);
		}
		notifications.forEach(function(notification){
			write(notification.val().title,[{text:notification.val().content}],null,"loadGatherUp('"+notification.val().tag+"');");
		});
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
	clear();
	var contents=[];
	contents.push({html:"<div id='map' class='pic'></div><div class='inputs'>"});
	contents.push({html:"<input placeholder='Title'></input>"});
	contents.push({html:"<input placeholder='Location'></input>"});
	contents.push({html:"<input placeholder='GPS'></input>"});
	contents.push({html:"<input type='datetime-local' style='font-size:2.5vh;'></input>"});
	contents.push({html:"</div>"});
	contents.push({html:"<button onclick='newGatherUp();'>Schedule</button>"});
	write("New Gather-Up",contents,[{href:"feed();",text:"Cancel"}]);
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
	moveMapView(lat,lng);
	document.querySelectorAll(".inputs")[0].querySelectorAll("input")[3].value=new Date(Date.now()-new Date().getTimezoneOffset()*60*1000+(60*60*1000*24)).toISOString().split(".")[0].slice(0,-3);
}

function newGatherUp(){
	var title=document.querySelectorAll(".inputs")[0].querySelectorAll("input")[0].value||null;
	var loc=document.querySelectorAll(".inputs")[0].querySelectorAll("input")[1].value||null;
	var gps=document.querySelectorAll(".inputs")[0].querySelectorAll("input")[2].value||null;
	var date=document.querySelectorAll(".inputs")[0].querySelectorAll("input")[3].value||null;
	if(date!=null){
		date=new Date(new Date(date).getTime());//+(new Date().getTimezoneOffset()*60*1000));
	}
	if(title!=null&&title!=""){
		var key=firebase.database().ref("gatherups/").push().key;
		firebase.database().ref("gatherups/"+key).update({
			info:{
				title:title,
				location:loc,
				gps:gps,
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
	firebase.database().ref("gatherups/"+id+"/info").once("value",function(gather){
		firebase.database().ref("gatherups/"+id+"/members/"+uid).once("value",function(member){
			var link=[{text:"Leave Gather-Up",href:"leaveGatherUp('"+id+"');"}];
			if(member.val()==null){
				link=[{text:"Join Gather-Up",href:"joinGatherUp('"+id+"');"}];
			}
			var value=member.val();
			var contents=[{text:gather.val().location||"Unknown Location"},{text:gather.val().date||"Unknown Date"}];
			var check="checked";
			if(value<0){
				value=(-value);
				check="";
			}
			var cb="<input type='checkbox' style='width:3vh;height:3vh;' "+check+" onclick='saveReminderTime(this.classList[0]);' class='"+id+"' />";
			contents.push({html:cb+"Remind me <input type='number' style='width:10vh;text-align:center;' value='"+value+"' step='5' min='0' onchange='saveReminderTime(this.classList[0]);' class='"+id+"'></input> minutes before the event"});
			if(navigator.share){
				link.push({text:"Share on Social Media",href:"navigator.share({title: '"+gather.val().title+"'+' - GatherApp', text: 'Join '+'"+gather.val().title+"'+' on GatherApp!', url: 'https://kentonishi.github.io/gatherapp#"+id+"'})"});
			}
			contents.push({html:""});
			write(gather.val().title,contents,link);
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
	firebase.database().ref("gatherups/"+id+"/members/").remove().then(function(){
		feed();
	});
}

function moveMapView(x,y){
	map.setCenter(new google.maps.LatLng(x,y));
	new google.maps.Geocoder().geocode({'latLng' : {lat:x,lng:y}}, function(results, status) {
    		if (status == google.maps.GeocoderStatus.OK) {
			if (results[0]) {
				document.querySelectorAll(".inputs")[0].querySelectorAll("input")[1].value=results[0].formatted_address;
			}
		}
		document.querySelectorAll(".inputs")[0].querySelectorAll("input")[2].value=x+","+y;
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

function pos(coord){
	lat=coord.coords.latitude;
	lng=coord.coords.longitude;
	/*
	var latlng=new google.maps.LatLng(lat,lng);
	new google.maps.Geocoder().geocode({'latLng' : latlng}, function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
			if (results[0]) {
				var country = null, countryCode = null, loc = null, locAlt = null;
				var c, lc, component;
				for (var r = 0, rl = results.length; r < rl; r += 1) {
					var result = results[r];
					if (!loc && result.types[0] === 'locality') {
						for (c = 0, lc = result.address_components.length; c < lc; c += 1) {
							component = result.address_components[c];
							if (component.types[0] === 'locality') {
								loc = component.long_name;
								break;
							}
						}
					}
					else if (!loc && !locAlt && result.types[0] === 'administrative_area_level_1') {
						for (c = 0, lc = result.address_components.length; c < lc; c += 1) {
							component = result.address_components[c];
							if (component.types[0] === 'administrative_area_level_1') {
								locAlt = component.long_name;
								break;
							}
						}
					} else if (!country && result.types[0] === 'country') {
						country = result.address_components[0].long_name;
						countryCode = result.address_components[0].short_name;
					}
					if (loc && country) {
						break;
					}
				}
				city=(loc + ", " + countryCode);
				firebase.database().ref("users/"+uid+"/info").update({
					city:city
				});
			}
		}
	});
	*/
}

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
		}, "jsonp");
		firebase.database().ref("users/"+uid+"/info").update({
			name:name,
//				search:name.toLowerCase().replace(/ /g,""),
			pic:pic
//				city:city
		});
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(pos);
		}
		Notification.requestPermission().then(permission=>{
			if(permission==="granted"){
				navigator.serviceWorker.ready.then(function(reg){
					return reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:urlBase64ToUint8Array("BHEaekpS-pAfp4pYeqyJHw6cBmhlxx9bxBHjowhsxyDcuYR-ipUrWT9wAf_AP-q_mgGSwQryLaPMpyhcqByDyqo")});
				}).then(function(sub){
					firebase.database().ref("users/"+uid+"/info").update({sub:sub});
				});
			 }
		});
		if(window.location.hash.substr(1,window.location.hash.length)!=""){
			loadGatherUp(window.location.hash.substr(1,window.location.hash.length));
		}else{
			action("home");
		}
	}
});

function urlBase64ToUint8Array(base64String) {
	const padding = '='.repeat((4 - base64String.length % 4) % 4);
	const base64 = (base64String + padding)
	.replace(/\-/g, '+')
	.replace(/_/g, '/')
	;
	const rawData = window.atob(base64);
	return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

function action(act) {
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
