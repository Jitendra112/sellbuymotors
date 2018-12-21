var express = require('express')
var app = express()
const {database} = require('../db.js')
var http = require('http');
var multer  =   require('multer');
var bodyParser =    require("body-parser");
const path = require('path');
let fs = require('fs');
var url = require('url')
var request = require('request');
var pagination = require('pagination')

app.get('/', function(req, res, next) {
    
        res.render('admin/index', {
            title: 'Add content',
            
        }) 
})

var sess;
app.post('/admin_login',async function(req, res, next){
       sess=req.session;
       sess.udata;
      
    //console.log(sess)
   

       var query = 'SELECT * FROM tbl_user Where email = "' + req.body.email + '" && password = "' + req.body.password  + '" && role = "A"';
       //console.log(query);
        results = await database.query(query, [] );
        //console.log(results.length);
        if(results.length > 0 ){
         
          sess.udata = JSON.parse(results);
        
          // console.log(sess.udata);
       
                  res.writeHead(200, {'Content-Type': 'application/json'});
                  var obj = {success : 1 , message : 'Login Successfully!!'}
                  res.end(JSON.stringify(obj));
                  
              } else {

                  res.writeHead(200, {'Content-Type': 'application/json'});
                  var obj = {success : 0 , message : 'Login Failed!! '}
                  res.end(JSON.stringify(obj));
                  
              }

      
});

app.get('/Dashboard', function(req, res, next) {

  res.locals.udata = req.session.udata;
   var g = res.locals.udata;

if(g) {
        res.render('admin/dashboard', {
            title: 'Add content',
             
    }) 
 } else{
    res.render('admin/index', {
        title: 'Add content',
        
    }) 

 }
})
    
    

app.get('/signout', function (req, res) {
    req.session.destroy();

      res.redirect('/admin/');
  });
// Display Users

app.get('/Users',async function(req, res, next) {

  res.locals.udata = req.session.udata;
   var g = res.locals.udata;

if(g) { 
       var query = "SELECT * FROM tbl_user Where role ='U'";
        results = await database.query(query, [] );
        res.render('admin/all_users', {
            title: 'Add content',
            data: JSON.parse(results)
    }) 
 } else{
    res.render('admin/index', {
        title: 'Add content',
        
    }) 

 }
})

// Display Cars

app.get('/Cars',async function(req, res, next) {

  res.locals.udata = req.session.udata;
   var g = res.locals.udata;

if(g) { 
       var query = "SELECT tbl_products.*,tbl_cars_images.image_name from tbl_products INNER JOIN tbl_cars_images ON tbl_cars_images.product_id = tbl_products.id GROUP BY tbl_cars_images.product_id";
        results = await database.query(query, [] );
        res.render('admin/all_cars', {
            title: 'Add content',
            data: JSON.parse(results)
    }) 
 } else{
    res.render('admin/index', {
        title: 'Add content',
        
    }) 

 }
})

app.get('/Details',async function(req, res, next) {

  res.locals.udata = req.session.udata;
   var g = res.locals.udata;

if(g) { 
       var query = "SELECT tbl_products.*,tbl_cars_images.image_name,tbl_user.user_name from tbl_products INNER JOIN tbl_cars_images ON tbl_cars_images.product_id = tbl_products.id INNER JOIN tbl_user ON tbl_user.id = tbl_cars_images.user_id";
        results = await database.query(query, [] );
      //  console.log(results);
        res.render('admin/car_details', {
            title: 'Add content',
            data: JSON.parse(results)
    }) 
 } else{
    res.render('admin/index', {
        title: 'Add content',
        
    }) 

 }
})
module.exports = app
