// Check Email
exports.isValidEmail = (mail) => {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) {
        return (true)
    }
    return (false)
}

// Check độ dài o nhập
exports.isleghtText = (text) => {
    if (text.length > 5 ) {
        return true;
    }
    else {
        return false;
    }
}

// Check Chỉ nhập Số
exports.isNumber = (number) => {
    var numbers = /^[0-9]+$/;
    if (number.match(numbers)) {
        return true;
    }
    else {
        return false;
    }
}

// Check Số Điện Thoại
exports.isPhoneNumber = (input) => {

    var phoneno = /^\d{10}$/;
    if (input.match(phoneno)) {
        return true;
    }
    else {

        return false;
    }
}

// Check k được Nhập kí tự đặc Biệt
exports.isText = (input) => {
    var letters = /^[a-zA-Z0-9]+$/;
    if (input.match(letters)) {
        return true;
    }
    else {

        return false;
    }
}

// Check Ngày Tháng Năm
exports.isDate = (inputText) => {
    var dateformat = /^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$/;
    // Match the date format through regular expression
    if (inputText.match(dateformat)) {

        var opera1 = inputText.split('/');
        var opera2 = inputText.split('-');
        const lopera1 = opera1.length;
        const lopera2 = opera2.length;
        // Extract the string into month, date and year
        if (lopera1 > 1) {
            var pdate = inputText.split('/');
        }
        else if (lopera2 > 1) {
            var pdate = inputText.split('-');
        }
        var dd = parseInt(pdate[0]);
        var mm = parseInt(pdate[1]);
        var yy = parseInt(pdate[2]);
        // Create list of days of a month [assume there is no leap year by default]
        var ListofDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        if (mm == 1 || mm > 2) {
            if (dd > ListofDays[mm - 1]) {
                return false;
            }
        }
        if (mm == 2) {
            var lyear = false;
            if ((!(yy % 4) && yy % 100) || !(yy % 400)) {
                lyear = true;
            }
            if ((lyear == false) && (dd >= 29)) {
                return false;
            }
            if ((lyear == true) && (dd > 29)) {
                return false;
            }
        }
    }
    else {
        return false;
    }
}

