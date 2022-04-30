const express = require('express');
const app=express();
const port = process.env.PORT || 5000;

app.get('/',(req,res)=>{
    res.send('warehouse server is okkk');
})
app.listen(port,()=>{
    console.log(`Listening Port:${port}`);
})
