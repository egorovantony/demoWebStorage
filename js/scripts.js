
// my
// Constants
var contactTypes = ["phone", "e-mail", "skype", "facebook", "vk"];
var siteRoot = "webstorage";
var allowPath = ["login", "registration", "person_create", "person_edit", "person_list", "contact_create", "404"]

// Global variables
var user;
function CustPath(){
    this.name = "";
    this.arr = [];
}
var custPath = new CustPath();

$(document).ready(function() {

    initUser();
    initCustPath();
    if(!checkUrl()){
        redirectErrorPage();
        return;
    }
    initContent();
    setTimeout(setHandlerEvents, 300);
    dbInit();

});

function checkUrl(){
    if(custPath.name == ''){
        return true;
    }
    if(allowPath.indexOf(custPath.name) < 0){
        return false;
    }
    return true;
}

/*--- Initialization ---*/

function initContent(){

    insertNavbar();
 
    switch(custPath.name){
        case "":{
            insertWelcome();
            break;
        }
        case "login":{
            insertLogin();
            break;
        }
        case "registration":{
            insertRegistration();
           
            break;
        }
        case "person_create":{
            insertPersonCreate();
            break;
        }
        case "person_edit":{
            insertPersonEdit();
            break;
        }
        case "person_list":{
            insertPersonList();
            break;
        }
        case "contact_create":{
            insertContactCreate();
            break;
        }
        case "404":{
            insert404();
            break; 
        }
    }
};

function setHandlerEvents(){
    $('.input').focusout(function () {
        validateInputField(this);
    });
    $(".js-delete-person").click(function () {
        deletePerson(this)
    });
    $(".js-redirect-person_contacts").click(function () {
        //redirectPersonContacts(this)
    });
    $(".js-redirect-person_edit").click(function () {
        redirectPersonEdit(this)
    });
    $(".dropdown-menu > li > a").click(function () {
        dropDown(this)
    });
    $('a:not([href^="http"]').click(function(event) {
        requestMapping(event);
    });
}

/*--- Init global variables ---*/

function initUser(){
    user = null;

    var userStr = sessionStorage.getItem("user");

    if (userStr != null){
        user = JSON.parse(userStr);
    }  
}

function initCustPath(){
    path = location.pathname;
    path = path.replace(/^\//, '').replace(/\/$/, '');
    var pathArr = path.split("/");
    if(pathArr != null && pathArr.length > 1){
        path = pathArr[0];
    }

    custPath.name = path;
    custPath.arr = pathArr;
}

/*--- Functions create content ---*/

function clearContent(){
    $(".page-head").html("");
    $(".page-body").html("");
}

function insertNavbar(){
    var navbarBaseBlock = "navbar_block.html";
    insertBlock(navbarBaseBlock, ".page-head", "append", null);

    // Insert delay
    sleep(50);

    var navbarBlock;
    if (user == null){
        navbarBlock = "navbar_reg_block.html";
    }else{
        navbarBlock = "navbar_menu_block.html";
    }
    insertBlock(navbarBlock, ".navbar-collapse", "append", null);
}

function insertWelcome(){
    var welcomeBlock;

    if (user == null){
        welcomeBlock = "welcome_block.html";
    }else{
        welcomeBlock = "welcome_user_block.html";
    }

    insertBlock(welcomeBlock, ".page-body", "append", user);
}

function insertLogin(){
    insertBlock("login_block.html", ".page-body", "append", null);
}

function insertRegistration(){
    insertBlock("registration_block.html", ".page-body", "append", null);
}

function insertPersonCreate(){
    insertBlock("person_create_block.html", ".page-body", "append", null);
}

function insertPersonEdit(){
    var currPersonKey = $("#input-p_key").val();
    if (currPersonKey == null || currPersonKey == "") {
        var personKey = custPath.arr[1];
        if (personKey == null || personKey == "") {
            // Делаем редирект на главную страницу
            window.location.href = window.location.origin;
            return;
        }
    }

    person = dbGetPersonByKey(personKey);
    if (person == null){
        return;
    }
    insertBlock("person_edit_block.html", ".page-body", "append", person);
}

function insertPersonList(){
    var createPersonForm = document.getElementsByName("person-list");
    if (createPersonForm.length == 0){
        insertBlock("person_list_block.html", ".page-body", "append", null);
    }

    var linePerson = "";
    var persons = dbGetAllPerson();
    var i = 0;
    for(i = 0; i < persons.length; i++){
        person = persons[i];
        var countContacts = dbGetCountContactsForPerson(person.name);
         var linePerson = linePerson +
            "<tr><td>" +
                person.name + "</td><td>" +
                person.surname +  "</td><td>" +
                person.address + "</td><td>" +
                "<a class='js-redirect-person_contacts' href='person_contacts' data-person_key='" + person.key +"'><img height='15px' width='15px' src='/img/contacts.svg'/><sup>" + countContacts + "</sup></a></td><td>" +
                "<a class='js-redirect-person_edit' href='person_edit' data-person_key='" + person.key +"'><img height='15px' width='15px' src='/img/edit.svg'/></a></td><td>" +
                "<a class='js-delete-person' href='#'  data-person-key='" + person.key + "'><img height='15px' width='15px' src='/img/garbage.svg'/></a></td></tr>";


    }
    setTimeout(function () {
        $.template("person_list", linePerson);
        $.tmpl("person_list").appendTo(".table");
    }, 100);
}

function insertContactCreate(){
    var createPersonForm = document.getElementsByName("contact-cr_form");
    if (createPersonForm.length == 0){
        insertBlock("contact_create_block.html", ".page-body", "append", null);
    }
    setTimeout(function () {
        var arrPerson = dbGetAllPerson();
        for(i=0; i < arrPerson.length; i++){
            $.template("person_element", "<li><a href='#'>" + arrPerson[i].name + "</a></li>");
            $.tmpl("person_element").appendTo(".js-contact_person-ul");
            if(i < arrPerson.length - 1 ) {
                $.template("divider", " <li class='divider'></li>");
                $.tmpl("divider").appendTo(".js-contact_person-ul");
            }
        }
    }, 10);
}

function insert404(){
    insertBlock("404.html", ".page-body", "append", null);
}

/*--- Map request ---*/

function requestMapping(event) {
    event.preventDefault();
    var path = $(event.toElement).attr("href");
    if(path == null || path == '#'){
        return;
    }
    if(path != 'index'){
        history.pushState('', '', '/' + path + '/');
    }else{
        history.pushState('', '', '/');
    }
    location.reload();

}


/*--- Handlers events ---*/

function dropDown(element){
    var searchJsEl = $(element).parent("li").parent("ul").attr("class").match(/js-contact[A-Za-z0-9-_]*/);
    var currClass;
    if(searchJsEl != null && searchJsEl.length > 0){
        currClass = searchJsEl[0];
    }else{
        return;
    }
    switch (currClass){
        case "js-contact_person-ul":{
            var selectValue = $(element).text();
            $(".js-contact_person-btn").html(selectValue + "&nbsp;<i class='caret'></i>");
            $("#input-c_person").val(selectValue);
            break;
        }
        case "js-contact_type-ul":{
            var selectValue = $(element).text();
            $(".js-contact_type-btn").html(selectValue + "&nbsp;<i class='caret'></i>");
            $("#input-c_type").val(selectValue);

            var placeholder;
            switch(selectValue){
                case "phone":{
                    placeholder = "+7(960)000-00-00";
                    break;
                }
                case "e-mail":{
                    placeholder = "example@mail.ru";
                    break;
                }
                default:{
                    placeholder = "контакт...";
                }
            }
            $("#input-c_contact").attr("placeholder", placeholder);
            break;
        }
    }

}

function redirectPersonEdit(element){
    event.preventDefault();
    var path = $(element).attr("href");
    var personKey = $(element).attr("data-person_key");
    history.pushState('', '', '/' + path + '/' + personKey + '/');
    location.reload();
}

function redirectErrorPage(){
    window.location.href = window.location.origin + "/404/";
}

// Function insert template

function insertBlock(block, into, func, dataIn) {
    $.get("/templates/" + block, function (data, textStatus, XMLHttpRequest) {
        var markup = data;
        $.template(block, markup);

        switch (func) {
            case "append": {
                $.tmpl(block, dataIn).appendTo(into);
                break;
            }
            case "after": {
                $.tmpl(block, dataIn).insertAfter(into);
                break;
            }
        }

    });
}

// Function to parse a get-query
/*
function getParamFromGetQuery(key){
    var get = location.search;	// строка GET запроса
    if(get != '') {
        tmp = (get.substr(1)).split('&');
        for(var i=0; i < tmp.length; i++) {
            tmp2 = tmp[i].split('=');
            if (tmp2.length < 2){
                continue;
            }
            if (tmp2[0] === key){
                return tmp2[1];
            }
        }
    }
}
*/

/*--- Functions fto operate a User ---*/

function User(){
    this.key  = "";
    this.name = "";
    this.password = "";
}

//Create User from html-form
function newUser(){
    var user = new User();
    $(".input").each(function(){
        var name = $(this).attr('id');
        var value = $(this).val();
        switch (name){
            case 'input-username':{
                user.name = value;
                break;
            }
            case 'input-password':{
                user.password = value;
                break;
            }
        }
    });

    return user;
}

/*--- Function to operate a Person ---*/

function Person(){
    this.key  = "";
    this.name = "";
    this.surname = "";
    this.address = "";
}

// Create Person from html-form
function newPerson(){
    var person = new Person();
    $(".input").each(function(){
        var name = $(this).attr('id');
        var value = $(this).val();

        switch (name){
            case 'input-p_name':{
                person.name = value;
                break;
            }
            case 'input-p_surname':{
                person.surname = value;
                break;
            }
            case 'input-p_address':{
                person.address = value;
                break;
            }
        }
    });

    return person;
}

function createPerson(){
    var person = newPerson();
    var personAvail = dbGetPersonByName(person.name);

    if (personAvail != null){
        var message = {
            alert_type: "alert-danger js-input-username-mess",
            title: "Ошибка",
            text: " Персона с таким именем уже зарегистрирована"
        }
        insertBlock("alert_block.html", "#input-p_name", "after", message);
        return false;
    }

    dbSavePerson(person);
    return true;
}

function deletePerson(delEl){
    var key = $(delEl).attr("data-person-key");
    dbDeletePerson(key);

    openToastMessage(null,"Удаление выполнено успешно", function(){
        $(delEl).parent("td").parent("tr").remove();
    });
}

function editPerson(){
    var personName = $("#input-p_name").val();
    var person = dbGetPersonByName(personName);
    if (person == null){
        return false;
    }
    person.surname = $("#input-p_surname").val();
    person.address = $("#input-p_address").val();

    dbUpdatePerson(person);
    openToastMessage(null,"Данные успешно изменены", function(){
        window.location.href = window.location.origin + "/person_list/";
    });

    return false;
}

/*---  Function to operate a Contact ---*/

function Contact(){
    this.key  = "";
    this.person_key = "";
    this.type = "";
    this.cont = "";
}

function newContact(){
    var contact = new Contact();
    $(".input").each(function(){
        var name = $(this).attr('id');
        var value = $(this).val();
        switch (name){
            case 'input-c_person':{
                contact.person_key = value;
                break;
            }
            case 'input-c_type':{
                contact.type = value;
                break;
            }
            case 'input-c_contact':{
                contact.cont = value;
                break;
            }
        }
    });

    return contact;
}

function createContact(){
    var validate = true;
    $(".input").each(function(){
        if (!validateCreateContact(this)){
            validate = false;
            return;
        }
    });

    if (!validate){
        return false;
    }

    var contact = newContact();

    dbSaveContact(contact);
    openToastMessage(null,"Контакт успешно создан", function(){
        window.location.href = window.location.origin + "/contact_create/";
    });
    return false;
}

function validateCreateContact(inputField){
    var name = $(inputField).attr('id');
    var value = $(inputField).val();

    switch (name) {
        case 'input-c_person': {
            var c_person = $("#input-c_person").val();
            if (c_person == null || c_person == "") {
                var messageElement = document.getElementsByClassName("js-input-c_person-mess");
                if (messageElement.length == 0) {
                    var message = {
                        alert_type: "alert-danger js-input-c_person-mess",
                        title: "Ошибка!",
                        text: " Персона не выбрана!!!"
                    }
                    insertBlock("alert_block.html", ".js-contact_person-btn", "after", message);
                }
                return false;
            } else {
                $(".js-input-c_person-mess").remove();
            }
            return true;
        }
        case 'input-c_type': {
            var c_type = $("#input-c_type").val();
            if (c_type == null || c_type == "") {
                var messageElement = document.getElementsByClassName("js-input-c_type-mess");
                if (messageElement.length == 0) {
                    var message = {
                        alert_type: "alert-danger js-input-c_type-mess",
                        title: "Ошибка!",
                        text: " Тип контакта не выбран!!!"
                    }
                    insertBlock("alert_block.html", ".js-contact_type-btn", "after", message);
                }
                return false;
            } else {
                $(".js-input-c_type-mess").remove();
            }
            return true;
        }
    }
    return true;
}

/*--- Authorization ---*/

function login(){
    var name = $("#input-username").val();
    var password = $("#input-password").val();

    var user = dbGetUserByName(name);
    if (user == null){
        var message = {
            alert_type: "alert-danger js-input-username-mess",
            title: "Ошибка",
            text: "Пользователь с указанным именем не зарегистрирован"
        }
        insertBlock("alert_block.html", "#input-username", "after", message);
        return false;
    }
    if (user.password != password){
        var message = {
            alert_type: "alert-danger js-input-username-mess",
            title: "Ошибка",
            text: "Пароль для указанного пользователя введен неверный"
        }
        insertBlock("alert_block.html", "#input-password", "after", message);
        return false;
    }

    sessionStorage.setItem("user", JSON.stringify(user));
    window.location.href = window.location.origin;
    alert(window.location.href);
    return false;

}

function exit(){
    sessionStorage.removeItem("user");
}

/*--- Data-validation ---*/

function validateRegistration(){
    var validate = true;
    $(".input").each(function(){
        if (!validateInputField(this)){
            validate = false;
        }
    });

    if (!validate){
        return false;
    }

    var user = newUser();

    var checkUser = dbGetUserByName(user.name);

    if (checkUser != null){
        var message = {
            alert_type: "alert-danger js-input-username-mess",
            title: "Ошибка",
            text: "Пользователь с указанным именем уже существует"
        }
        insertBlock("alert_block.html", "#input-username", "after", message);
        return false;
    }

    dbSaveUser(user);

    openToastMessage(3000,"Регистрация выполнена успешно, Вы можете войти под зарегистрированным пользователем", function(){
        window.location.href = window.location.origin + "/login/";
    });
    return false;
}

function validateInputField(inputField){

    var name = $(inputField).attr('id');
    var value = $(inputField).val();

    switch (name){
        case'input-username':{
            if (!validateUserName(value)) {
                var messageElement = document.getElementsByClassName("js-input-username-mess");
                if (messageElement.length == 0) {
                    var message = {
                        alert_type: "alert-danger js-input-username-mess",
                        title: "Ошибка!",
                        text: " Имя пользователя должно содержать символы [a-Z,0-9]"
                    }
                    insertBlock("alert_block.html", "#input-username", "after", message);
                }
                return false;
            }else{
                $(".js-input-username-mess").remove();
            }
            return true;
        }
        case 'input-password':{
            if (!validatePassword(value)) {
                var messageElement = document.getElementsByClassName("js-input-password-mess");
                if (messageElement.length == 0) {
                    var message = {
                        alert_type: "alert-danger js-input-password-mess",
                        title: "Ошибка!",
                        text: " Пароль должен содержать символы [a-Z,0-9] и должен быть более 5 символов"
                    }
                    insertBlock("alert_block.html", "#input-password", "after", message);
                }
                return false;
            }else{
                $(".js-input-password-mess").remove();
            }
            return true;
        }
        case 'input-rep_password':{
            if (!validateRepPassword(value)) {
                var messageElement = document.getElementsByClassName("js-input-rep_password-mess");
                if (messageElement.length == 0) {
                    var message = {
                        alert_type: "alert-danger js-input-rep_password-mess",
                        title: "Ошибка!",
                        text: " Повторный пароль введен неверно"
                    }
                    insertBlock("alert_block.html", "#input-rep_password", "after", message);
                }
                return false;
            }else{
                $(".js-input-rep_password-mess").remove();
            }
            return true;
        }
    }
    return true;

}

function validateUserName(userName){
    var pos = userName.search(/[^A-z0-9]/);
    if (pos > 0){
        return false;
    }
    return true;
}

function validatePassword(userPass){
    if (userPass.length < 6){
        return false;
    }
    var pos = userPass.search(/[^A-z0-9]/);
    if (pos > 0){
        return false;
    }
    return true;
}

function validateRepPassword(userRepPass){
    if ($("#input-password").val() != userRepPass){
        return false;
    }
    return true;
}

/*--- User ---*/

function dbGetUserByName(userName) {
    var userKeys = dbGetArrayByKey("user");
    if (userKeys != null) {
        for (i = 0; i < userKeys.length; i++) {
            var user = dbGetUserByKey(userKeys[i]);
            if (user != null) {
                if (user.name === userName) {
                    return user;
                }
            }
        }
    }
    return null;
}

function dbGetUserByKey(userKey){
    var userStr = localStorage.getItem(userKey);
    if (userStr != null){
        var user = JSON.parse(userStr);
        return user;
    }
    return null;
}

function dbSaveUser(user){
    var key = dbGetNewKey("user");

    user.key = key;
    localStorage.setItem(user.key, JSON.stringify(user));
}

/*--- Person ---*/

function dbGetPersonByName(personName) {
    var personKeys = dbGetArrayByKey("person");
    if (personKeys != null) {
        for (i = 0; i < personKeys.length; i++) {
            var person = dbGetPersonByKey(personKeys[i]);
            if (person != null) {
                if (person.name === personName) {
                    return person;
                }
            }
        }
    }
    return null;
}

function dbGetPersonByKey(personKey){
    var personStr = localStorage.getItem(personKey);
    if (personStr != null){
        var person = JSON.parse(personStr);
        return person;
    }
    return null;
}

function dbGetAllPerson(){
    var persons = [];
    var personKeys = dbGetArrayByKey("person");
    if (personKeys != null) {
        for (i = 0; i < personKeys.length; i++) {
            var person = dbGetPersonByKey(personKeys[i]);
            if (person != null) {
                persons = persons.concat(person);
            }
        }
    }
    return persons;
}

function dbSavePerson(person){
    var key = dbGetNewKey("person");

    person.key = key;
    localStorage.setItem(person.key, JSON.stringify(person));
}

function dbUpdatePerson(person){
    localStorage.setItem(person.key, JSON.stringify(person));
}

function dbDeletePerson(key){
    localStorage.removeItem(key);
    dbDeleteArrKeys("person", key)
}

function dbGetCountContactsForPerson(personKey){
    var arrContact = dbGetAllContact();
    var count = 0;
    var i = 0;
    for(i=0; i < arrContact.length; i++){
        if (personKey == arrContact[i].person_key){
            count+=1;
        }
    }
    return count;
}

/*--- Contact---*/

function dbGetContactByName(contactName) {
    var contactKeys = dbGetArrayByKey("contact");
    if (contactKeys != null) {
        for (i = 0; i < contactKeys.length; i++) {
            var contact = dbGetContactByKey(contactKeys[i]);
            if (contact != null) {
                if (contact.name === contactName) {
                    return contact;
                }
            }
        }
    }
    return null;
}
function dbGetContactByKey(contactKey){
    var contactStr = localStorage.getItem(contactKey);
    if (contactStr != null){
        var contact = JSON.parse(contactStr);
        return contact;
    }
    return null;
}

function dbGetAllContact(){
    var contacts = [];
    var contactKeys = dbGetArrayByKey("contact");
    if (contactKeys != null) {
        for (i = 0; i < contactKeys.length; i++) {
            var contact = dbGetContactByKey(contactKeys[i]);
            if (contact != null) {
                contacts = contacts.concat(contact);
            }
        }
    }
    return contacts;
}

function dbSaveContact(contact){
    var key = dbGetNewKey("contact");

    contact.key = key;
    localStorage.setItem(contact.key, JSON.stringify(contact));
}

function dbUpdateContact(contact){
    localStorage.setItem(contact.key, JSON.stringify(contact));
}

function dbDeleteContact(key){
    localStorage.removeItem(key);
    dbDeleteArrKeys("contact", key)
}

/*--- Common ---*/

function dbGetNewKey(prefKey){
    var currKey = prefKey + "-curr-key";
    var keyNumb = Number(localStorage.getItem(currKey));
    if (keyNumb != null){
        keyNumb += 1;
    }else{
        keyNumb = 1;
    }
    localStorage.setItem(currKey, keyNumb);
    var newKey = prefKey + "-" + keyNumb;
    dbAddArrKeys(prefKey, newKey);

    return newKey;
}

function dbGetArrayByKey(prefArrKey){
    var arrKey = prefArrKey + "-keys";
    var arrayStr = localStorage.getItem(arrKey);
    if (arrayStr != null){
        var array = arrayStr.split(",");
    }
    return array;
}

function dbAddArrKeys(prefArrKey, key){
    var arrKey = prefArrKey + "-keys";
    var arrayStr = localStorage.getItem(arrKey);
    if (arrayStr != null){
        var array = arrayStr.split(",");
        array = array.concat(key);
        arrayStr = array.join(",");
        localStorage.setItem(arrKey, arrayStr);
    }else{
        localStorage.setItem(arrKey, key);
    }

}

function dbDeleteArrKeys(prefArrKey, key){
    var arrKey = prefArrKey + "-keys";
    var arrayStr = localStorage.getItem(arrKey);
    if (arrayStr != null){
        var array = arrayStr.split(",");
        for(i=0; i < array.length; i++){
            if(array[i] == key){
                delete array.splice(i, 1);
                break;
            }
        }
        arrayStr = array.join(",");
        localStorage.setItem(arrKey, arrayStr);
    }
}

// First init DB

function dbInit(){
    var userKeys = localStorage.getItem("user-keys");

    if (userKeys != null){
        return;
    }

    var user = new User();
    user.name = "test";
    user.password = "123456";
    dbSaveUser(user);

    var person = new Person();
    person.name = "Александр";
    person.surname = "Егоров";
    person.address = "РФ, Республика Татарстан";
    dbSavePerson(person);
}

function sleep(millis) {
    var t = (new Date()).getTime();
    var i = 0;
    while (((new Date()).getTime() - t) < millis) {
        i++;
    }
}

function openToastMessage(delay, text, func){
    var lDelay;
    if (delay == null){
        lDelay = 1200;
    }else {
        lDelay = delay;
    }
    $.template("toast_message", "<div class='toast-mess'>" + text +"</div>\n<div class='toast-mess_back'></div>");
    $.tmpl("toast_message").appendTo("body");
    setTimeout(function(){
        $(".toast_mess").remove();
        $(".toast_mess_back").remove();
        func();
    }, lDelay);
}


