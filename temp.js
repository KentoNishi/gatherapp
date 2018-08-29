firebase.database().ref("gatherups/-LKn7-fdh8rX_JRNO62C/board/info").push().update({

		content:"content content content content content content content content ",
		author:uid

});
clear();
firebase.database().ref("gatherups/-LKn7-fdh8rX_JRNO62C/board/info").once("value",posts=>{
	var contents=[];
	reverse(posts).forEach(post=>{
		firebase.database().ref("users/"+post.val().author+"/info").once("value",author=>{
			contents.push("<div style='background-color:orange;border-radius:2vh;padding:1vh;margin:0;width:fit-content;'>"+encode(post.val().content)+" -"+encode(author.val().name)+"</div>");
            if(post.key==Object.keys(posts.val())[Object.keys(posts.val()).length-1]){
                write("Event Board",[{html:"<div class='board' style='text-align:left;max-height:60vh;overflow-y:auto;min-width:75vw;background-color:white;'>"+contents.join("<br />")+"</div>"}]);
document.querySelectorAll(".board")[0].scrollTop=document.querySelectorAll(".board")[0].scrollHeight;
            }else{
            }
        });
    });
});
