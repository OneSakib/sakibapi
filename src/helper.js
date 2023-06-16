const validate = (obj) => {
    const valid = []
    for (let key in obj) {
        if (check(obj[key])) {
            let err = {}
            err[key] = "This Field is required"
            valid.push(err)
        }
    }
    return valid
}

function check(value) {
    return (value == undefined || value.length < 1)
}


module.exports = { validate }