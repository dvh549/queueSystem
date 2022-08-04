const COMMON_URL = "http://localhost:5000";
var queueNo;

// intervals of 1 second (time specified in milliseconds where 1000ms = 1 sec)
setInterval(() => {
    getQueueStatusAll();
}, 1000);

function determineFormType(type){
    const regForm = document.getElementById("regForm");
    regForm.innerHTML = "";
    let content; 
    if (type == "c"){
        content = `<div class="form-group">
            <label for="name">Name</label>
            <input type="text" class="form-control" id="name" placeholder="Enter Name">
        </div>
        <div class="form-group">
            <label for="phoneNo">Phone Number</label>
            <input type="text" class="form-control" id="phoneNo" placeholder="Enter Phone Number">
        </div>
        <button type="button" class="btn btn-primary" onclick="createQueueNo()">Submit</button>`;
    } else if (type == "r") {
        content = `<div class="form-group">
            <label for="phoneNo">Phone Number</label>
            <input type="text" class="form-control" id="phoneNo" placeholder="Enter Phone Number">
        </div>`;
        if (localStorage.phoneNo && localStorage.phoneNo != "") {
            content = `<div class="form-group">
                <label for="phoneNo">Phone Number</label>
                <input type="text" class="form-control" id="phoneNo" placeholder="Enter Phone Number" value="${localStorage.phoneNo}">
            </div>
            <div class="form-check">
                <input type="checkbox" class="form-check-input" id="rememberMe" checked>
                <label class="form-check-label" for="rememberMe">Remember me</label>
            </div> `;
        } else {
            content = `<div class="form-group">
                <label for="phoneNo">Phone Number</label>
                <input type="text" class="form-control" id="phoneNo" placeholder="Enter Phone Number">
            </div>
            <div class="form-check">
                <input type="checkbox" class="form-check-input" id="rememberMe">
                <label class="form-check-label" for="rememberMe">Remember me</label>
            </div> `;
        }
        content += `<button type="button" class="btn btn-primary" onclick="getQueueNo()">Submit</button>`;
    }
    regForm.innerHTML = content;
}

function getQueueStatusAll(){
    fetch(`${COMMON_URL}/getQueueStatusAll`)
    .then(response => response.json())
    .then(data => {
        para = document.getElementById("displayCurrentQueue");
        para.innerHTML = `${data.message} are currently queueing.`;
    })
    .catch(error => {
        console.log(this.message + error);
    })
}

function createQueueNo(){
    let nameValue = document.getElementById("name").value;
    let phoneNoValue = document.getElementById("phoneNo").value;
    let jsonData = JSON.stringify({
        name: nameValue, 
        phone: phoneNoValue
    });
    fetch(`${COMMON_URL}/enqueue`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: jsonData
    })
    .then(response => response.json())
    .then(data => {
        sessionStorage.queueNo = data.queueNo;
        // alert(sessionStorage.queueNo);
        location.href = "queue.html";
    })
    .catch(error => {
        console.log(this.message + error);
    });
}

function getQueueNo(){
    let phoneNoValue = document.getElementById("phoneNo").value;
    fetch(`${COMMON_URL}/getQueueNo/${phoneNoValue}`)
    .then(response => response.json())
    .then(data => {
        rememberMe(phoneNoValue);
        sessionStorage.queueNo = data.message;
        // alert(sessionStorage.queueNo);
        location.href = "queue.html";
    })
    .catch(error => {
        console.log(this.message + error);
    });
}

function rememberMe(phoneNoValue) {
    let rmbCheck = document.getElementById("rememberMe");
    if (rmbCheck.checked) {
        localStorage.phoneNo = phoneNoValue
    } else {
        localStorage.removeItem("phoneNo");
    }
}

// Archived
// function getAllCustomers() {
//     fetch(`${COMMON_URL}/getAllCustomers`)
//     .then(response => response.json())
//     .then(data => {
//         para = document.getElementById("displayText");
//         let message_arr = data.message;
//         let result_str = "";
//         for (let i=0; i<message_arr.length; i++){
//             result_str += `Name: ${message_arr[i].name}, Phone Number: ${message_arr[i].phone_num} <br>`;
//         }
//         para.innerHTML = `Code: ${data.code} <br> Result: <br> ${result_str}`;
//     })
//     .catch(error => {
//         console.log(this.message + error);
//     })
// }

// function getCustomerByID() {
//     fetch(`${COMMON_URL}/getCustomerByID/11112222`)
//     .then(response => response.json())
//     .then(data => {
//         para = document.getElementById("displayText");
//         let message_arr = data.message;
//         let result_str = "";
//         for (let i=0; i<message_arr.length; i++){
//             result_str += `Name: ${message_arr[i].name}, Phone Number: ${message_arr[i].phone_num} <br>`;
//         }
//         para.innerHTML = `Code: ${data.code} <br> Result: <br> ${result_str}`;
//     })
//     .catch(error => {
//         console.log(this.message + error);
//     })
// }