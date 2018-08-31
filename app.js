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
var worker;
var back=["loadGatherUps();","loadGatherUps();"];

document.querySelectorAll(".metas")[0].innerHTML=('<meta name="viewport" content="width=device-width,height='+window.innerHeight+', initial-scale=1.0">');

function menu(){
	back.push("menu();");
	back=back.slice(back.length-2,back.length);
	clear();
	settings();
	write("Advertise",null,null,"advertise();");
	write("Event History",null,null,"history();");
//	
}

function advertise(){
	clear();
	write("Coming Soon!");
	write("Return to Menu",null,null,"menu();");
}

function history(){
	back.push("history();");
	back=back.slice(back.length-2,back.length);
	clear();
	firebase.database().ref("users/"+uid+"/gatherups").once("value",function(gathers){
		write("No Events",[{text:"You have no completed events."}]);
		var cleared=false;
		var writes=[];
		gathers.forEach(gather=>{
			firebase.database().ref("gatherups/"+gather.key+"/info").once("value",function(gatherup){
				if(gatherup.val().date!=null&&new Date(gatherup.val().date).getTime()+(gatherup.val().duration*60*1000)<new Date().getTime()){
					if(!cleared){
						clear();
						cleared=true;
					}
					var date="";
					if(gatherup.val().date!=null){
						date="0".repeat(2-(new Date(gatherup.val().date).getMonth()+1).toString().length)+(new Date(gatherup.val().date).getMonth()+1);
						date+="/"+"0".repeat(2-(new Date(gatherup.val().date).getDate()).toString().length)+(new Date(gatherup.val().date).getDate());
						date+="/"+new Date(gatherup.val().date).getFullYear();
						date+=", "+"0".repeat(2-(new Date(gatherup.val().date).getHours()).toString().length)+(new Date(gatherup.val().date).getHours());
						date+=":"+"0".repeat(2-(new Date(gatherup.val().date).getMinutes()).toString().length)+(new Date(gatherup.val().date).getMinutes());
					}
					var addr;
					if(gatherup.val().location!=null){
						addr=gatherup.val().location.name+","+gatherup.val().location.formatted_address.split(",").slice(1,gatherup.val().location.formatted_address.split(",").length).join(",");
					}
					var contents=[{text:(gatherup.val().date==null?"Unknown Date":date)},{text:addr!=null?addr.split(",").slice(0,addr.split(",").length-2).join(","):"Unknown Location"}];
					writes.push({title:gatherup.val().title,contents:contents,links:null,href:"loadGatherUp('"+gather.key+"');",date:new Date(gatherup.val().date).getTime()});
				}
				if(gather.key==Object.keys(gathers.val())[Object.keys(gathers.val()).length-1]){
					var pushes=writes.sort((a,b)=>{return a.date-b.date});
					pushes.forEach(push=>{
						write(push.title,push.contents,push.links,push.href);
					});
				}
				if(gather.key==Object.keys(gathers.val())[Object.keys(gathers.val()).length-1]){
					write("Return to Menu",null,null,"menu();");
				}
			});
		});
	});
}

function settings(){
	write(name,[{html:"<img src='"+pic+"' class='pic'></img>"},{text:"Standard User"}],[{href:"signOut();",text:"Sign Out"}]);
}

/*
function clearFeed(id){
	firebase.database().ref("users/"+uid+"/feed/"+id).remove().then(function(){
		feed();
	});
}
*/

function start(){
	if(back[back.length-1]!="start();"){
		back.push("start();");
		back=back.slice(back.length-2,back.length);
		requestGatherUp();
	}else{
	}
}

var map;
function requestGatherUp(id,title,loc,date,place,duration){
	clear();
	var contents=[];
	var extra="";
	contents.push({html:""+extra+"<div class='inputs'>"});
	contents.push({html:"<input placeholder='Title' onclick=''></input>"});
	contents.push({html:"<input placeholder='Address/Location' onfocus='this.setSelectionRange(0, this.value.length)'></input>"});
	//contents.push({html:"<input placeholder='GPS' disabled style='display:none;'></input>"});
	contents.push({html:"<input type='datetime-local'></input>"});
	contents.push({html:"<input style='width:10vh;text-align:center;' type='number' min='0' value='"+(duration!=null?Math.floor(duration/60):2)+"'></input>"+" hours <input style='width:10vh;text-align:center;' type='number' min='0' max='59' value='"+(duration!=null?(duration%60):0)+"'></input> minutes"});
	contents.push({html:"<div class='iframe' style='display:none;'><br /><iframe frameborder='0' style='border:0;width:75vw;height:75vw;' allowfullscreen></iframe></div></div>"});
	contents.push({html:"<button onclick='"+((id==null)?"newGatherUp();":"saveGatherUp("+'"'+id+'"'+");")+"'>"+(id!=null?"Save":"Schedule")+"</button>"});
	write(((id==null)?"New":"Edit")+" Event",contents,[{href:((id==null)?(back[back.length-2]+";"):("loadGatherUp('"+id+"');")),text:"Cancel"}]);
	autocomplete = new google.maps.places.Autocomplete((document.querySelectorAll(".inputs")[0].querySelectorAll("input")[1]),{ fields: ["name", "place_id", "formatted_address"] });
	google.maps.event.addListener(autocomplete, 'place_changed', function () {
		if(autocomplete.getPlace().formatted_address.split(",").length>3){
			document.querySelectorAll(".inputs")[0].querySelectorAll(".iframe")[0].style.display="block";
			document.querySelectorAll(".inputs")[0].querySelectorAll("iframe")[0].src="https://www.google.com/maps/embed/v1/place?q=place_id:"+autocomplete.getPlace().place_id+"&key=AIzaSyAiOBh4lWvseAsdgiTCld1WMXEMVo259hM";
		}else{
			document.querySelectorAll(".inputs")[0].querySelectorAll(".iframe")[0].style.display="none";
			document.querySelectorAll(".inputs")[0].querySelectorAll("input")[1].style.background="pink";
			document.querySelectorAll(".inputs")[0].querySelectorAll("input")[1].oninput=function(){
				document.querySelectorAll(".inputs")[0].querySelectorAll("input")[1].style.background="white";
				document.querySelectorAll(".inputs")[0].querySelectorAll("input")[1].oninput=null;
			};
		}
	});
	document.querySelectorAll(".inputs")[0].querySelectorAll("input")[0].value=title||null;
	document.querySelectorAll(".inputs")[0].querySelectorAll("input")[1].value=loc||null;
	if(date!=null){
		document.querySelectorAll(".inputs")[0].querySelectorAll("input")[2].value=new Date(new Date(date).getTime()-(new Date().getTimezoneOffset()*60*1000)).toISOString().split(".")[0].substr(0,16);;
	}
}

var autocomplete;
function editGatherUp(id){
	firebase.database().ref("gatherups/"+id+"/info").once("value",function(info){
		var addr;
		if(info.val().location!=null){
			addr=info.val().location.name+","+info.val().location.formatted_address.split(",").slice(1,info.val().location.formatted_address.split(",").length).join(",");
		}
		requestGatherUp(id,info.val().title,addr||null,info.val().date,info.val().place,info.val().duration);
	});
}

function saveGatherUp(id){
	newGatherUp(id);
}

function newGatherUp(id){
	var title=document.querySelectorAll(".inputs")[0].querySelectorAll("input")[0].value||null;
	var date=document.querySelectorAll(".inputs")[0].querySelectorAll("input")[2].value||null;
	var duration="120";
	if(parseInt(document.querySelectorAll(".inputs")[0].querySelectorAll("input")[3].value)>=0&&parseInt(document.querySelectorAll(".inputs")[0].querySelectorAll("input")[4].value)>=0&&parseInt(document.querySelectorAll(".inputs")[0].querySelectorAll("input")[4].value)<60){
		duration=(parseInt(document.querySelectorAll(".inputs")[0].querySelectorAll("input")[3].value)*60)+parseInt(document.querySelectorAll(".inputs")[0].querySelectorAll("input")[4].value);
	}
	if(date!=null){
		date=new Date(new Date(date).getTime()).getTime();
	}
	if(title!=null&&title!=""&&(autocomplete.getPlace()==null||autocomplete.getPlace().formatted_address.split(",").length>3)){
		var key=id||firebase.database().ref("gatherups/").push().key;
		var info={
			title:title,
			date:date,
			duration:duration,
			editor:uid
		}
		if(autocomplete.getPlace()!=null){
			var loc=JSON.parse(JSON.stringify(autocomplete.getPlace()));	
			info.location=loc;
		}
		firebase.database().ref("gatherups/"+key+"/info").update(info).then(function(){
			if(id==null){
				return firebase.database().ref("gatherups/"+key+"/members").update({[uid]:15}).then(function(){
					loadGatherUp(key);
				});
			}else{
				loadGatherUp(key);
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

function loadGatherUp(id,newuser,callback){
	back.push("loadGatherUp('"+id+"');");
	back=back.slice(back.length-2,back.length);
	clear();
	firebase.database().ref("gatherups/"+id+"/members/"+uid).once("value",function(me){
		firebase.database().ref("gatherups/"+id+"/info").once("value",function(gather){
			try{
				var member;
				if(me.val()!==0){
					member=me.val()||null;
				}else{
					member=me.val();
				}
				var link=[{text:"Leave Event",href:"if(confirm('Are you sure you want to leave this event?')){leaveGatherUp('"+id+"');}"}];
				if(member==null){
					link=[{text:"Join Event",href:"joinGatherUp('"+id+"');"}];
				}else{
					link.unshift({text:"Edit Info",href:"editGatherUp('"+id+"');"});
				}
				var value=member;
				var date="";
				if(gather.val().date!=null){
					date="0".repeat(2-(new Date(gather.val().date).getMonth()+1).toString().length)+(new Date(gather.val().date).getMonth()+1);
					date+="/"+"0".repeat(2-(new Date(gather.val().date).getDate()).toString().length)+(new Date(gather.val().date).getDate());
					date+="/"+new Date(gather.val().date).getFullYear();
					date+=", "+"0".repeat(2-(new Date(gather.val().date).getHours()).toString().length)+(new Date(gather.val().date).getHours());
					date+=":"+"0".repeat(2-(new Date(gather.val().date).getMinutes()).toString().length)+(new Date(gather.val().date).getMinutes());
				}
				var addr;
				if(gather.val().location!=null){
					addr=gather.val().location.name+","+gather.val().location.formatted_address.split(",").slice(1,gather.val().location.formatted_address.split(",").length).join(",");
				}
				var contents=[{text:date||"Unknown Date"},{text:addr!=null?addr.split(",").slice(0,addr.split(",").length-2).join(","):"Unknown Location"}];
				if(gather.val().location!=null){
					var body="";
					body+="<span style='font-size:4vh'>";
					body+="<a href='#' class='maptoggle hidden' onclick='showMap();return false;'>";
					body+=encode("View On Map");
					body+='</a>';
					body+='</span>';
					contents.push({html:body+"<span class='iframe' style='display:none;'><br /><iframe frameborder='0' style='border:0;width:75vw;height:75vw;' allowfullscreen src='"+"https://www.google.com/maps/embed/v1/place?q=place_id:"+gather.val().location.place_id+"&key=AIzaSyAiOBh4lWvseAsdgiTCld1WMXEMVo259hM"+"'></iframe></span>"});
				}
				contents.push({text:gather.val().duration!=null?(Math.floor(gather.val().duration/60)+"h"+(gather.val().duration%60)+"m Long"):"Unknown Duration"});
				var check="checked";
				if(value<0){
					value=(-value);
					check="";
				}
				var cb="<input type='checkbox' style='width:3vh;height:3vh;' "+check+" onclick='saveReminderTime(this.classList[0]);' class='"+id+"' />";
				var extra="";
				if(Notification.permission!="granted"&&Notification.permission!="denied"){
					extra="<br /><button onclick='offerNotifications("+'"'+id+'"'+");'>Enable Notifications</button>";
				}
				if(member!=null){
					var append="Remind me <input id='"+value+"' type='number' id='+value+' style='width:10vh;text-align:center;' value='"+value+"' step='5' min='1' class='"+id+"' onfocus='document.querySelectorAll("+'".okbutton"'+")[0].innerHTML="+'"✔️"'+";document.querySelectorAll("+'".nobutton"'+")[0].innerHTML="+'"❌"'+";'></input>";
					contents.push({html:cb+append+" <span class='okbutton' class='"+id+"' onclick='document.querySelectorAll("+'".okbutton"'+")[0].innerHTML=null;document.querySelectorAll("+'".nobutton"'+")[0].innerHTML=null;saveReminderTime(document.querySelectorAll("+'".'+id+'"'+")[0].classList[0]);'></span> <span class='nobutton' class='"+id+"' onclick='document.querySelectorAll("+'".okbutton"'+")[0].innerHTML=null;document.querySelectorAll("+'".nobutton"'+")[0].innerHTML=null;document.querySelectorAll("+'"input[type=number]"'+")[0].value=Math.abs(parseInt(document.querySelectorAll("+'"input[type=number]"'+")[0].id));'></span> minutes early"+extra});
				}
				if(new Date(gather.val().date).getTime()+(gather.val().duration*60*1000)<new Date().getTime()){
					contents.push({html:"<span style='color:green;font-size:4vh'>Completed Event</span>"});
				}else if(new Date(gather.val().date).getTime()<new Date().getTime()){
					contents.push({html:"<span style='color:red;font-size:4vh;'>Ongoing Event</span>"});
				}
				if(navigator.share&&member!=null){
					link.unshift({text:"Invite",href:"navigator.share({title: '"+gather.val().title+"'+' - GatherApp', text: 'Join '+'"+gather.val().title+"'+' on GatherApp!', url: 'https://kentonishi.github.io/gatherapp#"+id+"'})"});
				}
				if(member!=null){
					loadEventBoard(id,function(){
						write("Members",[{text:(gather.val().people!=null?(newuser!=true?gather.val().people:gather.val().people+1):1)+" members"}],null,"viewMembers('"+id+"');");
						write(gather.val().title,contents,link);
						if(callback!=null){
							callback();
						}
					});
				//	write("Event Board",null,null,"loadEventBoard('"+id+"');");
				}else{
					write("Members",[{text:(gather.val().people!=null?(newuser!=true?gather.val().people:gather.val().people+1):1)+" members"}],null,"viewMembers('"+id+"');");
					write(gather.val().title,contents,link);
					if(callback!=null){
						callback();
					}
				}
			}catch(TypeError){
				write("Error",[{text:"Error loading event."}]);
			}
		});
	});
}

function loadBoard(id){
	loadGatherUp(id,null,function(){document.querySelectorAll(".body")[0].scrollTop=document.querySelectorAll(".body")[0].scrollHeight+innerHeight;});
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
		firebase.database().ref("gatherups/"+id+"/board/").push().update({
			content:document.querySelectorAll("textarea")[0].value,
			author:uid,
			date:new Date().getTime()
		}).then(function(){
			document.querySelectorAll("textarea")[0].value=null;
		});
	}
}

function loadEventBoard(id,callback){
	var onced=false;
	firebase.database().ref("gatherups/"+id+"/board/").on("value",posts=>{
		var allclear=true;
		var u=0;
		posts.forEach(post=>{
			if(allclear==true){
				allclear=posts.val()[Object.keys(posts.val())[u]].content!=null&&posts.val()[Object.keys(posts.val())[u]].title!=null;
			}else{
			}
		});
		var exist=document.querySelectorAll(".board").length;
		if(!onced||(document.querySelectorAll(".board").length>0&&allclear)){
//			clear();
			var contents=["<div style='background-color:"+("yellowgreen")+";border-radius:2vh;padding:1vh;margin:0 auto;width:fit-content;'>"+encode("This event board has no posts.")+"<div style='text-align:center;'><strong>"+encode("GatherApp")+"</strong></div></div>"];
			if(posts.val()==null){
				if(document.querySelectorAll(".board").length>0){
					document.querySelectorAll(".board")[0].innerHTML="<br />"+contents.join("<br />")+"<br />";
				}else{
					write("Event Board",[{html:"<div class='board' style='text-align:center;height:50vh;overflow-y:auto;min-width:75vw;background-color:white;'><br />"+contents.join("<br />")+"<br /></div><textarea placeholder='Type A Message...' oninput='autogrow(this);' style='margin-top:2.5vh;margin-bottom:2.5vh;height:5vh;max-width:75vw;min-width:75vw;'></textarea><br /><button onclick='newBoardPost("+'"'+id+'"'+");' style='margin-bottom:1.5vh;'>Post To Board</button>"}]);
				}
				}else{
				contents=[];
			}
			var i=0;
			posts.forEach(post=>{
				var date="";
				date="0".repeat(2-(new Date(post.val().date).getMonth()+1).toString().length)+(new Date(post.val().date).getMonth()+1);
				date+="/"+"0".repeat(2-(new Date(post.val().date).getDate()).toString().length)+(new Date(post.val().date).getDate());
				date+="/"+new Date(post.val().date).getFullYear();
				date+=", "+"0".repeat(2-(new Date(post.val().date).getHours()).toString().length)+(new Date(post.val().date).getHours());
				date+=":"+"0".repeat(2-(new Date(post.val().date).getMinutes()).toString().length)+(new Date(post.val().date).getMinutes());
				contents.push("<div style='background-color:"+(post.val().author==uid?"cornflowerblue":"orange")+";border-radius:2vh;padding:1vh;margin:0 auto;width:fit-content;'>"+encode(post.val().content)+"<div class='"+post.key+"' style='text-align:center;'></div></div>");
				if(Object.keys(posts.val()).length-1==i){
					if(document.querySelectorAll(".board").length>0){
						document.querySelectorAll(".board")[0].innerHTML="<br />"+contents.join("<br />")+"<br />";
					}else{
						write("Event Board",[{html:"<div class='board' style='text-align:center;height:50vh;overflow-y:auto;min-width:75vw;background-color:white;'><br />"+contents.join("<br />")+"<br /></div><textarea placeholder='Type A Message...' oninput='autogrow(this);' style='margin-top:2.5vh;margin-bottom:2.5vh;height:5vh;max-width:75vw;min-width:75vw;'></textarea><br /><button onclick='newBoardPost("+'"'+id+'"'+");' style='margin-bottom:1.5vh;'>Post To Board</button>"}]);
					}
					document.querySelectorAll(".board")[0].scrollTop=document.querySelectorAll(".board")[0].scrollHeight*innerHeight;
				}else{
					i++;
				}
				firebase.database().ref("users/"+post.val().author+"/info").once("value",author=>{
					document.querySelectorAll("."+post.key)[0].innerHTML="<strong>"+encode(author.val().name)+"</strong><br />"+encode(date);;
					document.querySelectorAll(".board")[0].scrollTop=document.querySelectorAll(".board")[0].scrollHeight;
				});
			});
			if(exist==0&&callback!=null){
				callback();
			}
		}
	});
}

function autogrow(element) {
	element.style.height = "5px";
	element.style.height = (element.scrollHeight+5)+"px";
}

function viewMembers(id){
	firebase.database().ref("gatherups/"+id+"/members").once("value",function(members){
		clear();
		write("Members",[{html:"<span class='members'></span>"}],[{text:"Return To Event",href:"loadGatherUp('"+id+"');"}]);
		members.forEach(member=>{
			firebase.database().ref("users/"+member.key+"/info").once("value",function(user){
				document.querySelectorAll(".members")[0].innerHTML+=user.val().name;
				if(Object.keys(members.val())[Object.keys(members.val()).length-1]!=member.key){
					document.querySelectorAll(".members")[0].innerHTML+="<br />";
				}else{
				}
			});
		});
	});
}

function saveReminderTime(id){
	var value=parseInt(document.querySelectorAll('input[type="number"]')[0].value||0);
	if(value>0){
		if(!document.querySelectorAll('input[type="checkbox"]')[0].checked){
			value=(-value);
		}
		firebase.database().ref("gatherups/"+id+"/members").update({
			[uid]:value
		}).then(function(){
			document.querySelectorAll('input[type="number"]')[0].id=value;
		});
	}else{
		document.querySelectorAll("input[type=number]")[0].value=Math.abs(parseInt(document.querySelectorAll("input[type=number]")[0].id));
	}
}

function loadGatherUps(){
	back.push("loadGatherUps();");
	back=back.slice(back.length-2,back.length);
	clear();
	firebase.database().ref("users/"+uid+"/gatherups").once("value",function(gathers){
		write("No Events",[{text:"You can schedule a new event with the + icon at the top right."}]);
		var cleared=false;
		var writes=[];
		var comps=[];
		gathers.forEach(gather=>{
			firebase.database().ref("gatherups/"+gather.key+"/info").once("value",function(gatherup){
				if((gatherup.val().date!=null&&new Date(gatherup.val().date).getTime()+(gatherup.val().duration*60*1000)>new Date().getTime())||gatherup.val().date==null){
					if(!cleared){
						clear();
						cleared=true;
					}
					var date="";
					if(gatherup.val().date!=null){
						date="0".repeat(2-(new Date(gatherup.val().date).getMonth()+1).toString().length)+(new Date(gatherup.val().date).getMonth()+1);
						date+="/"+"0".repeat(2-(new Date(gatherup.val().date).getDate()).toString().length)+(new Date(gatherup.val().date).getDate());
						date+="/"+new Date(gatherup.val().date).getFullYear();
						date+=", "+"0".repeat(2-(new Date(gatherup.val().date).getHours()).toString().length)+(new Date(gatherup.val().date).getHours());
						date+=":"+"0".repeat(2-(new Date(gatherup.val().date).getMinutes()).toString().length)+(new Date(gatherup.val().date).getMinutes());
					}
					var addr;
					if(gatherup.val().location!=null){
						addr=gatherup.val().location.name+","+gatherup.val().location.formatted_address.split(",").slice(1,gatherup.val().location.formatted_address.split(",").length).join(",");
					}
					var contents=[{text:(gatherup.val().date==null?"Unknown Date":date)},{text:addr!=null?addr.split(",").slice(0,addr.split(",").length-2).join(","):"Unknown Location"}];
					contents.push({text:gatherup.val().duration!=null?(Math.floor(gatherup.val().duration/60)+"h"+(gatherup.val().duration%60)+"m Long"):"Unknown Duration"});
					if(gatherup.val().date!=null&&new Date(gatherup.val().date).getTime()<new Date().getTime()){
						contents.push({html:"<span style='color:red;font-size:4vh;'>Ongoing Event</span>"});
						comps.push({title:gatherup.val().title,contents:contents,links:null,href:"loadGatherUp('"+gather.key+"');",date:new Date(gatherup.val().date).getTime()});
					}else{
						writes.push({title:gatherup.val().title,contents:contents,links:null,href:"loadGatherUp('"+gather.key+"');",date:new Date(gatherup.val().date).getTime()});
					}
				}
				if(gather.key==Object.keys(gathers.val())[Object.keys(gathers.val()).length-1]){
					var pushes=writes.sort((a,b)=>{return (a.date-b.date)});
					pushes.forEach(push=>{
						write(push.title,push.contents,push.links,push.href);
					});
					var completes=comps.sort((a,b)=>{return (a.date-b.date)}).reverse();
					completes.forEach(push=>{
						write(push.title,push.contents,push.links,push.href);
					});
				}
			});
		});
	});
}

function joinGatherUp(id){
	firebase.database().ref("gatherups/"+id+"/members/").update({
		[uid]:15
	}).then(function(){
		loadGatherUp(id,true);
	});
}

function leaveGatherUp(id){
	firebase.database().ref("users/"+uid+"/gatherups/"+id).remove().then(function(){
		loadGatherUps();
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
			if(window.location.hash.substr(1,window.location.hash.length)!=""){
				if(window.location.hash.substr(1,window.location.hash.length)!=""){
					if(window.location.hash.substr(1,window.location.hash.length).split("/").length==1){
						loadGatherUp(window.location.hash.substr(1,window.location.hash.length));
					}else{
						if(window.location.hash.substr(1,window.location.hash.length).split("/")[1]=="board"){
							loadBoard(window.location.hash.substr(1,window.location.hash.length).split("/")[0]);
						}
					}
				}
			}else{
				loadGatherUps();
			}
		}
	});
}else{
	clear();
	write("No internet connection",[{text:"You are not connected."}],[{text:"Try Again",href:"location.reload();"}]);
}


$(window).on('hashchange', function() {
	if(uid!=null){
		if(window.location.hash.substr(1,window.location.hash.length)!=""){
			if(window.location.hash.substr(1,window.location.hash.length).split("/").length==1){
				loadGatherUp(window.location.hash.substr(1,window.location.hash.length));
			}else{
				if(window.location.hash.substr(1,window.location.hash.length).split("/")[1]=="board"){
					loadBoard(window.location.hash.substr(1,window.location.hash.length).split("/")[0]);
				}
			}
		}
	}
});

function offerNotifications(id){
	Notification.requestPermission().then(permission=>{
		if(permission==="granted"){
			navigator.serviceWorker.ready.then(function(reg){
				return reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:urlBase64ToUint8Array("BHEaekpS-pAfp4pYeqyJHw6cBmhlxx9bxBHjowhsxyDcuYR-ipUrWT9wAf_AP-q_mgGSwQryLaPMpyhcqByDyqo")}).then(function(sub){
					sub=JSON.parse(JSON.stringify(sub));
					var subscr=sub;
					var key=sub.keys.auth;
					subscr.keys.auth=null;
					return firebase.database().ref("users/"+uid+"/subs/").update({[key]:subscr}).then(function(){
						if(id!=null){
							loadGatherUp(id);
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

function action(act) {
	window.location.hash="";
	if(uid!=""){
		if (act == "menu") {
			menu();
		} else if (act == "add") {
			start();
		} else if (act == "home") {
			loadGatherUps();
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
		if(title==null&&contents==null){
			throw("");
		}
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
/*
window.onerror = function (message, file, line, col, error) {
	clear();
	write();
};*/
