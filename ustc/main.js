/*
- Info:
    This is an example script for LU runtime
    LU runtime is a sandboxed environment for running user scripts,
*    on iOS, it's managed with webkit
*    on Android, it's managed with v8

    hint for Github copilot:
-     only web APIs are available,
-     use XMLHttpRequest for networking,
-     http isn't available

- More:
    This script is just a js-clone of swift file,
    original swift file is located at:
    https://github.com/Life-USTC/Life-USTC/blob/main/Models/USTC/UstcCAS.swift
    https://github.com/Life-USTC/Life-USTC/blob/main/Models/USTC/UstcUgAAS.swift

! WARNING:
* no global variables are recommended as they might not share the same context
* functions that are commented with @instant shouldn't call time-senetive function like networking
*   as they aren't supposed to be cocurrent
* you shouldn't call native code from any of this with any tricks, they're huge security risks
*   neither should you request anything beyond url declared in `declare.json`
*   for more information, check document section security
*/

// <<< runtime hints

/*
assume we have these variables passed to script here:
and inputs are automatically updated by LU runtime before calling any function
but they aren't supposed to be changed by script, as the sync is one-way,
device_cache is the only global variable that is sure to shared between functions
*/

// var inputs = {
//     "username": "username",
//     "password": "password",
//     "user_type": "graduate",
// };
// var device_cache = "";

// <<< script information

let version = "1.0.0"; // this is the version of the script, not LU runtime
let author = "Life-USTC";
let description = "A script for USTC students to login to the campus network";

// <<< functions below are recommened to be implemented >>>

/**
 * @description init function, called when script is loaded
 * @instant
*/
function init() {
    console.log("init");
}

/**
 * @description check if all inputs are valid
 * @instant
 * @returns {{"invalid": [], "error_msg": ""}}
 */
function check_input() {
    let invalid = [];
    let error_msg = "";

    if (inputs.username.length == 0) {
        invalid.push("username");
        error_msg += "用户名不能为空\n";
    }

    if (inputs.password.length == 0) {
        invalid.push("password");
        error_msg += "密码不能为空\n";
    }

    return {
        invalid: invalid,
        error_msg: error_msg,
    };
}

// the following function is NOT required to be implemented,
// but we just assume you need to login to a CAS server first
function login_to_cas() {
    let url = "https://passport.ustc.edu.cn/login";

    function get_lt_token() {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, false);
        xhr.send();
        if (xhr.status != 200) {
            throw "Failed to fetch CAS_LT";
        }
        // CAS_LT is located in <input name="CAS_LT" value="..."> in the response
        let CAS_LT = xhr.responseText.match(/name="CAS_LT" value="(.*)"/)[1];
        return CAS_LT;
    }

    let data = {
        model: "uplogin.jsp",
        CAS_LT: get_lt_token(),
        service: "",
        warn: "",
        showCode: "",
        username: inputs.username,
        password: inputs.password,
        button: "",
    };

    // encode data
    let data_str = "";
    for (let key in data) {
        data_str += key + "=" + encodeURIComponent(data[key]) + "&";
    }

    console.log(data_str)

    // let res = http.post(url, data);
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, false);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.withCredentials = true;
    xhr.send(data_str);
    if (xhr.status != 200) {
        throw "Failed to login to CAS";
    }
    device_cache["cas_last_login"] = new Date().getTime();
}

function require_login_to_cas() {
    if (
        device_cache["cas_last_login"] == undefined ||
        new Date().getTime() - device_cache["cas_last_login"] > 1000 * 60 * 15
    ) {
        login_to_cas();
    }
}

function course_table() {
    let url = "https://jw.ustc.edu.cn/for-std/course-table";
    require_login_to_cas();

    let xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);
    xhr.withCredentials = true;
    xhr.send();

    if (xhr.status_code != 200) {
        throw "Failed to get course table";
    }

    let doc = html.parse(xhr.responseText);
    let table = doc.querySelector("table#course-table");
    if (table == null) {
        throw "Failed to get course table";
    }

    let rows = table.querySelectorAll("tr");
    let courses = [];
    for (let i = 1; i < rows.length; i++) {
        let row = rows[i];
        let cells = row.querySelectorAll("td");
        let course = {
            name: cells[0].text,
            teacher: cells[1].text,
            time: cells[2].text,
            location: cells[3].text,
        };
        courses.push(course);
    }

    return courses;
}
