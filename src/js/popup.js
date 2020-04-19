var saved_sessions = [];

function addTabtoList(name,link,i,new_session) { //Adds link to the list of tabs currently displayed
    var ul_id_tochange = "";
    if (new_session) { ul_id_tochange = 'openlist'}
    else{ ul_id_tochange = 'editlist'}
  var ul = document.getElementById(ul_id_tochange);
  var li = document.createElement("li");
  var div_wrapper = document.createElement("div");
  var display_name = name;
  var maxlen = 55;
  if (display_name.length > maxlen) {
      display_name = name.slice(0,27) + "\n " + name.slice(27);
      display_name = display_name.slice(0,maxlen)+"...";
  }
  li.className = "list-group-item"
  div_wrapper.className = "custom-control custom-checkbox";
  div_wrapper.innerHTML += '<input type="checkbox" class="custom-control-input opentabs" name ="'+name+'" link = "'+link+'" id="tab'+i.toString() +'" checked>';
    div_wrapper.innerHTML += '<label class="custom-control-label" for="tab'+i.toString() +'">'+display_name+'</label>';

  li.appendChild(div_wrapper);
  ul.appendChild(li);
}

function save_session(){ //Save new session from checked items
    var session_to_save = new Array();
    $("input[type='checkbox']:checked").each(function() {
        var url = this.getAttribute('link');
        var name = this.getAttribute('name');
        session_to_save.push({url:url,name:name});
    });
    var name = document.getElementById("session_name").value;
    var session = {name:name,session:session_to_save}
    if (!saved_sessions || saved_sessions.length === 0) {
        saved_sessions = [];
        saved_sessions.push(session);}
    else{ saved_sessions.push(session); }
    document.getElementById("session_name").value = "";
    alert("Session "+name + "has been saved");


    chrome.storage.local.set({'saved_tabs': saved_sessions}, function() {
        if(chrome.runtime.lastError)
        {
            update_list();
            alert(chrome.runtime.lastError.message);

        }
        else {
            update_list();
        }
    });


}
function open_session() {
    var tabs_to_open = new Array();
    $("input[type='checkbox']:checked").each(function() {
        var url = this.getAttribute('link');
        chrome.tabs.create({
            url: url,
            active: false
        });
        tabs_to_open.push(url);
    });

}
function delete_session() {
    if (!confirm("Are you sure you want to delete the session ?")){
        return ;
    }
    var session_id = document.getElementById('editlist').getAttribute('session_id');
    saved_sessions.splice(session_id,1);
    newindex = null;
    if (saved_sessions.length > session_id) newindex = session_id;
    else if (saved_sessions.length > 0) newindex = session_id-1;
    chrome.storage.local.set({'saved_tabs': saved_sessions}, function() {
        if(chrome.runtime.lastError)
        {
            update_list(newindex);
            alert(chrome.runtime.lastError.message);

        }
        else {
            update_list(newindex);
        }
    });


}
function update_list(sess_ind_toset_toactive) { //adds new session to the list of existing saved session
    document.getElementById("saved_sessions").innerHTML = "";
    if(saved_sessions) {


        saved_sessions.forEach(function (value, index, arr) {
            if (value == null) {
                return;
            }
            var div_el = document.createElement('div');
            if (sess_ind_toset_toactive === undefined || sess_ind_toset_toactive === null) {

                div_el.innerHTML = '<button type="button" class="list-group-item list-group-item-action saved_session" id=' + index + '>' + value.name + '</button>'
            } else {

                if (sess_ind_toset_toactive == index) {
                    div_el.innerHTML = '<button type="button" class="list-group-item list-group-item-action saved_session active" id=' + index + '>' + value.name + '</button>'
                } else {
                    div_el.innerHTML = '<button type="button" class="list-group-item list-group-item-action saved_session" id=' + index + '>' + value.name + '</button>'

                }
            }
            document.getElementById("saved_sessions").appendChild(div_el);


        })
    }
    if (!(sess_ind_toset_toactive === undefined || sess_ind_toset_toactive === null)){
        updatetab(sess_ind_toset_toactive);
    }
    else{
        if (sess_ind_toset_toactive === null) {
            open_edit_session_tab();

        }
    }
    $(".saved_session").click(function(){
        // Holds the product ID of the clicked element
        var session_id = $(this).attr('id');
        $('.saved_session.active').removeClass('active');
        $(this).addClass(' active');
        updatetab(session_id);
    });
}
function updatetab(index) { //updates the main frame with tabs of clicked session
    document.getElementById('editlist').innerHTML = ''; //Ul elements
    document.getElementById('openlist').innerHTML = '';
    document.getElementById('editlist').setAttribute('session_id',index);
    document.getElementById("desc_sess").innerHTML = "<p class=\"font-weight-bold\">Edit session : <span id=\"session_name_to_edt\">"+saved_sessions[index].name+"</span></p> <p>You can select tabs you want to open as new tabs</p>";

    var i = 0;

    tabs = saved_sessions[index].session;
    tabs.forEach(tb => {
        addTabtoList(tb.name,tb.url,i,false);
        i += 1;
    });
    document.getElementById('add_session').style.display = 'none'; //Column wrappers
    document.getElementById('edit_session').style.display = 'block';


}

function open_new_session_tab(){
    document.getElementById('add_session').style.display = 'block'; //Column wrappers
    document.getElementById('edit_session').style.display = 'none';
    document.getElementsByTagName("body")[0].style.width = "600px";
    $('#new-tab').addClass('active');
    $('#edit-tab').removeClass('active');


    $('.saved_session.active').removeClass('active');
    document.getElementById('editlist').innerHTML = ''; //Ul elements
    document.getElementById('openlist').innerHTML = '';
    chrome.tabs.query({}, function(tabs) {
        var i = 0;
        tabs.forEach(tb => {
            addTabtoList(tb.title,tb.url,i,true);
            i += 1;
        });
    } );
}
function open_edit_session_tab(){

    document.getElementById('editlist').innerHTML = ''; //Ul elements
    document.getElementById('openlist').innerHTML = '';
    document.getElementById('add_session').style.display = 'none'; //Column wrappers
    document.getElementById('edit_session').style.display = 'block';
    document.getElementsByTagName("body")[0].style.width = "600px";
    $('#edit-tab').addClass('active');
    $('#new-tab').removeClass('active');
    if (saved_sessions.length >0){
        document.getElementById("desc_sess").innerHTML = "Select a session from the list to see the tabs it contains and open them";
    }
    else {
        document.getElementById("desc_sess").innerHTML = "Create a new session in the New Session tab";

    }
}
document.addEventListener('DOMContentLoaded', function() {
    var link = document.getElementById('save_button');
    // onClick's logic below:
    link.addEventListener('click',save_session);

    chrome.storage.local.get(['saved_tabs'], function(result) {
        saved_sessions = result.saved_tabs ;
        if(saved_sessions === null) saved_sessions = [];
        update_list();
    });
    document.getElementById("open_button").addEventListener('click',open_session)
    document.getElementById("delete_session").addEventListener('click',delete_session)
    document.getElementById("new-tab").addEventListener('click',open_new_session_tab);
    document.getElementById("edit-tab").addEventListener('click',open_edit_session_tab);


});

chrome.tabs.query({}, function(tabs) {
    var i = 0;
 tabs.forEach(tb => {
            addTabtoList(tb.title,tb.url,i,true);
            i += 1;
        });
 } );
