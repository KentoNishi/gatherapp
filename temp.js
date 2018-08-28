firebase.database().ref("gatherups/-LKn7-fdh8rX_JRNO62C/board/info").push().update({

		content:"content",
		author:uid

});
clear();
firebase.database().ref("gatherups/-LKn7-fdh8rX_JRNO62C/board/info").once("value",posts=>{
	var contents=[];console.log(posts.val());
	posts.forEach(post=>{console.log(post.val());
		firebase.database().ref("users/"+post.val().author+"/info").once("value",author=>{
			contents.push({text:post.val().content});
			contents.push({text:author.val().name});
            if(post.key==Object.keys(posts.val())[0]){
                write("Event Board",contents);
            }else{
				contents.push({text:""});
            }
        });
    });
});

