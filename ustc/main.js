/*
    - Info:
        This is an example script for LU runtime

    ! WARNING:
    1. no global variables are recommended as they might not share the same context
    2. functions that are commented with @instant shouldn't call time-senetive function like networking
        as they aren't supposed to be cocurrent
    3. you shouldn't call native code from any of this,
        neither should you request anything beyond url declared in `declare.json`
        for more information, check document around security
*/

let version = "1.0.0"; // this is the version of the script, not LU runtime
let author = "TiankaiM";
let description = "A script for USTC students to login to the campus network";

/* assume we have these variables passed to script here:
    and inputs are automatically updated by LU runtime before calling any function
    but they aren't supposed to be changed by script, as the sync is one-way */

// var inputs = {
//     "username": "username",
//     "password": "password",
//     "user_type": "graduate",
// };

// device_cache is the only global variable that is shared between functions
// var device_cache = "";

// in life-cycle, the script would be first executed once before calling any function
// you're not required to do anything here.
function init() {
    console.log("init");
}

// This function is called when:
// 1. the app is launched
// 2. updates on inputs are detected
// 3. user manually click the "check" button
//
// > @instant check if all inputs are valid
// - Return:
//   - {"invalid": [], "error_msg": ""}
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
        "invalid": invalid,
        "error_msg": error_msg,
    };
}

// the following function is NOT required to be implemented,
// but we just assume you need to login to a CAS server first
function login_to_cas() {
    let url = "https://passport.ustc.edu.cn/login";
    let data = {
        "model": "uplogin.jsp",
        "service": "https://jw.ustc.edu.cn/for-std/login",
        "warn": "",
        "showCode": "",
        "username": inputs.username,
        "password": inputs.password,
        "button": "",
    };

    let res = http.post(url, data);
    if (res.status_code != 200 || res.text.indexOf("登录成功") == -1) {
        throw "Failed to login to CAS server";
    }

    // save cookie to device_cache
    device_cache["cas_cookie"] = res.cookies;
    device_cache["cas_last_login"] = new Date().getTime();
}

function require_login_to_cas() {
    if (device_cache["cas_last_login"] == undefined ||
        device_cache["cas_cookie"] == undefined ||
        new Date().getTime() - device_cache["cas_last_login"] > 1000 * 60 * 15) {
        login_to_cas();
    }
}

function course_table() {
    let url = "https://jw.ustc.edu.cn/for-std/course-table";
    require_login_to_cas();

    let res = http.get(url, {
        "cookies": device_cache["cas_cookie"],
    });

    if (res.status_code != 200) {
        throw "Failed to get course table";
    }

    let doc = html.parse(res.text);
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
            "name": cells[0].text,
            "teacher": cells[1].text,
            "time": cells[2].text,
            "location": cells[3].text,
        };
        courses.push(course);
    }

    return courses;
}