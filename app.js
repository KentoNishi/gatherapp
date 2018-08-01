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
var city="";
var lat;
var lng;
var worker;

function menu(){
	clear();
	write(name,[{html:"<img src='"+pic+"' class='pic'></img>"},{text:"Standard User"}],[{href:"signOut();",text:"Sign Out"}]);
}

function feed(id){
	clear();
	var alias="users/"+uid;
	if(id!=null){
		alias="groups/"+id;
	}
	firebase.database().ref(alias+"/feed").once("value",function(notifications){
		if(notifications.val()==null){
			if(id==null){
				write("Welcome!",[{text:"Welcome to GatherApp, "+name+"!"}]);
			}else{
				write("No Activity",[{text:"There are no recent events."}]);
			}
		}
		notifications.forEach(function(notification){
			if(notification.val().content!=null){
				write(notification.val().title,[{text:notification.val().content}]);
			}else{
				write(notification.val().title,[{text:"Gather-Up"},{text:notification.val().location.split(",")[0]+","+notification.val().location.split(",")[1]},{text:getFormattedDate(notification.val().date)}]);
			}
		});
		if(id!=null){
			write("Return To Group",null,null,"loadGroup('"+id+"');");
		}
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

function sendFeed(path,title,content){
	firebase.database().ref(path).push().update({
		title:title,
		content:content
	});
}

function start(){
	clear();
	write("New Group",null,null,"newGroup();");
	write("Find Groups",null,null,"findGroups();");
	write("My Groups",null,null,"myGroups();");
}

/*
var map;
function requestGatherUp(id){
	clear();
	var contents=[];
	contents.push({html:"<div id='map' class='pic'></div><div class='inputs'>"});
	contents.push({html:"<input placeholder='Title'></input>"});
	contents.push({html:"<input placeholder='Location'></input>"});
	contents.push({html:"<input type='datetime-local'></input>"});
	contents.push({html:"</div>"});
	contents.push({html:"<button onclick='newGatherUp("+'"'+id+'"'+");'>Schedule</button>"});
	write("New Gather-Up",contents,[{href:"loadGroup('"+id+"');",text:"Cancel"}]);
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
}

function newGatherUp(id){
	var title=document.querySelectorAll(".inputs")[0].querySelectorAll("input")[0].value;
	var location=document.querySelectorAll(".inputs")[0].querySelectorAll("input")[1].value;
	var date=document.querySelectorAll(".inputs")[0].querySelectorAll("input")[2].value;
	if(title!=null&&location!=null&&date!=null&&title!=""&&location!=""&&date!=""){
		firebase.database().ref("groups/"+id+"/feed").push().update({
			title:title,
			location:location,
			date:date
		}).then(function(){
			loadGroup(id);
		});
	}else{
		alert("Please complete all input fields.");
	}
}

function moveMapView(x,y){
	map.setCenter(new google.maps.LatLng(x,y));
	new google.maps.Geocoder().geocode({'latLng' : {lat:x,lng:y}}, function(results, status) {
    		if (status == google.maps.GeocoderStatus.OK) {
			if (results[0]) {
				document.querySelectorAll(".inputs")[0].querySelectorAll("input")[1].value=results[0].formatted_address;
			}
		}
	});
}
*/

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
}

firebase.auth().onAuthStateChanged(function(me) {
	if (me) {
		firebase.database().ref("users/"+me.uid+"/info").once("value",function(shot){
			uid = me.uid;
			if(worker.active.postMessage!=null){
				worker.active.postMessage(uid);
			}
			name = me.displayName;
			pic = me.photoURL;
			me.getIdToken().then(function(userToken) {
			});
			$.get("https://ipinfo.io", function(response) {
				city=response.city+", "+response.country;
				lat=parseFloat(response.loc.split(",")[0]);
				lng=parseFloat(response.loc.split(",")[1]);
				city=response.city+", "+response.country;
				firebase.database().ref("users/"+uid+"/info").update({
					name:name,
					search:name.toLowerCase().replace(/ /g,""),
					pic:pic,
					city:city
				});
			}, "jsonp");
			if (navigator.geolocation) {
				Notification.requestPermission().then(permission=>{
					if(permission==="granted"){
						navigator.serviceWorker.ready.then(function(reg){
							return reg.pushManager.subscribe({userVisibleOnly:true});
						}).then(function(sub){
							firebase.database().ref("users/"+uid+"/info/sub").update({sub});
						});
					 }
				});
				navigator.geolocation.getCurrentPosition(pos);
			}
			action("home");
		});
	}
});

function action(act) {
    if(uid!=""){
        if (act == "menu") {
		menu();
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
		body+='<span style="font-size:5.5vh;">';
		body+='<strong>';
		body+=encode(title);
		body+='</strong>';
		body+='</span>';
		body+='<br />';
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
