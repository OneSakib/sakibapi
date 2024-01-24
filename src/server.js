const app = require('./app')
require('dotenv').config();
const port = process.env.PORT || 8080;

app.listen(port, (err) => {
    if (err) {
        console.log("ERRROR: ", err)
    }
    console.log(`Listening on port ${port}`)
})
