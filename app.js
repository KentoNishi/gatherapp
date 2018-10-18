var install;
window.addEventListener('beforeinstallprompt', (e) => {
	e.preventDefault();
	install = e;
});

var config = {
	apiKey: "AIzaSyB4meNlwVUltd007qmH9hPQpn6Oz_CF3xM",
	authDomain: "gatherapp-14b50.firebaseapp.com",
	databaseURL: "https://gatherapp-14b50.firebaseio.com",
	projectId: "gatherapp-14b50",
	storageBucket: "",
	messagingSenderId: "187325007601"
};
firebase.initializeApp(config);

window.onerror = function myErrorHandler(errorMsg, url, lineNumber) {
	write("App Error",[{text:"GatherApp encountered an error."},{text:"Message: "+errorMsg},
			   {text:"Source: "+url},{text:"Line: "+lineNumber}]);
	return false;
}

var uid = "";
var name = "";
var pic = "";
var city="";
var lat;
var lng;
//var back={data:["loadEvents();","loadEvents();"]};
var ons=[];

/*
back.add=(function(param){
	back.data.push(param);
	back.data=back.data.slice(back.data.length-2,back.data.length);
	ons.forEach(listener=>{
		firebase.database().ref(listener).off("value");
	});
	ons=[];
});
*/

document.querySelectorAll(".metas")[0].innerHTML=('<meta name="viewport" content="width=device-width,height='+window.innerHeight+', initial-scale=1.0">');

function menu(){
//	back.add("menu();");
	clear();
		write(name,[{html:"<img style='width:30vw;height:30vw;' src='"+pic+"' class='pic'></img>"},{text:"Standard User"}],[{href:"signOut();",text:"Sign Out"}]);
	write("Skipped Events",null,null,"loadEvents(0);");
	write("Cancelled Events",null,null,"loadEvents(3);");
	write("Completed Events",null,null,"loadEvents(2);");
	write("Search Events",[{html:"<input maxlength='50' class='search' placeholder='Title/Location'></input>"},
			       {html:"Search In: <select style='font-size:2.5vh;'>"+
				"<option value='events'>All</option>"+
				"<option value='upcoming'>Upcoming</option>"+
				"<option value='completed'>Completed</option>"+
				"<option value='cancelled'>Cancelled</option>"+
				"<option value='skipped'>Skipped</option>"+
				"<option value='pending'>Pending</option>"+
				"</select>"
			       },
				{html:"<button style='margin-top:1vh;' "+
				"onclick='searchEvents();'>Search</button>"}]);
	if(install!=null){
		write("Get The App!",[//{text:"Pin GatherApp to your home screen."},
				      {html:"<button onclick='installApp();' style='background-color:rgba(0,255,0,0.3);'>Download Now</button>"}],
		     null,// [{text:"No Thanks",href:"if(confirm('Are you sure you want to skip downloading the app?')){installApp(0);}"}],
		     null,"installPrompt");
	}
}

function linkify(inputText) {/*
	var replacedText, replacePattern1, replacePattern2, replacePattern3;
	replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
	replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');
	replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
	replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>');
	replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
	replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');
	return replacedText;*/
	return inputText;
}

function installApp(e){
	if(e==null){
		install.prompt();
		install.userChoice.then((choiceResult) => {
			if (choiceResult.outcome === 'accepted') {
				write("App Pinned!",[{text:"GatherApp was pinned to your home screen."}],
				      null,null,null,".installPrompt");
			} else {
				document.querySelectorAll(".installPrompt")[0].outerHTML="";
			}
			install = null;
		});
	}else{
		document.querySelectorAll(".installPrompt")[0].outerHTML="";
		install = null;
	}
}

function searchEvents(){
	var query=document.querySelectorAll(".search")[0].value;
	if(query!=null&&query.replace(/ /g,"").replace(/\n/gi,"")!=""&&query.replace(/ /g,"").replace(/\n/gi,"").length>0){
		var int=null;
		if(document.querySelectorAll("select")[0].value=="upcoming"){
			int=1;
		}else if(document.querySelectorAll("select")[0].value=="completed"){
			int=2;
		}else if(document.querySelectorAll("select")[0].value=="cancelled"){
			int=3;
		}else if(document.querySelectorAll("select")[0].value=="skipped"){
			int=0;
		}else if(document.querySelectorAll("select")[0].value=="pending"){
			int=4;
		}
		loadEvents(int,query.toLowerCase());
	}else{
		document.querySelectorAll(".search")[0].style.background="pink";
		document.querySelectorAll(".search")[0].oninput=function(){
			document.querySelectorAll(".search")[0].style.background="white";
			document.querySelectorAll(".search")[0].oninput=null;
		};
	}
}

function settings(){
//
}

function start(){
	if(document.querySelectorAll(".eventInfo").length<1){
//		back.add("start();");
		requestEvent();
	}else{
	}
}

function cancelEvent(id,confirmed){
	if(confirmed!=null){
		firebase.database().ref("events/"+id+"/info").update({cancel:1}).then(function(){	
			loadEvent(id);
		});
	}else{
		customConfirm("Are you sure you want to cancel this event?","cancelEvent('"+id+"',1);");
	}
}

function reactivateEvent(id,confirmed){
	if(confirmed!=null){
		firebase.database().ref("events/"+id+"/info").update({cancel:null}).then(function(){	
			loadEvent(id);
		});
	}else{
		customConfirm("Are you sure you want to reactivate this event?","reactivateEvent('"+id+"',1);");
	}
}

function showDate(){
	if(document.querySelectorAll(".inputs")[0].querySelectorAll("input")[2].value!=null&&
	   document.querySelectorAll(".inputs")[0].querySelectorAll("input")[2].value!=""){
		document.querySelectorAll(".showdate")[0].innerHTML="<br />"+
		getFormattedDate(document.querySelectorAll(".inputs")[0].querySelectorAll("input")[2].value);
	}else{
		document.querySelectorAll(".showdate")[0].innerHTML="";
	}
}

/*
function addPlace(title,desc,callback){
	document.querySelectorAll(".pac-container")[0].insertAdjacentHTML('beforeend',
		"<div id='areasearch' class='pac-item areasearch' onmousedown="+'"'+callback+
		 ";"+'"'+"><span class='pac-icon pac-icon-areas'></span><span class='pac-item-query'>"+
		 "<span class='pac-matched'></span><strong>"+encode(title)+"</strong></span> <span>"+encode(desc)+"</span></div>");
}
*/

function searchPromos(area){
	var contents=[];
	contents.push({html:"<span class='promoSearch'>"+
		       "<input maxlength='50' placeholder='City/Area' onfocus='this.setSelectionRange(0, this.value.length);"+"'></input>"+
		       "</span>"});
	contents.push({html:"<div class='promoScreen"+
		"' style='text-align:center;height:50vh;overflow-y:auto;min-width:75vw;background-color:white;'></div>"});
	if(document.querySelectorAll(".promoCard").length==0){
		write("Promotions",contents,null,null,"promoCard");
	}
	document.querySelectorAll(".promoSearch")[0].querySelectorAll("input")[0].value=area;
	document.querySelectorAll(".promoScreen")[0].innerHTML="";
	function addPromo(object){
		if(object==null){
			object={};
			object.title="No Promotions";
			object.desc="There were no promotions in "+encode(area)+".";
			object.admin=true;
			object.callback="";
		}
		document.querySelectorAll(".promoScreen")[0].innerHTML+=
			("<br /><div style='background-color:"+
			(object.admin?"yellowgreen":("orange"))+
			";border-radius:2vh;padding:1vh;text-align:left;margin:0 auto;width:fit-content;'>"+
			encode(object.desc)+
			"<div style='font-size:2.5vh;text-align:center;'>"+
			"<strong>"+
			(object.admin?"GatherApp":object.title)+	
			"</strong></div></div>");
	}
	firebase.database().ref("promos/"+encode(area.split(", ").join("/"))).once("value",promos=>{
		if(promos.val()==null){
			addPromo();
		}else{
			promos.forEach(promo=>{
				addPromo({title:promo.val().title,desc:promo.val().desc,callback:""});
			});
		}
	});
}

function loadPromos(){/*
	var geocoder = new google.maps.Geocoder();
	geocoder.geocode( { 'address': "San Jose, CA, USA"}, function(results, status) {
		console.log(results);
	});*/
	searchPromos(city);
	var citycomplete = new google.maps.places.Autocomplete(
		(document.querySelectorAll(".promoSearch")[0].querySelectorAll("input")[0]),
		{ fields: [/*"name", "place_id", "formatted_address",*/
			"address_components",
			"address_components.types"],
		 types: ['(cities)'] });
	google.maps.event.addListener(citycomplete, 'place_changed', function(){
		var result=[];
		if(citycomplete.getPlace()!=null){
			if(citycomplete.getPlace().address_components!=null){
				citycomplete.getPlace().address_components.forEach(item=>{
					if(arrEq(item.types,["locality", "political"])&&result.length==0){
						result.push(item.long_name);
					}
					else if(arrEq(item.types,["administrative_area_level_1", "political"])&&result.length==1){
						result.push(item.long_name);
					}
					else if(arrEq(item.types,["country", "political"])&&result.length==2){
						result.push(item.short_name);
					}
				});
				if(result.length==3){
					searchPromos(result.join(", "));
				}
			}
		}
	});
}

function arrEq(arr1, arr2) {
	if(arr1.length !== arr2.length){
		return false;
	}
	for(var i = arr1.length; i--;) {
		if(arr1[i] !== arr2[i]){
			return false;
		}
	}
	return true;
}

function clearAutocomplete(e){
	for(var i=0;i<document.querySelectorAll(".pac-container").length;i++){
		document.querySelectorAll(".pac-container")[i].outerHTML="";
	}
}

function getZIP(){
	var xhr = new XMLHttpRequest();
	xhr.responseType = "json";
	xhr.open('GET', "https://ipinfo.io/json", true);
	xhr.send();
	xhr.onreadystatechange = function(e) {
	    if (xhr.readyState == 4 && xhr.status == 200) {
		city=xhr.response.city+", "+xhr.response.region+", "+xhr.response.country;
	    }
	};
}

var map;
function requestEvent(id,title,loc,date,place,duration,cancel){
	clear();
	clearAutocomplete();
	var contents=[];
	var extra="";
	contents.push({html:""+extra+"<div class='inputs'><input maxlength='50' placeholder='Title'></input>"});
	contents.push({html:"<input maxlength='50' placeholder='Address/Location' onfocus='this.setSelectionRange(0, this.value.length);"+"'></input>"});
	contents.push({html:"<input type='datetime-local' onchange='showDate();'></input>"+
		       "<strong><span style='font-size:3.5vh;color:#2e73f7;' class='showdate'></span></strong>"});
	contents.push({html:"<input style='width:10vh;text-align:center;' type='number' min='0' "+
		       "value='"+(duration!=null?Math.floor(duration/60):2)+"'></input>"+
		       " hours <input style='width:10vh;text-align:center;' type='number' min='0' max='59' "+
		       "value='"+(duration!=null?(duration%60):0)+"'></input> minutes"});
	contents.push({html:"<div class='iframe' style='display:none;'><br />"+
		       "<iframe frameborder='0' style='border:0;width:75vw;height:75vw;max-height:50vh;max-width:50vh;' allowfullscreen></iframe>"+
		       "</div></span>"+
		       (id!=null?(cancel==null?("<a style='color:red;font-size:3.5vh;' onclick='cancelEvent("+'"'+id+'"'+");return false;'"+
		       " href='#'>CANCEL EVENT</a><br />"):("<a style='color:green;font-size:3.5vh;' onclick='reactivateEvent("+'"'+id+'"'+");return false;'"+
		       " href='#'>REACTIVATE EVENT</a><br />")):"")
		      });
	contents.push({html:"<button onclick='"+((id==null)?"newEvent();":"saveEvent("+'"'+id+'"'+");")+"'>"+
		       (id!=null?"Save":"Schedule")+"</button>"});
	write(((id==null)?"New":"Edit")+" Event",contents,
	      [{href:((id==null)?("history.go(-1);"):("loadEvent('"+id+"');")),text:"Cancel"}],null,"eventInfo"+(id!=null?id:""));
	document.querySelectorAll(".inputs")[0].querySelectorAll("input")[0].value=title||null;
	document.querySelectorAll(".inputs")[0].querySelectorAll("input")[1].value=loc||null;
	if(date!=null){
		document.querySelectorAll(".inputs")[0].querySelectorAll("input")[2].value=
			new Date(new Date(date).getTime()-
				 (new Date().getTimezoneOffset()*60*1000)).toISOString().split(".")[0].substr(0,16);
		showDate();
	}
	autocomplete = new google.maps.places.Autocomplete(
		(document.querySelectorAll(".inputs")[0].querySelectorAll("input")[1]),
		{ fields: ["name", "place_id", "formatted_address"/*,"address_components",types: ['(cities)']*/] });
	google.maps.event.addListener(autocomplete, 'place_changed', function(){
		placeChanged();
	});
}

function placeChanged(){
	if(autocomplete.getPlace()!=null){
		if(autocomplete.getPlace().formatted_address.split(",").length>3){
			document.querySelectorAll(".inputs")[0].querySelectorAll(".iframe")[0].style.display="block";
			document.querySelectorAll(".inputs")[0].querySelectorAll("iframe")[0].src=
				"https://www.google.com/maps/embed/v1/place?q=place_id:"+
				autocomplete.getPlace().place_id+"&key=AIzaSyAiOBh4lWvseAsdgiTCld1WMXEMVo259hM";
		}else{
			document.querySelectorAll(".inputs")[0].querySelectorAll(".iframe")[0].style.display="none";
			document.querySelectorAll(".inputs")[0].querySelectorAll("input")[1].style.background="pink";
			document.querySelectorAll(".inputs")[0].querySelectorAll("input")[1].oninput=function(){
				document.querySelectorAll(".inputs")[0].querySelectorAll("input")[1].style.background="white";
				document.querySelectorAll(".inputs")[0].querySelectorAll("input")[1].oninput=null;
			};
		}
	}
}

var autocomplete;
function editEvent(id){
	var cont=true;
	if(window.location.hash!="#"+id+"/edit"){
		window.location.hash=("#");
		history.replaceState([],"","#"+id+"/edit");
		cont=false;
	}
	if(cont){
		firebase.database().ref("events/"+id+"/info").once("value",function(info){
			var addr;
			if(info.val().location!=null){
				addr=info.val().location.name+","+
					info.val().location.formatted_address.split(",")
					.slice(1,info.val().location.formatted_address.split(",").length).join(",");
			}
			requestEvent(id,info.val().title,addr||null,info.val().date.time,info.val().place,info.val().date.duration,info.val().cancel);
		});
	}
}

function saveEvent(id){
	newEvent(id);
}

function newEvent(id){
	var title=document.querySelectorAll(".inputs")[0].querySelectorAll("input")[0].value||null;
	var date=document.querySelectorAll(".inputs")[0].querySelectorAll("input")[2].value||null;
	var duration="120";
	if(parseInt(document.querySelectorAll(".inputs")[0].querySelectorAll("input")[3].value)>=0&&
	   parseInt(document.querySelectorAll(".inputs")[0].querySelectorAll("input")[4].value)>=0&&
	   parseInt(document.querySelectorAll(".inputs")[0].querySelectorAll("input")[4].value)<60){
		duration=(parseInt(document.querySelectorAll(".inputs")[0].querySelectorAll("input")[3].value)*60)+
			parseInt(document.querySelectorAll(".inputs")[0].querySelectorAll("input")[4].value);
	}
	if(date!=null){
		date=new Date(new Date(date).getTime()).getTime();
	}
	if(title!=null&&title!=""&&
	   (autocomplete.getPlace()==null||autocomplete.getPlace().formatted_address.split(",").length>3)){
		var key=id||firebase.database().ref("events/").push().key;
		document.querySelectorAll(".body")[0].innerHTML+="<span class='event"+key+"'></span>";
		var info={
			title:title,
			date:{
				time:date,
				duration:duration
			}
		}
		if(id==null){
			info.people=1;
		}
		if(autocomplete.getPlace()!=null){
			var loc=JSON.parse(JSON.stringify(autocomplete.getPlace()));	
			info.location=loc;
		}
		firebase.database().ref("events/"+key+"/info").update(info).then(function(){
			if(id==null){
				return firebase.database().ref("events/"+key+"/members").update({[uid]:15}).then(function(){
					loadEvent(key);
				});
			}else{
				loadEvent(key);
			}
		});
	}else{
		if(title==null||title==""){
			document.querySelectorAll(".inputs")[0].querySelectorAll("input")[0].style.background="pink";
			document.querySelectorAll(".inputs")[0].querySelectorAll("input")[0].oninput=function(){
				document.querySelectorAll(".inputs")[0].querySelectorAll("input")[0].style.background="white";
				document.querySelectorAll(".inputs")[0].querySelectorAll("input")[0].oninput=null;
			};
		}
		if(autocomplete.getPlace()!=null&&autocomplete.getPlace().formatted_address.split(",").length<3){
			document.querySelectorAll(".inputs")[0].querySelectorAll("input")[1].style.background="pink";
			document.querySelectorAll(".inputs")[0].querySelectorAll("input")[1].oninput=function(){
				document.querySelectorAll(".inputs")[0].querySelectorAll("input")[1].style.background="white";
				document.querySelectorAll(".inputs")[0].querySelectorAll("input")[1].oninput=null;
			};
		}
	}
}

function loadEvent(id){
	if(window.location.hash=="#"+id){
		loadEventPage(id);
	}else{
		window.location.hash=("");
		history.replaceState([],"","#"+id);
	}
}

function customConfirm(a,b){
	if(confirm(a)){
		eval(b);
	}
}

function loadEventPage(id){
	changeOns();
//	back.add("loadEvent('"+id+"');");
	var firstload=true;
	ons.push("events/"+id+"/info");
	firebase.database().ref("events/"+id+"/info").on("value",function(event){
		if(document.querySelectorAll(".loading"+id).length>0){
			firstload=true;
		}
		if(firstload||document.querySelectorAll(".infocard"+id).length>0){
			if(firstload){
				clear();
			}
			firebase.database().ref("users/"+uid+"/events/"+id+"/info").remove();
			firebase.database().ref("events/"+id+"/members/"+uid).once("value",function(me){
				try{
					if(event.val()==null){
						clear();
						write("Deleted Event",[{text:"This event has been removed."}]);
					}else if(event.val().title==null){
						throw(TypeError);
					}else{
						var member=me.val()||null;
						var value=member;
						var link=[{html:"<span style='color:red;font-size:3.5vh;'><a href='#' "+
							   "onclick='"+(me.val()!=null?('customConfirm("Are you sure you want to skip this event?","leaveEvent('+"`"+id+"`"+');");'):'leaveEvent('+"`"+id+"`"+');')+"return false;'"+
							   ">Skip Event</a></span>"}];
						if(member==null){
							link.unshift({html:"<button style='background-color:rgba(0,255,0,0.3);' "+
							   "onclick='"+
							   "joinEvent("+'"'+id+'"'+");'"+
							   ">Join Event</button>"});
						}else{
							link.unshift({text:"Edit Info",href:"editEvent('"+id+"');"});
						}
						var date="";
						if(event.val().date.time!=null){
							date=getFormattedDate(event.val().date.time);
						}
						var addr;
						if(event.val().location!=null){
							addr=event.val().location.name+","+
								event.val().location.formatted_address.split(",")
								.slice(1,event.val().location.formatted_address.split(",").length).join(",");
						}
						var contents=[{html:"<strong><span style='font-size:3.5vh;color:#2e73f7;'>"+encode(date||"Unknown Date")+"</span></strong>"},
							      {text:addr!=null?addr.split(",")/*.slice(0,addr.split(",").length-2)*/.join(","):"Unknown Location"}];
						if(event.val().location!=null){
							var body="";
							body+="<span style='font-size:3.5vh'>";
							body+="<a href='#' class='maptoggle hidden' onclick='showMap();return false;'>";
							body+=encode("View On Map");
							body+='</a>';
							body+='</span>';
							contents.push({html:body+"<span class='iframe' style='display:none;'><br />"+
								       "<iframe frameborder='0' style='border:0;width:75vw;height:75vw;max-width:50vh;max-height:50vh;' allowfullscreen src='"+
								       "https://www.google.com/maps/embed/v1/place?q=place_id:"+event.val().location.place_id+
								       "&key=AIzaSyAiOBh4lWvseAsdgiTCld1WMXEMVo259hM"+"'></iframe></span>"});
						}
						contents.push({text:event.val().date.duration!=null?
							       (Math.floor(event.val().date.duration/60)+"h"+(event.val().date.duration%60)+"m Long"):"Unknown Duration"});
						var check="checked";
						if(value<0){
							value=(-value);
							check="";
						}
						var cb="<span class='event"+id+"'></span><input type='checkbox' style='width:3vh;height:3vh;' "+check+
						    " onclick='saveReminderTime("+'"'+id+'"'+");' class='check"+id+"' />";
						var extra="";
						if(!iOS()&&Notification.permission!="granted"&&Notification.permission!="denied"){
							extra="<br /><button style='background-color:rgba(0,255,0,0.3);' onclick='offerNotifications("+'"'+id+'"'+");'>Enable Notifications</button>";
						}
						if(member!=null){
							var append="Remind me <input id='"+value+"' type='number' id='+value+' style='width:10vh;text-align:center;' value='"+value+
							    "' step='5' min='0' class='int"+id+"' onfocus='document.querySelectorAll("+'".okbutton"'+")[0].innerHTML="+'"✔️"'+
							    ";document.querySelectorAll("+'".nobutton"'+")[0].innerHTML="+'"❌"'+";'></input>";
							contents.push({html:cb+append+" <span class='okbutton' class='ok"+id+"' onclick='document.querySelectorAll("+'".okbutton"'+
								       ")[0].innerHTML=null;document.querySelectorAll("+'".nobutton"'+
								       ")[0].innerHTML=null;saveReminderTime("+'"'+id+'"'+
								       ");'></span> <span class='nobutton' class='no"+id+"' onclick='document.querySelectorAll("+
								       '".okbutton"'+")[0].innerHTML=null;document.querySelectorAll("+'".nobutton"'+
								       ")[0].innerHTML=null;document.querySelectorAll("+'"input[type=number]"'+
								       ")[0].value=Math.abs(parseInt(document.querySelectorAll("+'"input[type=number]"'+
								       ")[0].id));'></span> min. early"+extra});
						}
						if(event.val().cancel!=null){
							contents.push({html:"<span style='color:red;font-size:3.5vh;'>Cancelled Event</span>"});
						}
						else if(event.val().date.time!=null){
							if(new Date(event.val().date.time).getTime()+(event.val().date.duration*60*1000)<new Date().getTime()){
								contents.push({html:"<span style='color:green;font-size:3.5vh'>Completed Event</span>"});
							}else if(new Date(event.val().date.time).getTime()<new Date().getTime()){
								contents.push({html:"<span style='color:red;font-size:3.5vh;'>Ongoing Event</span>"});
							}
						}
						if(member!=null){
							var href="if(copyToClipboard('https://bit.do/gatherapp#"+id+"')){alert('Invite link copied to clipboard!');}else{prompt('Copy this invite link to your clipboard.','https://kentonishi.github.io/gatherapp#"+id+"');}";
							if(navigator.share){
								href="navigator.share({title: decodeURIComponent('"+
								      encodeURIComponent(event.val().title)+"')+' - GatherApp', text: 'Join '+decodeURIComponent('"+
								      encodeURIComponent(event.val().title)+"')+' on GatherApp!',"+
								      " url: 'https://bit.do/gatherapp#"+id+"'})";
							}
							link.unshift({text:"Invite",href:href});
						}
						if(firstload){
							loadEventBoard({id:id,member:member});
						}
						var links=[];
						if(!(event.val().people<6)){
							links=[{text:"View Members",href:"viewMembers('"+id+"');"}];
						}
						if(!firstload){
							write("Members",[{html:"<span class='members'></span>"}],links,null,"members"+id,".members"+id);
						}else{
							write("Members",[{html:"<span class='members'></span>"}],links,null,"members"+id);
						}
						if(document.querySelectorAll(".infocard"+id).length>0){
							write(event.val().title,contents,link,null,"infocard"+id,".infocard"+id);
						}else{
							write(event.val().title,contents,link,null,"infocard"+id);
						}
						if(event.val()!=null){
							firebase.database().ref("events/"+id+"/left/"+uid).once("value",function(my){
								if(my.val()==null&&member==null){
									pendEvent(id,0);
								}
							});
						}
						if(event.val().people<6){
							viewMembers(id);
						}else{
							document.querySelectorAll(".members")[0].innerHTML=encode(event.val().people+" People");
						}
					}
				}catch(TypeError){
					changeOns().then(function(){
						clear();
						write("Error",[{text:"Error loading event."}]);
					});
				}
				firstload=false;
			});
		}
	});
}

function isFacebookApp() {
	var ua = navigator.userAgent || navigator.vendor || window.opera;
	return (ua.indexOf("FBAN") > -1) || (ua.indexOf("FBAV") > -1);
}

function copyToClipboard(text) {
	if (window.clipboardData && window.clipboardData.setData) {
		return clipboardData.setData("Text", text); 
	} else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
		var textarea = document.createElement("textarea");
		textarea.textContent = text;
		textarea.style.position = "fixed";
		document.body.appendChild(textarea);
		textarea.select();
		try {
			return document.execCommand("copy");
		} catch (ex) {
			return false;
		} finally {
			document.body.removeChild(textarea);
		}
	}
}

function showMap(){
	if(document.querySelectorAll(".maptoggle")[0].classList[1]=="hidden"){
		document.querySelectorAll(".iframe")[0].style.display="block";
		document.querySelectorAll(".maptoggle")[0].innerHTML=encode("Hide Map");
		document.querySelectorAll(".maptoggle")[0].classList.remove("hidden");
		document.querySelectorAll(".maptoggle")[0].classList.add("shown");
	}else{
		document.querySelectorAll(".iframe")[0].style.display="none";
		document.querySelectorAll(".maptoggle")[0].innerHTML=encode("View On Map");
		document.querySelectorAll(".maptoggle")[0].classList.remove("shown");
		document.querySelectorAll(".maptoggle")[0].classList.add("hidden");
	}
}

function newBoardPost(id){
	if(document.querySelectorAll("textarea")[0].value!=null&&document.querySelectorAll("textarea")[0].value.replace(/ /g,"").replace(/\n/gi,"").length>0){
		firebase.database().ref("events/"+id+"/board/").push().update({
			content:document.querySelectorAll("textarea")[0].value,
			author:uid,
			date:new Date().getTime()
		}).then(function(){
			document.querySelectorAll("textarea")[0].value=null;
			autogrow(document.querySelectorAll("textarea")[0]);
		});
	}else{
		document.querySelectorAll("textarea")[0].style.background="pink";
		document.querySelectorAll("textarea")[0].oninput=function(){
			document.querySelectorAll("textarea")[0].style.background="white";
			document.querySelectorAll("textarea")[0].oninput=null;
		};
	}
}

function loadEventBoard(parameters){
	var id=parameters.id;
	var member=parameters.member;
	firebase.database().ref("events/"+id+"/board").off("value");
	if(ons.indexOf("events/"+id+"/board")>0){
		ons=ons.splice(ons.indexOf("events/"+id+"/board"),1);
	}
	ons.push("events/"+id+"/board");
	if(document.querySelectorAll(".board"+id).length<1){
		write("Event Board",[{html:"<div class='board"+id+
			"' style='text-align:center;height:50vh;overflow-y:auto;min-width:75vw;background-color:white;'>"+
			(member?("</div><textarea maxlength='1000' placeholder='Type A Message...' oninput='autogrow(this);' "+
			"style='overflow-y:auto;resize:none;margin-top:2.5vh;margin-bottom:2.5vh;max-width:75vw;"+
			"min-width:75vw;max-height:15vh;'></textarea><br /><button onclick='newBoardPost("+'"'+id+'"'+");' "+
			"style='margin-bottom:1.5vh;'>Post To Board</button>"):"")
			}],null,null,"boardcontainer");
	}
	firebase.database().ref("events/"+id+"/board").on("value",posts=>{
		if(posts.val()==null||
		   (
		   posts.val()[Object.keys(posts.val())[Object.keys(posts.val()).length-1]]!=null&&
		   posts.val()[Object.keys(posts.val())[Object.keys(posts.val()).length-1]].content!=null&&
		   posts.val()[Object.keys(posts.val())[Object.keys(posts.val()).length-1]].author!=null&&
		   posts.val()[Object.keys(posts.val())[Object.keys(posts.val()).length-1]].date!=null
		   )
		){
			firebase.database().ref("users/"+uid+"/events/"+id+"/board").remove();
			document.querySelectorAll(".board"+id)[0].innerHTML="";
			var writes=[];
			function addPost(object){
				writes.push("<div style='background-color:"+
				(object.admin?"yellowgreen":(object.author==uid?"cornflowerblue":"orange"))+
				";border-radius:2vh;padding:1vh;text-align:left;margin:0 auto;width:fit-content;'>"+
				encode(object.text)+
				"<div "+(object.admin?"":("class='"+object.key+"' "))+"style='font-size:2.5vh;text-align:center;'>"+
				"<strong>"+
				(object.admin?"GatherApp":"")+	
				"</strong></div></div>");
			};
			if(posts.val()==null){
				addPost({text:"This event has no board posts.",admin:true});
			}else{
				var allposts=[];
				posts.forEach(post=>{
					var param=post.val();
					param.key=post.key;
					allposts.push(param);
				});
				allposts=allposts.sort((a,b)=>{return a.date-b.date;});
				allposts.forEach(post=>{
					addPost({text:post.content,author:post.author,key:post.key});
				});
			}
			document.querySelectorAll(".board"+id)[0].innerHTML="<br />"+writes.join("<br />")+"<br />";
			posts.forEach(post=>{
				firebase.database().ref("users/"+post.val().author+"/info").once("value",info=>{
					document.querySelectorAll("."+post.key)[0].querySelectorAll("strong")[0].innerHTML=encode(info.val().name);
					document.querySelectorAll("."+post.key)[0].innerHTML+="<br />"+encode(getFormattedDate(post.val().date));
					document.querySelectorAll(".board"+id)[0].scrollTop=Math.pow(document.querySelectorAll(".board"+id)[0].scrollHeight,2);
				});
			});
		}
	});
}

function autogrow(element) {
	element.style.height = "5px";
	element.style.height = (element.scrollHeight+5)+"px";
	document.querySelectorAll(".body")[0].scrollIntoView(false);
}

function viewMembers(id){
	firebase.database().ref("events/"+id+"/members").once("value",function(members){
		Object.keys(members.val()).forEach(person=>{
			document.querySelectorAll(".members")[0].innerHTML+="<span class='user"+person+"'></span>";
			if(person!=Object.keys(members.val())[Object.keys(members.val()).length-1]){
				document.querySelectorAll(".members")[0].innerHTML+="<br />";
			}
		});
		members.forEach(member=>{
			firebase.database().ref("users/"+member.key+"/info").once("value",function(user){
				document.querySelectorAll(".user"+member.key)[0].innerHTML=encode(user.val().name);
			});
		});
	});
}

function saveReminderTime(id){
	var value=parseInt(document.querySelectorAll('input[type=number]')[0].value||0);
	if(value>0){
		if(!document.querySelectorAll('input[type=checkbox]')[0].checked){
			value=(-value);
		}
		firebase.database().ref("events/"+id+"/members").update({
			[uid]:value
		}).then(function(){
			document.querySelectorAll('input[type=checkbox]')[0].id=value;
		});
	}else{
		document.querySelectorAll(".okbutton")[0].innerHTML=null;
		document.querySelectorAll(".nobutton")[0].innerHTML=null;
		document.querySelectorAll("input[type=number]")[0].value=Math.abs(parseInt(document.querySelectorAll("input[type=number]")[0].id));
		document.querySelectorAll("input[type=checkbox]")[0].value=Math.abs(parseInt(document.querySelectorAll("input[type=checkbox]")[0].id));
	}
}

function loadEvents(inhistory,search){
	var cont=true;
	if(inhistory!=null||search!=null){
		var item;
		if(inhistory==0){
			item="skipped";
		}else if(inhistory==2){
			item="completed";
		}else if(inhistory==3){
			item="cancelled";
		}else if(inhistory==4){
			item="pending";
		}else if(inhistory==1){
			item="upcoming";
		}else{
			item="events";
		}
		if(search!=null){
			item="search/"+item+(item!=""?"/":"")+encodeURIComponent(search);
		}
		if(window.location.hash!="#/"+item){
			window.location.hash=("#");
			history.replaceState([],"","#/"+item);
			cont=false;
		}
	}
	if(cont){
//		back.add("loadEvents("+(inhistory!=null?inhistory:"")+");");
		clear();
		var writes=[];
		function returnPromise(){
			if(search==null&&(inhistory==null||inhistory==1)){
				return firebase.database().ref("users/"+uid+"/events").orderByChild("status").equalTo(4);
			}else{
				return {
					once:function(a,b){
						b({
							val:function(){
								return null;
							},
							forEach:function(){return;}
						});
					}
				};
			}
		}
		returnPromise().once("value",invites=>{
			function returnListener(){
				if(inhistory==null&&search!=null){
					return firebase.database().ref("users/"+uid+"/events");
				}else{
					return firebase.database().ref("users/"+uid+"/events").orderByChild("status").equalTo(inhistory!=null?inhistory:1);
				}
			}
			returnListener().once("value",events=>{
				if(events.val()==null){
					if(search==null){
						write("No Events",[{text:"You have no "+(inhistory!=null?(inhistory==2?"completed":(inhistory==0?"skipped":"cancelled")):"upcoming")+" events."}]);
					}else{
						write("No Results",[{text:"There were no results for your search."}]);
					}
				}else{
					function addPost(param){
						writes.push(param);
						if(writes.length==Object.keys(events.val()).length+(invites.val()!=null?Object.keys(invites.val()).length:0)){
							var pending=[];
							var ongoing=[];
							var future=[];
							var unknown=[];
							var completed=[];
							var cancelled=[];
							var found=false;
							writes.forEach(item=>{
								var address="";
								if(item.location!=null){
									address=item.location.name+", "+item.location.formatted_address.split(",").slice(1,item.location.formatted_address.split(",").length).join(", ");
								}
								if(search==null||(search!=null&&(item.title.toLowerCase().indexOf(search)>-1||address.toLowerCase().indexOf(search)>-1))){
									found=true;
									if(item.status.status!=4){
										if(item.cancel==null){
											if(item.date.time!=null&&new Date(item.date.time).getTime()+item.date.duration*60*1000>new Date().getTime()){
												if(new Date(item.date.time).getTime()>new Date().getTime()){
													if(item.date.time==null){
														unknown.push(item);
													}else{
														future.push(item);
													}
												}else{
													if(item.date.time==null){
														unknown.push(item);
													}else{
														ongoing.push(item);
													}
												}
											}else{
												if(item.date.time==null){
													unknown.push(item);
												}else if(new Date(item.date.time).getTime()+item.date.duration*60*1000<new Date().getTime()){
													completed.push(item);
												}else{
													future.push(item);
												}
											}
										}else{
											cancelled.push(item);
										}
									}else{
										pending.push(item);
									}
								}
							});
							if(!found){
								write("No Results",[{text:"There were no results for your search."}]);
							}
							pending=pending.sort((a,b)=>{return a.date.time-b.date.time;});
							ongoing=ongoing.sort((a,b)=>{return a.date.time-b.date.time;});
							if(inhistory!=null){
								future=future.concat(ongoing);
								ongoing=[];
							}
							completed=completed.sort((a,b)=>{return a.date.time-b.date.time;});
							cancelled=cancelled.sort((a,b)=>{return a.date.time-b.date.time;});
							future=future.sort((a,b)=>{return a.date.time-b.date.time;});
							if(inhistory==null){
								future=future.reverse();
							}
							ongoing=ongoing.reverse();
							var list=[unknown,cancelled,completed,future,ongoing];
							var completedEvents=[];
							var cancelledEvents=[];
							if(search==null||(search!=null&&inhistory==null)){
								list.push(pending);
							}
							list.forEach(listItem=>{
								listItem.forEach(item=>{
									var address="";
									if(item.location!=null){
										address=item.location.name+", "+item.location.formatted_address.split(",").slice(1,item.location.formatted_address.split(",").length).join(", ");
									}
									var duration=item.date.duration!=null?(Math.floor(item.date.duration/60)+"h"+(item.date.duration%60)+"m Long"):"Unknown Duration";
									var contents=[{html:"<strong><span style='font-size:3.5vh;color:#2e73f7;'>"+encode(item.date.time!=Infinity&&item.date.time!=null?getFormattedDate(item.date.time):"Unknown Date")+"</span></strong>"},{text:address||"Unknown Location"}];//,{text:duration}];
									if(item.status.status==4){
										contents.push({html:"<span style='color:red;font-size:3.5vh;'>Pending Invite</span>"});
									}
									if(item.cancel!=null){
										contents.push({html:"<span style='color:red;font-size:3.5vh;'>Cancelled Event</span>"});
									}
									else if(item.date.time!=null&&item.date.time!=undefined){
										if(new Date(item.date.time).getTime()+(item.date.duration*60*1000)<new Date().getTime()){
											contents.push({html:"<span style='color:green;font-size:3.5vh'>Completed Event</span>"});
										}else if(new Date(item.date.time).getTime()<new Date().getTime()){
											contents.push({html:"<span style='color:red;font-size:3.5vh;'>Ongoing Event</span>"});
										}
									}
									var border;
									if(item.status!=null&&item.status.info!=null){
										contents.push({html:"<span style='color:blue;font-size:3.5vh;'>Updated Info</span>"});
										border="orange";
									}
									if(item.status!=null&&item.status.board!=null){
										contents.push({html:"<span style='color:blue;font-size:3.5vh;'>"+encode(item.status.board)+" New Message"+(item.status.board>1?"s":"")+"</span>"});
										border="orange";
									}
									write(item.title,contents,null,"loadEvent('"+item.href+"');",null,null,border);
								});
							});
						}
					}
					events.forEach(event=>{
						firebase.database().ref("events/"+event.key+"/info").once("value",function(info){
							var obj=info.val();
							obj.status=event.val();
							obj.href=event.key;
							addPost(obj);
						});
					});
					invites.forEach(event=>{
						firebase.database().ref("events/"+event.key+"/info").once("value",function(info){
							var obj=info.val();
							obj.status=event.val();
							obj.href=event.key;
							addPost(obj);
						});
					});
				}
			});
		});
	}
}

function findInArray(ar, val) {
	val=val.toLowerCase();
	var returns=[];
	for (var i = 0,len = ar.length; i < len; i++) {
		if ( ar[i].title.toLowerCase().indexOf(val)>-1 ) { 
			returns.push(ar[i]);
		}
	}
	return returns.sort((a,b)=>{
		return a.date.time-b.date.time;
	}).reverse();
}

function joinEvent(id){
	firebase.database().ref("events/"+id+"/members/").update({
		[uid]:15
	}).then(function(){
		document.querySelectorAll(".body")[0].innerHTML="<span class='loading"+id+"'></span>";
	});
}

function leaveEvent(id,cont){
	changeOns().then(function(){
		firebase.database().ref("users/"+uid+"/events/"+id).update({status:0}).then(function(){
			firebase.database().ref("users/"+uid+"/events/"+id+"/board").remove().then(function(){
				firebase.database().ref("users/"+uid+"/events/"+id+"/info").remove().then(function(){
					if(cont==null){
						action("home");
					}
				});
			});
		});
	});
}

function pendEvent(id,cont){
	firebase.database().ref("users/"+uid+"/events/"+id).update({status:4}).then(function(){
		firebase.database().ref("users/"+uid+"/events/"+id+"/board").remove().then(function(){
			firebase.database().ref("users/"+uid+"/events/"+id+"/info").remove().then(function(){
				if(cont==null){
					action("home");
				}
			});
		});
	});
}

if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register('/gatherapp/worker.js').then(function(reg){
		worker=reg;
	});
}

function login(provider) {
	var provider;
	if(provider=="Google"){
		provider = new firebase.auth.GoogleAuthProvider();
	}
	firebase.auth().signInWithRedirect(provider).then(function(result) {
	}).catch(function(error) {
	});
}

function signOut() {
	firebase.auth().signOut().then(function() {
		window.location.hash="#";
	}).catch(function(error) {
	});
}

window.onhashchange= (function() {
	changeOns().then(function(){
		hashChanged();
	});
});

function changeOns(){
	var returns=[];
	ons.forEach(listener=>{
		returns.push(firebase.database().ref(listener).off("value"));
	});
	ons=[];
	return Promise.all(returns);
}

function iOS(){
	return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

window.onload=function(){
	if(navigator.onLine){
		if(!isFacebookApp()){
			firebase.auth().onAuthStateChanged(function(me) {
				if (me) {
					if(!iOS()&&Notification.permission=="granted"){
						offerNotifications();
					}
					uid = me.uid;
					name = me.displayName;
					pic = me.photoURL;
					try{
						window.webkit.messageHandlers["scriptHandler"].postMessage(uid);
					}catch(error){
					}
					getZIP();
					me.getIdToken().then(function(userToken) {
					});
					firebase.database().ref("users/"+uid+"/info").update({
						name:name//,
						//pic:pic
					});
					if(!hashChanged(1)){
						history.pushState([],"","#/");
						action("home");
					}
				}else{
					document.querySelectorAll(".body")[0].innerHTML=`
						<div class="card" onclick="login('Google')">
							<span style="font-size:4.5vh;"><strong>Sign In</strong></span><br />
							<span style="font-size:3.5vh;">Sign in to GatherApp with a Google Account.</span><br />
							<img alt="image" src="/gatherapp/google.png" style="width:50vw;height:auto;">
							</img>
						</div>
					`;
				}
			});
		}else{
			clear();
			write("Open App ↗️",[{text:"Tap the menu button, and press "+'"Open With..."'+" to use GatherApp."}]);
		}
	}else{
		clear();
		write("No Internet Connection",[{text:"You are not connected."}],[{text:"Try Again",href:"location.reload();"}]);
	}
};

function hashChanged(load){
	if(uid!=null&&uid!=""){
		if(window.location.hash.substr(1,window.location.hash.length)!=""){
			document.getElementById("home").querySelectorAll("strong")[0].innerHTML="HOME";
			if(window.location.hash.substr(1,window.location.hash.length).split("/").length==1){
				loadEvent(window.location.hash.substr(1,window.location.hash.length));
				return true;
			}else{
				if(window.location.hash.substr(1,window.location.hash.length).split("/")[1]=="board"){
					loadBoard(window.location.hash.substr(1,window.location.hash.length).split("/")[0]);
					return true;
				}
				if(load!=1){
					if(window.location.hash.substr(1,window.location.hash.length).split("/")[1]=="edit"){
						editEvent(window.location.hash.substr(1,window.location.hash.length).split("/")[0]);
					}else if(window.location.hash.substr(1,window.location.hash.length).split("/")[1]=="menu"){
						action("menu",1);
					}else if(window.location.hash.substr(1,window.location.hash.length).split("/")[1]=="home"){
						action("home",1);
					}else if(window.location.hash.substr(1,window.location.hash.length).split("/")[1]=="new"){
						action("add",1);
					}else if(window.location.hash.substr(1,window.location.hash.length).split("/")[1]=="cancelled"){
						loadEvents(3);
					}else if(window.location.hash.substr(1,window.location.hash.length).split("/")[1]=="completed"){
						loadEvents(2);
					}else if(window.location.hash.substr(1,window.location.hash.length).split("/")[1]=="skipped"){
						loadEvents(0);
					}else if(window.location.hash.substr(1,window.location.hash.length).split("/")[1]=="pending"){
						loadEvents(4);
					}else if(window.location.hash.substr(1,window.location.hash.length).split("/")[1]=="search"){
						var int=null;
						if(decodeURIComponent(window.location.hash.substr(1,window.location.hash.length).split("/")[2])=="cancelled"){
							int=3;
						}else if(decodeURIComponent(window.location.hash.substr(1,window.location.hash.length).split("/")[2])=="completed"){
							int=2;
						}else if(decodeURIComponent(window.location.hash.substr(1,window.location.hash.length).split("/")[2])=="skipped"){
							int=0;
						}else if(decodeURIComponent(window.location.hash.substr(1,window.location.hash.length).split("/")[2])=="pending"){
							int=4;
						}else if(decodeURIComponent(window.location.hash.substr(1,window.location.hash.length).split("/")[2])=="upcoming"){
							int=1;
						}else if(decodeURIComponent(window.location.hash.substr(1,window.location.hash.length).split("/")[2])=="events"){
							int=null;
						}
						loadEvents(int,decodeURIComponent(window.location.hash.substr(1,window.location.hash.length).split("/")[3]));
					}
				}
			}
		}
	}
	return false;
}

function loadBoard(id){
	loadEvent(id);
}

function offerNotifications(id){
	if(!iOS()){
		Notification.requestPermission().then(permission=>{
			if(permission==="granted"){
				navigator.serviceWorker.ready.then(function(reg){
					return reg.pushManager.subscribe({userVisibleOnly:true,
									  applicationServerKey:urlBase64ToUint8Array(
										  "BHEaekpS-pAfp4pYeqyJHw6cBmhlxx9bxBHjowhsx"+
										  "yDcuYR-ipUrWT9wAf_AP-q_mgGSwQryLaPMpyhcqByDyqo")
									 }).then(function(sub){
						sub=JSON.parse(JSON.stringify(sub));
						var subscr=sub;
						var key=sub.keys.auth;
						subscr.keys.auth=null;
						return firebase.database().ref("users/"+uid+"/subs/").update({[key]:subscr}).then(function(){
							if(id!=null){
								loadEvent(id);
							}
						});
					});
				});
			 }
		});
	}
}

function urlBase64ToUint8Array(base64String) {
	const padding = '='.repeat((4 - base64String.length % 4) % 4);
	const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
	const rawData = window.atob(base64);
	return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

function action(act,valid) {
	if(uid!=""){
		if (act == "menu") {
			if(valid==1){
				menu();
			}else{
				if(window.location.hash!="#/menu"){
					window.location.hash="";
					history.replaceState([],"","#/menu");
				}
			}	
		} else if (act == "add") {
			if(valid==1){
				start();
			}else{
				if(window.location.hash!="#/new"){
					window.location.hash="";
					history.replaceState([],"","#/new");
				}
			}	
		} else if (act == "home") {
			if(valid==1){
				loadEvents();
				document.getElementById("home").querySelectorAll("strong")[0].innerHTML="GATHERAPP";
			}else{
				if(window.location.hash!="#/home"){
					window.location.hash="";
					history.replaceState([],"","#/home");
				}else{
					loadEvents();
				}
			}	
		}
	}
}

function clear(e){
	document.querySelectorAll("."+(e||"body"))[0].innerHTML="";
} 

function reverse(snapshot) {
	let reversed = [];
	snapshot.forEach(child => {
		reversed.unshift(child);
	});
	return reversed;
}

function write(title,contents,links,href,classlist,overwrite,border){
	try{
		if(title==null&&contents==null){
			throw("");
		}
		var body='';
		contents=contents||[];
		links=links||[];
		if(href!=null){
			body+='<div class="card'+(classlist!=null?(" "+classlist):"")+'" onclick="'+href+'" style="'+
				(border!=null?("box-shadow: inset 0 0 0 5px "+encode(border)+";"):"")+'">';
		}else{
			body+='<div class="card'+(classlist!=null?(" "+classlist):"")+'" style="'+
				(border!=null?("box-shadow: inset 0 0 0 5px "+encode(border)+";"):"")+'">';
		}
		if((title==null&&contents!=null)){
		}else{
			body+='<span style="font-size:4.5vh;">';
			body+='<strong>';
			if(typeof title=="string"){
				body+=encode(title);
			}else if(typeof title=="object"){
				body+=encode(title.text||title.html);
			}
			body+='</strong>';
			body+='</span>';
			body+='<br />';
		}
		for(var i=0;i<contents.length;i++){
			if(contents[i].html!=null){
				body+=contents[i].html;
			}else if(contents[i].text!=null){
				body+='<span style="font-size:3.5vh">';
				body+=encode(contents[i].text);
				body+='</span>';
			}
			body+='<br />';
		}
		for(var i=0;i<links.length;i++){
			if((links[i].href!=null&&links[i].text!=null)||links[i].html!=null){
				if((links[i].href!=null&&links[i].text!=null)){
					body+='<span style="font-size:3.5vh">';
					body+='<a href="#" onclick="'+links[i].href+';return false;">';
					body+=encode(links[i].text);
					body+='</a>';
					body+='</span>';
				}else{
					body+=links[i].html;
				}
			}
			body+='<br />';
		}
		body+='</div>';
		if(overwrite!=null){
			document.querySelectorAll(overwrite)[0].outerHTML=body;
		}else{
			document.querySelectorAll('.body')[0].innerHTML=body+document.querySelectorAll('.body')[0].innerHTML;
		}
	}catch(TypeError){
		write('Error',[{text:'GatherApp encountered an error.'}]);
	}
}

function encode(e){
	var txt = document.createElement("textarea");
	txt.innerText = e;
	return linkify(txt.innerHTML);
}

function decode(html) {
	var txt = document.createElement("textarea");
	txt.innerHTML = html;
	return txt.value;
}

function getFormattedDate(date) {
	if(date!=null){
		date=new Date(date);
		var year = date.getFullYear();
		var month = (1 + date.getMonth()).toString();
		month = month.length > 1 ? month : '0' + month;
		var day = date.getDate().toString();
		day = day.length > 1 ? day : '0' + day;
		var hour="0".repeat(2-date.getHours().toString().length)+date.getHours();
		var min="0".repeat(2-date.getMinutes().toString().length)+date.getMinutes();
		return month + '/' + day + '/' + year + " ("+
			(["Sun","Mon","Tue","Wed","Thu","Fri","Sat"])[date.getDay()]+
			")"+
			", " + hour + ":" + min;
	}
	return "";
}
