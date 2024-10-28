//app.js

const express = require('express');

const app = express();
const port = 3000;

app.get('/', (req, res)=>{
    res.status(200);
    res.send("Welcome to root URL of Server");
});


app.listen(port, (error) => {
    if(!error)
    console.log(`Server is running on http://localhost:${port}`);
    else 
    console.log("Error occurred, server can't start", error);

});
