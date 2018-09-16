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
var lat;
var lng;
var back={data:["loadEvents();","loadEvents();"]};
var ons=[];

document.addEventListener('backbutton', function(){
	write("You pressed the back button.",[{text:"Ignore this message and stop complaining *dad*"}]);
});

back.add=(function(param){
	back.data.push(param);
	back.data=back.data.slice(back.data.length-2,back.data.length);
	ons.forEach(listener=>{
		firebase.database().ref(listener).off("value");
	});
	ons=[];
});

document.querySelectorAll(".metas")[0].innerHTML=('<meta name="viewport" content="width=device-width,height='+window.innerHeight+', initial-scale=1.0">');

function menu(){
	back.add("menu();");
	clear();
	settings();
	write("Skipped Events",null,null,"loadEvents(0);");
	write("Cancelled Events",null,null,"loadEvents(3);");
	write("Event History",null,null,"loadEvents(2);");
}

function settings(){
	write(name,[{html:"<img style='width:30vw;height:30vw;' src='"+pic+"' class='pic'></img>"},{text:"Standard User"}],[{href:"signOut();",text:"Sign Out"}]);
}

function start(){
	if(back.data[back.data.length-1]!="start();"){
		back.add("start();");
		requestEvent();
	}else{
	}
}

function cancelEvent(id){
	if(confirm("Are you sure you want to cancel this event?")){
		firebase.database().ref("events/"+id+"/info").update({cancel:1}).then(function(){	
			loadEvent(id);
		});
	}
}

function reactivateEvent(id){
	if(confirm("Are you sure you want to reactivate this event?")){
		firebase.database().ref("events/"+id+"/info").update({cancel:null}).then(function(){	
			loadEvent(id);
		});
	}
}

var map;
function requestEvent(id,title,loc,date,place,duration,cancel){
	clear();
	var contents=[];
	var extra="";
	contents.push({html:""+extra+"<div class='inputs'><input placeholder='Title' onclick=''></input>"});
	contents.push({html:"<input placeholder='Address/Location' onfocus='this.setSelectionRange(0, this.value.length)'></input>"});
	contents.push({html:"<input type='datetime-local'></input>"});
	contents.push({html:"<input style='width:10vh;text-align:center;' type='number' min='0' "+
		       "value='"+(duration!=null?Math.floor(duration/60):2)+"'></input>"+
		       " hours <input style='width:10vh;text-align:center;' type='number' min='0' max='59' "+
		       "value='"+(duration!=null?(duration%60):0)+"'></input> minutes"});
	contents.push({html:"<div class='iframe' style='display:none;'><br />"+
		       "<iframe frameborder='0' style='border:0;width:75vw;height:75vw;' allowfullscreen></iframe>"+
		       "</div></span>"+
		       (id!=null?(cancel==null?("<a style='color:red;font-size:4vh;' onclick='cancelEvent("+'"'+id+'"'+");return false;'"+
		       " href='#'>CANCEL EVENT</a><br />"):("<a style='color:green;font-size:4vh;' onclick='reactivateEvent("+'"'+id+'"'+");return false;'"+
		       " href='#'>REACTIVATE EVENT</a><br />")):"")
		      });
	contents.push({html:"<button onclick='"+((id==null)?"newEvent();":"saveEvent("+'"'+id+'"'+");")+"'>"+
		       (id!=null?"Save":"Schedule")+"</button>"});
	write(((id==null)?"New":"Edit")+" Event",contents,
	      [{href:((id==null)?(back.data[back.data.length-2]+";"):("loadEvent('"+id+"');")),text:"Cancel"}]);
	document.querySelectorAll(".inputs")[0].querySelectorAll("input")[0].value=title||null;
	document.querySelectorAll(".inputs")[0].querySelectorAll("input")[1].value=loc||null;
	if(date!=null){
		document.querySelectorAll(".inputs")[0].querySelectorAll("input")[2].value=
			new Date(new Date(date).getTime()-
				 (new Date().getTimezoneOffset()*60*1000)).toISOString().split(".")[0].substr(0,16);
	}
	autocomplete = new google.maps.places.Autocomplete(
		(document.querySelectorAll(".inputs")[0].querySelectorAll("input")[1]),
		{ fields: ["name", "place_id", "formatted_address"] });
	google.maps.event.addListener(autocomplete, 'place_changed', function () {
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
	});
}

var autocomplete;
function editEvent(id){
	firebase.database().ref("events/"+id+"/info").once("value",function(info){
		var addr;
		if(info.val().location!=null){
			addr=info.val().location.name+","+
				info.val().location.formatted_address.split(",")
				.slice(1,info.val().location.formatted_address.split(",").length).join(",");
		}
		requestEvent(id,info.val().title,addr||null,info.val().date,info.val().place,info.val().duration,info.val().cancel);
	});
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
			date:date,
			duration:duration
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
	window.location.hash="";
	window.location.hash=id;
}

function loadEventPage(id){
	back.add("loadEvent('"+id+"');");
	firebase.database().ref("events/"+id+"/info").once("value",function(event){
		clear();
		firebase.database().ref("users/"+uid+"/events/"+id+"/board").remove();
		firebase.database().ref("users/"+uid+"/events/"+id+"/info").remove();
		firebase.database().ref("events/"+id+"/members/"+uid).once("value",function(me){
			try{
				var member=me.val()||null;
				var value=member;
				var link=[{text:"Skip Event",
					   href:"if(confirm('Are you sure you want to skip this event?')){"+
					   "leaveEvent('"+id+"');}"}];
				if(member==null){
					link=[{text:"Join Event",href:"joinEvent('"+id+"');"}];
				}else{
					link.unshift({text:"Edit Info",href:"editEvent('"+id+"');"});
					firebase.database().ref("users/"+uid+"/events/"+id+"/board").remove();
					firebase.database().ref("users/"+uid+"/events/"+id+"/info").remove();
				}
				var date="";
				if(event.val().date!=null){
					date=getFormattedDate(event.val().date);
				}
				var addr;
				if(event.val().location!=null){
					addr=event.val().location.name+","+
						event.val().location.formatted_address.split(",")
						.slice(1,event.val().location.formatted_address.split(",").length).join(",");
				}
				var contents=[{html:"<strong><span style='font-size:4vh;color:#2e73f7;'>"+encode(date||"Unknown Date")+"</span></strong>"},
					      {text:addr!=null?addr.split(",").slice(0,addr.split(",").length-2).join(","):"Unknown Location"}];
				if(event.val().location!=null){
					var body="";
					body+="<span style='font-size:4vh'>";
					body+="<a href='#' class='maptoggle hidden' onclick='showMap();return false;'>";
					body+=encode("View On Map");
					body+='</a>';
					body+='</span>';
					contents.push({html:body+"<span class='iframe' style='display:none;'><br />"+
						       "<iframe frameborder='0' style='border:0;width:75vw;height:75vw;' allowfullscreen src='"+
						       "https://www.google.com/maps/embed/v1/place?q=place_id:"+event.val().location.place_id+
						       "&key=AIzaSyAiOBh4lWvseAsdgiTCld1WMXEMVo259hM"+"'></iframe></span>"});
				}
				contents.push({text:event.val().duration!=null?
					       (Math.floor(event.val().duration/60)+"h"+(event.val().duration%60)+"m Long"):"Unknown Duration"});
				var check="checked";
				if(value<0){
					value=(-value);
					check="";
				}
				var cb="<span class='event"+id+"'></span><input type='checkbox' style='width:3vh;height:3vh;' "+check+
				    " onclick='saveReminderTime("+'"'+id+'"'+");' class='check"+id+"' />";
				var extra="";
				if(Notification.permission!="granted"&&Notification.permission!="denied"){
					extra="<br /><button onclick='offerNotifications("+'"'+id+'"'+");'>Enable Notifications</button>";
				}
				if(member!=null){
					var append="Remind me <input id='"+value+"' type='number' id='+value+' style='width:10vh;text-align:center;' value='"+value+
					    "' step='5' min='1' class='int"+id+"' onfocus='document.querySelectorAll("+'".okbutton"'+")[0].innerHTML="+'"✔️"'+
					    ";document.querySelectorAll("+'".nobutton"'+")[0].innerHTML="+'"❌"'+";'></input>";
					contents.push({html:cb+append+" <span class='okbutton' class='ok"+id+"' onclick='document.querySelectorAll("+'".okbutton"'+
						       ")[0].innerHTML=null;document.querySelectorAll("+'".nobutton"'+
						       ")[0].innerHTML=null;saveReminderTime("+'"'+id+'"'+
						       ");'></span> <span class='nobutton' class='no"+id+"' onclick='document.querySelectorAll("+
						       '".okbutton"'+")[0].innerHTML=null;document.querySelectorAll("+'".nobutton"'+
						       ")[0].innerHTML=null;document.querySelectorAll("+'"input[type=number]"'+
						       ")[0].value=Math.abs(parseInt(document.querySelectorAll("+'"input[type=number]"'+
						       ")[0].id));'></span> minutes early"+extra});
				}
				if(event.val().cancel!=null){
					contents.push({html:"<span style='color:red;font-size:4vh;'>Cancelled Event</span>"});
				}
				else if(event.val().date!=null){
					if(new Date(event.val().date).getTime()+(event.val().duration*60*1000)<new Date().getTime()){
						contents.push({html:"<span style='color:green;font-size:4vh'>Completed Event</span>"});
					}else if(new Date(event.val().date).getTime()<new Date().getTime()){
						contents.push({html:"<span style='color:red;font-size:4vh;'>Ongoing Event</span>"});
					}
				}
				if(navigator.share&&member!=null){
					link.unshift({text:"Invite",href:"navigator.share({title: decodeURIComponent('"+
						      encodeURIComponent(event.val().title)+"')+' - GatherApp', text: 'Join '+decodeURIComponent('"+
						      encodeURIComponent(event.val().title)+"')+' on GatherApp!',"+
						      " url: 'https://kentonishi.github.io/gatherapp#"+id+"'})"});
				}
				loadEventBoard({id:id,member:member});
				var links=[];
				if(!(event.val().people<6)){
					links=[{text:"View Members",href:"viewMembers('"+id+"');"}];
				}
				write("Members",[{html:"<span class='members'></span>"}],null,links);
				if(event.val().people<6){
					viewMembers(id);
				}else{
					document.querySelectorAll(".members")[0].innerHTML=encode(event.val().people+" People");
				}
				write(event.val().title,contents,link);
			}catch(TypeError){
				write("Error",[{text:"Error loading event."}]);
			}
		});
	});
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
	if(document.querySelectorAll("textarea")[0].value!=null&&document.querySelectorAll("textarea")[0].value.replace(/ /g,"").length>0){
		firebase.database().ref("events/"+id+"/board/").push().update({
			content:document.querySelectorAll("textarea")[0].value,
			author:uid,
			date:new Date().getTime()
		}).then(function(){
			document.querySelectorAll("textarea")[0].value=null;
			autogrow(document.querySelectorAll("textarea")[0]);
		});
	}
}

function loadEventBoard(parameters){
	var id=parameters.id;
	var member=parameters.member;
	ons.push("events/"+id+"/board");
	if(document.querySelectorAll(".board"+id).length<1){
		write("Event Board",[{html:"<div class='board"+id+
			"' style='text-align:center;height:50vh;overflow-y:auto;min-width:75vw;background-color:white;'>"+
			(member?("</div><textarea placeholder='Type A Message...' oninput='autogrow(this);' "+
			"style='overflow-y:auto;resize:none;margin-top:2.5vh;margin-bottom:2.5vh;height:5vh;max-width:75vw;"+
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
			document.querySelectorAll(".board"+id)[0].innerHTML="";
			var writes=[];
			function addPost(object){
				writes.push("<div style='background-color:"+
				(object.admin?"yellowgreen":(object.author==uid?"cornflowerblue":"orange"))+
				";border-radius:2vh;padding:1vh;margin:0 auto;width:fit-content;'>"+
				encode(object.text)+
				"<div "+(object.admin?"":("class='"+object.key+"' "))+"style='text-align:center;'>"+
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
	document.querySelectorAll(".boardcontainer")[0].scrollIntoView(false);
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
		document.querySelectorAll("input[type=checkbox]")[0].value=Math.abs(parseInt(document.querySelectorAll("input[type=checkbox]")[0].id));
	}
}

function loadEvents(inhistory){
	back.add("loadEvents("+(inhistory!=null?inhistory:"")+");");
	clear();
	var writes=[];
	firebase.database().ref("users/"+uid+"/events").orderByChild("status").equalTo(inhistory!=null?inhistory:1).once("value",events=>{
		if(events.val()==null){
			write("No Events",[{text:"You have no "+(inhistory!=null?(inhistory==2?"completed":(inhistory==0?"skipped":"cancelled")):"upcoming")+" events."}]);
		}else{
			function addPost(param){
				writes.push(param);
//				console.log(writes);
				if(writes.length==Object.keys(events.val()).length){
					var ongoing=[];
					var future=[];
					var unknown=[];
					writes.forEach(item=>{
						if(item.date!=null&&new Date(item.date).getTime()+item.duration*60*1000>new Date().getTime()){
							if(new Date(item.date).getTime()>new Date().getTime()){
								if(item.date==null){
									unknown.push(item);
								}else{
									future.push(item);
								}
							}else{
								if(item.date==null){
									unknown.push(item);
								}else{
									ongoing.push(item);
								}
							}
						}else{
							if(item.date==null){
								unknown.push(item);
							}else{
								future.push(item);
							}
						}
					});
					ongoing=ongoing.sort((a,b)=>{return a.date-b.date;});
					if(inhistory!=null){
						future=future.concat(ongoing);
						ongoing=[];
					}
					future=future.sort((a,b)=>{return a.date-b.date;});
					if(inhistory==null){
						future=future.reverse();
					}
					unknown.forEach(item=>{
						var address="";
						if(item.location!=null){
							address=item.location.name+", "+item.location.formatted_address.split(",").slice(1,item.location.formatted_address.split(",").length).join(", ");
						}
						var duration=item.duration!=null?(Math.floor(item.duration/60)+"h"+(item.duration%60)+"m Long"):"Unknown Duration";
						var contents=[{html:"<strong><span style='font-size:4vh;color:#2e73f7;'>"+encode(item.date!=null?getFormattedDate(item.date):"Unknown Date")+"</span></strong>"},{text:address||"Unknown Location"}];//,{text:duration}];
						if(item.cancel!=null){
							contents.push({html:"<span style='color:red;font-size:4vh;'>Cancelled Event</span>"});
						}
						else if(item.date!=null&&item.date!=undefined){
							if(new Date(item.date).getTime()+(item.duration*60*1000)<new Date().getTime()){
								contents.push({html:"<span style='color:green;font-size:4vh'>Completed Event</span>"});
							}else if(new Date(item.date).getTime()<new Date().getTime()){
								contents.push({html:"<span style='color:red;font-size:4vh;'>Ongoing Event</span>"});
							}
						}
						write(item.title,contents,null,"loadEvent('"+item.href+"');");
					});
					future.forEach(item=>{
						var address="";
						if(item.location!=null){
							address=item.location.name+", "+item.location.formatted_address.split(",").slice(1,item.location.formatted_address.split(",").length).join(", ");
						}
						var duration=item.duration!=null?(Math.floor(item.duration/60)+"h"+(item.duration%60)+"m Long"):"Unknown Duration";
						var contents=[{html:"<strong><span style='font-size:4vh;color:#2e73f7;'>"+encode(item.date!=Infinity?getFormattedDate(item.date):"Unknown Date")+"</span></strong>"},{text:address||"Unknown Location"}];//,{text:duration}];
						if(item.cancel!=null){
							contents.push({html:"<span style='color:red;font-size:4vh;'>Cancelled Event</span>"});
						}
						else if(item.date!=null&&item.date!=undefined){
							if(new Date(item.date).getTime()+(item.duration*60*1000)<new Date().getTime()){
								contents.push({html:"<span style='color:green;font-size:4vh'>Completed Event</span>"});
							}else if(new Date(item.date).getTime()<new Date().getTime()){
								contents.push({html:"<span style='color:red;font-size:4vh;'>Ongoing Event</span>"});
							}
						}
						write(item.title,contents,null,"loadEvent('"+item.href+"');");
					});
					ongoing.reverse().forEach(item=>{
						var address="";
						if(item.location!=null){
							address=item.location.name+", "+item.location.formatted_address.split(",").slice(1,item.location.formatted_address.split(",").length).join(", ");
						}
						var duration=item.duration!=null?(Math.floor(item.duration/60)+"h"+(item.duration%60)+"m Long"):"Unknown Duration";
						var contents=[{html:"<strong><span style='font-size:4vh;color:#2e73f7;'>"+encode(item.date!=Infinity?getFormattedDate(item.date):"Unknown Date")+"</span></strong>"},{text:address||"Unknown Location"}];//,{text:duration}];
						if(item.cancel!=null){
							contents.push({html:"<span style='color:red;font-size:4vh;'>Cancelled Event</span>"});
						}
						else if(item.date!=null&&item.date!=undefined){
							if(new Date(item.date).getTime()+(item.duration*60*1000)<new Date().getTime()){
								contents.push({html:"<span style='color:green;font-size:4vh'>Completed Event</span>"});
							}else if(new Date(item.date).getTime()<new Date().getTime()){
								contents.push({html:"<span style='color:red;font-size:4vh;'>Ongoing Event</span>"});
							}
						}
						write(item.title,contents,null,"loadEvent('"+item.href+"');");
					});
				}
			}
			events.forEach(event=>{
				firebase.database().ref("events/"+event.key+"/info").once("value",function(info){
					var obj=info.val();
					obj.href=event.key;
					addPost(obj);
				});
			});
		}
	});
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
		return a.date-b.date;
	}).reverse();
}

function joinEvent(id){
	firebase.database().ref("events/"+id+"/members/").update({
		[uid]:15
	}).then(function(){
		loadEvent(id);
	});
}

function leaveEvent(id){
	firebase.database().ref("users/"+uid+"/events/"+id).update({status:0}).then(function(){
		loadEvents();
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
			if(Notification.permission=="granted"){
				offerNotifications();
			}
			uid = me.uid;
			name = me.displayName;
			pic = me.photoURL;
			me.getIdToken().then(function(userToken) {
			});
			firebase.database().ref("users/"+uid+"/info").update({
				name:name,
				pic:pic
			});
			if(!hashChanged()){
				action("home");
			}
		}
	});
}else{
	clear();
	write("No internet connection",[{text:"You are not connected."}],[{text:"Try Again",href:"location.reload();"}]);
}

window.onhashchange= (function() {
	hashChanged();
});

function hashChanged(){
	if(uid!=null&&uid!=""){
		if(window.location.hash.substr(1,window.location.hash.length)!=""){
			document.getElementById("home").querySelectorAll("strong")[0].innerHTML="HOME";
			console.log(window.location.hash.substr(1,window.location.hash.length).split("/"));
			if(window.location.hash.substr(1,window.location.hash.length).split("/").length==1){
				loadEventPage(window.location.hash.substr(1,window.location.hash.length));
				return true;
			}else{
				if(window.location.hash.substr(1,window.location.hash.length).split("/")[1]=="board"){
					loadBoard(window.location.hash.substr(1,window.location.hash.length).split("/")[0]);
					return true;
				}else if(window.location.hash.substr(1,window.location.hash.length).split("/")[1]=="menu"){
					action("menu",1);
				}else if(window.location.hash.substr(1,window.location.hash.length).split("/")[1]=="home"){
					action("home",1);
				}else if(window.location.hash.substr(1,window.location.hash.length).split("/")[1]=="new"){
					action("add",1);
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
				window.location.hash="/menu";
			}	
		} else if (act == "add") {
			if(valid==1){
				start();
			}else{
				window.location.hash="/new";
			}	
		} else if (act == "home") {
			if(valid==1){
				loadEvents();
				document.getElementById("home").querySelectorAll("strong")[0].innerHTML="GATHERAPP";
			}else{
				window.location.hash="/home";
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

function write(title,contents,links,href,classlist){
	try{
		if(title==null&&contents==null){
			throw("");
		}
		var body='';
		contents=contents||[];
		links=links||[];
		if(href!=null){
			body+='<div class="card'+(classlist!=null?(" "+classlist):"")+'" onclick="'+href+'">';
		}else{
			body+='<div class="card'+(classlist!=null?(" "+classlist):"")+'">';
		}
		if((title==null&&contents!=null)){
		}else{
			body+='<span style="font-size:5.5vh;">';
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
	var txt = document.createElement("textarea");
	txt.innerText = e;
	return txt.innerHTML;
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
	var hour="0".repeat(2-date.getHours().toString().length)+date.getHours();
	var min="0".repeat(2-date.getMinutes().toString().length)+date.getMinutes();
	return month + '/' + day + '/' + year + ", " + hour + ":" + min;
}
