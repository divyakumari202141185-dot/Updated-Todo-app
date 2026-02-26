// load tasks from localStorage or start with empty array if none saved
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
// this tracks which tasks to show
let filter = "all";

// run automatically when page opens
window.onload=function(){
    if(localStorage.getItem("mode")==="dark"){
        document.body.classList.add("dark");
        document.getElementById("modeBtn").textContent="Light";
    }
    // make all button look selected
    setActive("all");  
    // show task on screen
    displayTasks();
};

// converts date text 'dd-mm-yyyy' into a real date which computer stands
function parseDate(str){
    // no date? stop here
    if(!str) return null;
    // break "25-03-2024" into [25,03,2024]
    let p=str.split("-");
    // wrong format? stop here
    if(p.length!==3) return null;
    // make a real date (month starts at 0)
    return new Date(p[2],p[1]-1,p[0]);
}

// when calendar buttonis clicked, open date picker
document.getElementById("calendarBtn").onclick=function(){
    // open calendar
    document.getElementById("realDate").showPicker();
};

// when user picks a date from calendar,put it in the textbox
document.getElementById("realDate").addEventListener("change",function(){
    let d=new Date(this.value);
    // make sure 2 digit day
    let day=String(d.getDate()).padStart(2,'0');
    // +1 because month starts at 0
    let month=String(d.getMonth()+1).padStart(2,'0');
    let year=d.getFullYear();
    // put the date in dd-mm-yyyy format into the visible input box
    document.getElementById("dateInput").value=day+"-"+month+"-"+year;
});

// add new task when user clicks add button
function addTask(){
    // get what user typed for task
    let text=taskInput.value.trim();
    // get what user typed for date
    let date=dateInput.value.trim();

    // if task is empty, do nothing
    if(text==="") return;
    // if date is typed but wrong format then warn the user
    if(date && !parseDate(date)){alert("Use dd-mm-yyyy");return;}

    // add new task to the list(done:false means not completed yet)
    tasks.push({text,date,done:false});
    // save to browser
    save();
    // refresh to screen
    displayTasks();

    // clear input box after adding
    taskInput.value="";
    dateInput.value="";
}

// figure out if a task is high,medium,low priority based on due date
function getPriority(dateStr,done){
    let due=parseDate(dateStr);
    // no date means no priority
    if(!due) return null;

    let today=new Date();
    // set time to midnight for fair comparison
    today.setHours(0,0,0,0);
    let diff=(due-today)/(1000*60*60*24);

    // already overdue = high
    if(diff<0 && !done) return "high";
    // due today or tomorrow = high
    if(diff<=1) return "high";
    // due in 2-3 days = medium
    if(diff<=3) return "medium";
    // due later = low
    return "low";
}

// show all tasks on the screen
function displayTasks(){
    let list=document.getElementById("taskList");
    // clear old tasks before showing fresh ones
    list.innerHTML="";

    tasks.forEach((t,i)=>{
        // skip tasks that don't match what filter is selected
        if(filter==="pending" && t.done) return;
        if(filter==="completed" && !t.done) return;

        // create the task box (li = one task row)
        let li=document.createElement("li");

        // left side holds taskname,date,priority
        let left=document.createElement("div");
        left.className="leftPart";

        // row holds checkbox and taskname together
        let row=document.createElement("div");
        row.className="taskRow";

        // checkbox so user can tick tasks as done
        let check=document.createElement("input");
        check.type="checkbox";
        // already ticked if task is done
        check.checked=t.done;
        // when ticked/unticked,save the change and refresh screen
        check.onchange=function(){t.done=this.checked;save();displayTasks();};

        // task name text
        let name=document.createElement("span");
        name.textContent=t.text;
        // strike through if done
        if(t.done) name.classList.add("completed");

        // put checkbox,name into row, and row into left side
        row.appendChild(check);
        row.appendChild(name);
        left.appendChild(row);

        // if task has a date, show it
        if(t.date){
            let d=document.createElement("div");
            d.className="date";
            // show due date below task name
            d.textContent="Due: "+t.date;
            left.appendChild(d);

            // show high,medium,low based on due date
            let pr=getPriority(t.date,t.done);
            if(pr){
                let tag=document.createElement("span");
                // color depends on priority
                tag.className="priority "+pr;
                // show high,low,medium in uppercase
                tag.textContent=pr.toUpperCase();
                left.appendChild(tag);
            }
        }

        // right side: edit/delete buttons
        let actions=document.createElement("div");
        actions.className="actions";

        // edit button: let user change the task text
        let edit=document.createElement("button");
        edit.textContent="Edit";
        edit.onclick=function(){
            let input=document.createElement("input");
            // show current text in input box
            input.value=t.text;
            input.className="editInput";
            // replace text with input box
            row.replaceChild(input,name);
            // auto-click into the input box
            input.focus();
            // when user clicks away , save the new text
            input.onblur=function(){t.text=input.value||t.text;save();displayTasks();};
        };

        // delete button: removes the task completely
        let del=document.createElement("button");
        del.textContent="Delete";
        del.className="delete";
        // remove task from list,save and refresh screen
        del.onclick=function(){tasks.splice(i,1);save();displayTasks();};

        // add edit/delete to the action section
        actions.appendChild(edit);
        actions.appendChild(del);

        // put everything together into one task row
        li.appendChild(left);
        li.appendChild(actions);
        // add the task row to the screen
        list.appendChild(li);
    });
}

// changes which tasks are shown - all/pending/completed
function filterTasks(type){
    // update the filter
    filter=type;
    // highlight clicked button
    setActive(type);
    // refresh the screen
    displayTasks();
}

// highlights the selected filter button and unhighlight the rest
function setActive(type){
    // remove highlight for all filter buttons
    document.querySelectorAll(".filterSection button").forEach(b=>b.classList.remove("active"));
    // add highlight only to the selected button
    document.getElementById("f-"+type).classList.add("active");
}

// switches dark and light mode
function toggleMode(){
    // turn dark class on or off
    document.body.classList.toggle("dark");
    // remember the mode so it stays after page refresh
    localStorage.setItem("mode",document.body.classList.contains("dark")?"dark":"light");
    // change button text to show opposite mode
    document.getElementById("modeBtn").textContent=document.body.classList.contains("dark")?"Light":"Dark";
}

// save all tasks to browser memory so they don't disappear on refresh
function save(){
    localStorage.setItem("tasks",JSON.stringify(tasks));
}