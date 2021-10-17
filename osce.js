/*
osce.js is the core engine which recieve a
*/

var current_round = 0
var current_student = 0

//var examTree = {}

header_generator = function(fullTree){
  //create the header of exam sheets according to data from fullTree
  //fullTree = large object contains all data of the exam including date, round, student names, and the exam (now empty)
  log(fullTree)
  let d = document.createElement("span")
    d.id = "examiner"
    d.innerHTML = fullTree.examiner
    $("#header").appendChild(d)
  d = document.createElement("span")
    d.id = "exam_date"
    d.innerHTML = fullTree.exam_date
    $("#header").appendChild(d)
  $("#header").appendChild(document.createElement("br"))
  let b = []
  d = document.createElement("select")
  d.id = "round_selector"
  d.addEventListener("change",round_change)
    fullTree.round.forEach(R=>{
      let o = document.createElement("option")
      o.value = R.round_name
      o.innerHTML = R.round_name
      d.appendChild(o)
      b.push(document.createElement("select"))
      b[b.length-1].id = R.round_name
      b[b.length-1].className = "studentList"
      R.student.forEach(S=>{
        let f = document.createElement("option")
        f.value = S.student_name
        f.innerHTML = S.student_name
        b[b.length-1].appendChild(f)
      })
    })
    $("#header").appendChild(d)
    $("#header").appendChild(document.createElement("span")).id="round_status"
    b.forEach(B=>{$("#header").appendChild(B);B.classList.add("hidden");B.addEventListener("change",student_change)})
    $("#"+$("#round_selector").options[$("#round_selector").selectedIndex].value).classList.remove("hidden")
    $("#header").appendChild(document.createElement("span")).id="round_status"
    $("#header").appendChild(document.createElement("span")).id="student_status"
}

/*
the function is called after header_generator
recieving exam criterias from CSV format and the fullTree structure,
then add exam data to the fullTree,
then pass the objectified exam data to HTML generator() function
*/
exam_generator = function(examText,fullTree){
  //examText = large string from the CSV file
  //fullTree = large object contains all data of the exam including date, round, student names, and the exam (now empty)
  var tmpO = [] // main array to list all the data of exam, item by item is an object
  var score_list = []
  var criteria_list = []
  var overwrite_list = []
  var section_in = 1, item_in = 1, criteria_in=1
  try{var examArray = CSVToArray(examText)}catch(error){alert("RENDERING FAIL!");return;}
  log(examArray)
  // check array quality
  if(examArray[0]!=["type", "text", "core", "criteria", "overwrite"]){log("header looks strange, but may continue");}
  for(let i = 1;i<examArray.length;i++){
    //log(tmpO)
    let tmpI = {"type":examArray[i][0],"text":examArray[i][1]}
    if(tmpI.type=="section"){
      tmpI["id"]="section_" + section_in
      tmpO.push(tmpI)
      section_in++
    }
    else if(tmpI.type=="item"){
      tmpI["id"]="item_" + item_in
      score_list.push(tmpI.id)
      let score_set = examArray[i][2].split(" ")
      let score_count = examArray[i][3].split(" ")
      if(score_count.length > 1 & score_count.length != score_set.length){log(tmpI.text,"contains error score count");return;}
      tmpI["score"] = []
      tmpI["criteria"] = []
      let score_in = 1
      criteria_in = 1
      for(let j =0;j<score_set.length;j++){
        let tmpS = {
          "id":tmpI.id+"ZzZ"+"score_"+score_in,
          "value":score_set[j],
          "counter":score_count[j]?score_count[j]:0
        }
        tmpI.score.push(tmpS)
        score_in++
      }
      tmpI["overwrite"] = examArray[i][4]==1
      if(tmpI.overwrite)
        overwrite_list.push(tmpI.id+"ZzZoverwrite")

      tmpO.push(tmpI)
      item_in++
    }
    else if(tmpI.type=="sub"){
      tmpO[tmpO.length-1]["sub"] = tmpI.text
    }
    else if(tmpI.type=="criteria"){
      let tmpC = {
        "id":tmpO[tmpO.length-1].id+"ZzZ"+"criteria_"+criteria_in,
        "text":tmpI.text,
        "weight": examArray[i][2]
      }
      criteria_list.push(tmpC.id)
      tmpO[tmpO.length-1]["criteria"].push(tmpC)
      criteria_in++
    }
  }
  //reset full tree if this is new
  if(typeof test_name == 'undefined' || !localStorage[test_name])fullTree.round.forEach(R=>{
    R.student.forEach(S=>{
      score_list.forEach(scorelist=>{S[scorelist]=""})
      criteria_list.forEach(criterialist=>{S[criterialist]=""})
      overwrite_list.forEach(overwritelist=>{S[overwritelist]=false})
      S.comment = ""
      S.skip = false
    })
  })
  html_generator(tmpO)
}

/*
recieve array of object of the exams and render to HTML
*/
html_generator = function(tree){
  $('#platform').innerHTML = "" //clean the page
  tree.forEach(r=>{ // looping through each item to construct a page
    var x = document.createElement("div")
    x.className = r.type
    x.id = r.id
    if(r.type=="section"){
      x.innerText = r.text
    }
    else if(r.type=="item"){
      x.dataset.overwrite = r.overwrite
      let d = document.createElement("div")
      d.className = "rowFlex"
      d.appendChild(document.createElement("div")).className = "colFlex3"
        d.firstChild.appendChild(document.createElement("p")).innerHTML = r.text
        if(r.sub){
          let b = document.createElement("p")
          b.className = "sub"
          b.innerHTML = r.sub
          d.firstChild.appendChild(b)
        }
        if(r.criteria){
          r.criteria.forEach(cri=>{
            let b = document.createElement("input")
            b.type = "button"
            b.className = "criteria"
            b.id = cri.id
            b.value = cri.text
            b.dataset.weight = cri.weight
            b.addEventListener("click",criteriaClick)
            d.firstChild.appendChild(b)
          })
        }
      d.appendChild(document.createElement("div")).className = "colFlex1"
        if(r.overwrite){
          console.log(r.overwrite)
          let b = document.createElement("input")
          b.type = "number"
          b.className = "overwrite"
          b.id = r.id+"ZzZoverwrite"
          b.addEventListener("change",overwriteChange)
          d.lastChild.appendChild(b)
        }
        r.score.forEach(sco=>{
          let b = document.createElement("input")
          b.type="button"
          b.className = "score"
          b.id = sco.id
          b.value = sco.value
          b.dataset.counter = sco.counter
          b.addEventListener("click",scoreClick)
          d.lastChild.appendChild(b)
        })
        x.appendChild(d)
      }
    $('#platform').appendChild(x)
  })
  $('#platform').appendChild(document.createElement("textarea")).id="comment"
  $("#comment").addEventListener("change",comment)
  $("#comment").placeholder = "Comment about this student..."
  $(".overwrite").forEach(O=>{
    let item = O.id.split("ZzZ")[0]
    let max=-999
    let min=999
    O.parentElement.querySelectorAll(".score").forEach(S=>{
      max = +S.value > max? +S.value:max
      min = +S.value < min? +S.value:min
    })
    O.max = max
    O.min = min
  })
}

/* action of change the rotation (round) */
round_change = function(event){
  if(typeof data_upload !== 'undefined')data_upload([fullTree.round[current_round]],"backup")
  $(".studentList").forEach(S=>{S.classList.add("hidden")})
  current_round=$("#round_selector").selectedIndex
  $("#"+$("#round_selector").options[current_round].value).classList.remove("hidden")
  current_student = $("#"+$("#round_selector").options[current_round].value).selectedIndex
  __student_change()
}

/* action of change the student (round) */
student_change = function(event){
  if(typeof data_upload !== 'undefined')data_upload([fullTree.round[current_round]],"backup")
  current_student = event.target.selectedIndex
  __student_change()
}
/* internal function of student_change */
__student_change = function(){
  log(current_round+"::"+current_student)
  $(".checked").forEach(i=>{i.classList.remove("checked")})
  $(".borderHighlight").forEach(i=>{i.classList.remove("borderHighlight")})
  $(".overwrite").forEach(i=>{i.value=""})
  $(".item").forEach(i=>{
    i.querySelectorAll(".criteria").forEach(cri=>{
      if(fullTree.round[current_round].student[current_student][cri.id]==1)cri.click()
    })
    if(i.dataset.overwrite=="true" && fullTree.round[current_round].student[current_student][i.id+"ZzZoverwrite"]!=""){
      i.querySelectorAll(".overwrite")[0].value = fullTree.round[current_round].student[current_student][i.id]
      i.querySelectorAll(".overwrite")[0].classList.add("checked")
      i.classList.add("checked")
    }else if(fullTree.round[current_round].student[current_student][i.id]!==""){ // no overwriting
      log(i.id+"-"+fullTree.round[current_round].student[current_student][i.id])
      i.querySelectorAll(".score").forEach(S=>{
        if( +S.value ==fullTree.round[current_round].student[current_student][i.id])S.click()
      })
    }
  })
  $("#comment").value = fullTree.round[current_round].student[current_student].comment
  $("#student_status").className = $("#"+$("#round_selector").value).selectedOptions[0].className
  $("#skipper").checked = fullTree.round[current_round].student[current_student].skip
  skipper()
}

/* action of clicking on criteria --> update criteria data */
criteriaClick = function(event){
  log("click: "+event.target.id)
  let itemId = event.target.id.split("ZzZ")[0]
  if(event.target.classList.contains("checked")){
    event.target.classList.remove("checked")
    fullTree.round[current_round].student[current_student][event.target.id]=0
  }else{
    event.target.classList.add("checked");
    fullTree.round[current_round].student[current_student][event.target.id]=1
  }
  let counter = 0
  event.target.parentElement.querySelectorAll(".checked").forEach(N=>{
    counter += +N.dataset.weight
  })
  let foundmatch = false
  event.target.parentElement.nextElementSibling.querySelectorAll(".score").forEach(S=>{
    if(!foundmatch &&
      (
        ( +S.dataset.counter >=0 && +S.dataset.counter <= counter) ||
        ( +S.dataset.counter <0 && +S.dataset.counter >= counter)
      )){
      foundmatch = true
      S.classList.add("borderHighlight")
    }else{
      S.classList.remove("borderHighlight")
    }
  })
  register()
}

/* action of clicking on score --> update score data */
scoreClick = function(event){
  log("click: "+event.target.id)
  if(!event.target.classList.contains("checked") &&
  (event.target.parentElement.parentElement.parentElement.dataset.overwrite!="true" || event.target.parentElement.firstChild.value=="")){
    event.target.parentElement.querySelectorAll(".checked").forEach(K=>{
      K.classList.remove("checked")
    })
    event.target.classList.add("checked")
    event.target.parentElement.parentElement.parentElement.classList.add("checked")
    fullTree.round[current_round].student[current_student][event.target.id.split("ZzZ")[0]]= Number(event.target.value)?Number(event.target.value):event.target.value
    checkStudentCompleted()
  }
}

/* action of overwrite input --> update score data */
overwriteChange = function(event){
  log(event.target.id)
  if(event.target.value!="" && +event.target.value >= +event.target.min && +event.target.value <= +event.target.max){
    event.target.classList.add("checked")
    event.target.parentElement.querySelectorAll(".score").forEach(K=>{
      K.classList.remove("checked")
      fullTree.round[current_round].student[current_student][event.target.id.split("ZzZ")[0]]= Number(event.target.value)?Number(event.target.value):event.target.value
      fullTree.round[current_round].student[current_student][event.target.id]=true
      event.target.parentElement.parentElement.parentElement.classList.add("checked")
    })
  }else{
    event.target.value = ""
    event.target.parentElement.querySelectorAll(".checked").forEach(N=>{N.classList.remove("checked")})
    fullTree.round[current_round].student[current_student][event.target.id]=false
    fullTree.round[current_round].student[current_student][event.target.id.split("ZzZ")[0]]=""
    $("#"+event.target.id.split("ZzZ")[0]).classList.remove("checked")
  }
  checkStudentCompleted()
}

/* action of skip / unskip a student*/
skipper = function(){
  fullTree.round[current_round].student[current_student].skip = $("#skipper").checked
  if(fullTree.round[current_round].student[current_student].skip){
    $("#platform").hidden=true
    $("#"+$("#round_selector").value).selectedOptions[0].classList.add("skipped")
  }else{
    $("#platform").hidden=false
    $("#"+$("#round_selector").value).selectedOptions[0].classList.remove("skipped")
  }
  checkStudentCompleted()
}

checkStudentCompleted = function(){
  let already_completed = $("#"+$("#round_selector").value).selectedOptions[0].classList.includes("completed")
  $("#"+$("#round_selector").value).selectedOptions[0].classList.add("completed")
  $(".item").forEach(i=>{
    if(fullTree.round[current_round].student[current_student][i.id]===""){
      $("#"+$("#round_selector").value).selectedOptions[0].classList.remove("completed")
    }
  })
  $("#student_status").className = $("#"+$("#round_selector").value).selectedOptions[0].className
  if($("#"+$("#round_selector").value).options.length ==
  $("#"+$("#round_selector").value).querySelectorAll(".completed , .skipped").length){
    $("#"+$("#round_selector").value).classList.add("completed")
    if(!already_completed)data_upload([fullTree.round[current_round]],"backup")
  }else{$("#"+$("#round_selector").value).classList.remove("completed")}
  if(document.getElementById("finish"))if(__checkAllCompleted()){
    $("#finish").classList.remove("hidden")
  }else{
    $("#finish").classList.add("hidden")
  }
  $("#score").innerHTML = arrayToTable(display_realtime_score())
  register();
  [...$("#score").querySelectorAll("td")].forEach(cell=>{if(cell.innerText == "-")cell.style.backgroundColor="grey"})
}

__checkAllCompleted = function(){
  let result = true
  fullTree.round.forEach(R=>{
    R.student.forEach(S=>{
        //console.log(S.student_name)
        if(!S.skip)Object.keys(S).forEach(K=>{
            if(K.includes("item_")&&!K.includes("criteria")&&!K.includes("overwrite")&&S[K]===""){/*console.log(K);*/result = false}
        })
    })
  })
  return result
}

comment = function(event){
  fullTree.round[current_round].student[current_student].comment = event.target.value
}

font = function(n){
  let currentF = parseFloat(window.getComputedStyle($(":root")[0], null).getPropertyValue('font-size'))
  currentF += n*(0.2*currentF)
  log(currentF)
  $(":root")[0].style.fontSize = currentF + "px";
}

function display_realtime_score(){
  let score_array = [["student_name"]]
  Object.keys(fullTree.round[0].student[0]).forEach(K=>{
      if(K.includes("item_")&&!K.includes("criteria")&&!K.includes("overwrite"))score_array[0].push(K)
  })
  fullTree.round.forEach(R=>{
    R.student.forEach(S=>{
      score_array.push([])
      total = 0
      score_array[0].forEach(K=>{
        score_array[score_array.length-1].push(S[K])
        if(Number(S[K]))total+=Number(S[K])
      })
      score_array[score_array.length-1].push(total)
    })
  })
  score_array[0].push("total")
  return score_array
}
