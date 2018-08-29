var id="-LKoLrZPICPYH9hQQLlw";
firebase.database().ref("gatherups/"+id+"/board/").push().update({
	content:"content content content content content content content content ",
	author:uid
});
var onced=false;
firebase.database().ref("gatherups/"+id+"/board/").on("value",posts=>{
	if(!onced||(document.querySelectorAll(".board").length>0&&posts.val()[Object.keys(posts.val())[0]].content!=null&&posts.val()[Object.keys(posts.val())[0]].title!=null)){
		clear();
		var contents=[];
		reverse(posts).forEach(post=>{
			firebase.database().ref("users/"+post.val().author+"/info").once("value",author=>{
				contents.push("<div style='background-color:"+(post.val().author==uid?"cornflowerblue":"orange")+";border-radius:2vh;padding:1vh;margin:0;width:fit-content;'>"+encode(post.val().content)+"<div style='text-align:center;'>"+encode(author.val().name)+"</div></div>");
				if(post.key==Object.keys(posts.val())[Object.keys(posts.val()).length-1]){
					write("Event Board",[{html:"<div class='board' style='text-align:left;max-height:60vh;overflow-y:auto;min-width:75vw;background-color:white;'>"+contents.join("<br />")+"</div>"}]);
					document.querySelectorAll(".board")[0].scrollTop=document.querySelectorAll(".board")[0].scrollHeight;
				}else{
				}
			});
		});
	}
});
