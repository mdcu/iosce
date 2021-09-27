

function activator(){
  if(localStorage[test_name]){
    console.log("continue where we left off")
    fullTree = retrieve();
    header_generator(fullTree)
    exam_generator(fullTree.examText,fullTree)
    __student_change()
    checkStudentCompleted()
    document.body.appendChild(document.createElement("button")).addEventListener("click",location.reload)
  }else{
    let decoded = ""
    do{
      let password = prompt("insert the key here")
      try{decoded = CryptoJS.AES.decrypt(encoded,password).toString(CryptoJS.enc.Utf8)}catch(error){alert("Unable to decoded! recheck your passcode!")}
    }while(decoded == "")
    fullTree.examText = decoded
    header_generator(fullTree)
    exam_generator(decoded,fullTree)
    register()
  }
}

function register(){
  localStorage[test_name] = JSON.stringify(fullTree)
  console.log("backup in local environment...")
}
function retrieve(){
  return JSON.parse(localStorage[test_name])
}

function data_formation(data_tree,tag){
  return {
    "tag":tag,
    "test_name":test_name,
    "examiner":fullTree.examiner,
    "score":JSON.stringify(data_tree)
  }
}

function data_upload(data_tree_array,tag="default",url=form_url){
  register()
  if($("#_network_status").length==0){
    let SPAN = document.body.appendChild(document.createElement("span"))
    SPAN.id = "_network_status"
    SPAN.addEventListener("click",()=>{
      let hidden = prompt("If you don't know what you are doing, just cancel.")
      if(hidden == "Reb0rn!")apocalypse()
      if(hidden == "God--Speed")finish()
    })
  }
  if(!window.navigator.onLine){
    $("#_network_status").className = "offline"
    return 0
  }
  $("#_network_status").className = "online"
  data_tree_array.forEach(data_tree=>{
    let data = data_formation(data_tree,tag)
    fetch(url,{ // the form URL
      method: "POST",
      mode: "no-cors",
      header:{'Content-Type': 'application/json'},
      body: genData(data)
    })
  /*.then(response=>{
    promise_response = response;
    console.log(response.status)
    if(response.status >= 200 && response.status <300){
      return Promise.resolve(response)
    }else{
      return Promise.reject(new Error(response.statusText))
    }
  })// apparently not work with opaque response  */
    .then(response=>{
      console.log(response);
    }).catch(err=>alert(err));
  })
}

function genData(data){ // make full form submission ready
    let dataToPost = new FormData(); //formdata API
    //fill name attributes to corresponding values
    dataToPost.append("entry.390100684",data.tag); //VAR0 should be the protocol name
    dataToPost.append("entry.1974440254",data.test_name); //VAR1 should be the secret code
    dataToPost.append("entry.2025319574",data.examiner); //VAR2 usually identification
    dataToPost.append("entry.1358658374",data.score); //VAR3 usually identification
    //dataToPost.append("entry.1912866854",X_date); //VAR4 usually identification
    //dataToPost.append("entry.1003827330",JSON.stringify(complete)); //VAR5 DATA
    //dataToPost.append("entry.285724580",""); //VAR6
    //dataToPost.append("entry.582704786",""); //VAR7
    //dataToPost.append("entry.982293454",""); //VAR8
    //dataToPost.append("entry.413164870",""); //VAR9

    return(dataToPost)
  }

function finish(){
  let pname = prompt("Are you going to submit the result? If so, please enter your name:")
  if(pname != ""){
    fullTree.examiner = pname
    data_upload(fullTree.round,"COMPLETED")
    alert("finish, you may close the program")
  }
}

function apocalypse(){
  localStorage.removeItem(test_name)
  location.reload()
}
