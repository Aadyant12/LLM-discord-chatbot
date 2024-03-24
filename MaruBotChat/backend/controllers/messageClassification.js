const asyncHandler = require("express-async-handler");
var spawn = require('child_process').spawn;
const fs = require('fs');


const classifyMessage = asyncHandler(async (req, res) => {
  try {
    // predict()
    const process = spawn('python',["backend\\script.py", 
                          req.body.message] );
    
    // process.stdout.on('data', (data) => {
    //   console.log('pattern: ', data.toString());
    // });
    
    // process.stderr.on('data', (data) => {
    //   console.error('err: ', data.toString());
    // });
    
    // process.on('error', (error) => {
    //   console.error('error: ', error.message);
    // });
    
    // process.on('close', (code) => {
    //   console.log('child process exited with code ', code);
    // });
    // // console.log(process.stdout)
    process.stdout.on('data', function(data) { 
      // console.log(typeof data.toString())
      res.json({class:data.toString()});
    })
    // res.json({class:"0.82,severe-toxic"})
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = {classifyMessage};
