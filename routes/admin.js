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




/*----------------------------------Get Admin Login Page --------------------------------------*/

app.get('/', function(req, res, next) {
    
        res.render('admin/index', {
            title: 'Add content',
            
        }) 
})

/*----------------------------------Get Admin Login Page End--------------------------------------*/







/*--------------------------------------Admin Login-----------------------------------------------*/

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

/*----------------------------------Admin Login End--------------------------------------*/








/*----------------------------------Admin Dashboard--------------------------------------*/

app.get('/Dashboard',async function(req, res, next) {

  res.locals.udata = req.session.udata;
   var g = res.locals.udata;
    var user;
    var car;
    var new_car;
    var used;
if(g) {
        var query = "Select COUNT(*) as user from tbl_user Where role='U'";
        user = await database.query(query, [] );
        var query = "Select COUNT(*) as car from tbl_products";
        car = await database.query(query, [] );
        var query = "Select COUNT(*) as new from tbl_products Where car_type='New'";
        new_car = await database.query(query, [] );
        var query = "Select COUNT(*) as used from tbl_products Where car_type='Used'";
        used = await database.query(query, [] );
        var data  = {
        user : JSON.parse(user),
        car : JSON.parse(car),
        new_car : JSON.parse(new_car),
        used : JSON.parse(used),

        
    }
        res.render('admin/dashboard', {
            title: 'Add content',
            data: data
             
    }) 
 } else{
    res.render('admin/index', {
        title: 'Add content',
        
    }) 

 }
})

/*----------------------------------Admin Dashboard End--------------------------------------*/    
    




/*-----------------------------------Admin Sign Out------------------------------------------*/

app.get('/signout', function (req, res) {
    req.session.destroy();

      res.redirect('/admin/');
  });

/*----------------------------------Admin Sign Out End--------------------------------------*/







/*----------------------------------- Display All Users--------------------------------------*/

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

/*----------------------------------- Display All Users End----------------------------------*/





/*--------------------------------------- Display All Cars-----------------------------------*/

app.get('/Cars',async function(req, res, next) {

    res.locals.udata = req.session.udata;
    var g = res.locals.udata;

 if(g) { 
       var query = "SELECT tbl_products.*,tbl_cars_images.image_name from tbl_products INNER JOIN tbl_cars_images ON tbl_cars_images.product_id = tbl_products.id GROUP BY tbl_cars_images.product_id";
        results = await database.query(query, [] );
         if(results.length > 0 ){
        res.render('admin/all_cars', {
        title: 'Add content',
        data: JSON.parse(results)
     }) 
       }else{
    res.render('admin/no_allcars', {
         title: 'All cars',
         
       });
    }  
  } else{
        res.render('admin/index', {
        title: 'Add content',
        
    }) 

 }
})

/*--------------------------------------- Display All Cars End-----------------------------------*/




/*--------------------------------------- Display All New Cars-----------------------------------*/


app.get('/NewCars',async function(req, res, next) {

    res.locals.udata = req.session.udata;
    var g = res.locals.udata;
 if(g) { 
    var query = "SELECT tbl_products.*,tbl_cars_images.image_name from tbl_products INNER JOIN tbl_cars_images ON tbl_cars_images.product_id = tbl_products.id Where car_type='New' GROUP BY tbl_cars_images.product_id";
    results = await database.query(query, [] );
    if(results.length > 0 ){
    res.render('admin/new_cars', {
    title: 'New Cars',
    data: JSON.parse(results)
     }) 

    }else{
    res.render('admin/new_no_cars', {
         title: 'New cars',
         
       });
    }
       
  } else{
        res.render('admin/index', {
        title: 'Add content',
        
    }) 

 }
})


/*--------------------------------------- Display All New Cars End-----------------------------------*/





/*--------------------------------------- Display All Used Cars--------------------------------------*/



app.get('/UsedCars',async function(req, res, next) {

       res.locals.udata = req.session.udata;
       var g = res.locals.udata;
 if(g) { 
       var query = "SELECT tbl_products.*,tbl_cars_images.image_name from tbl_products INNER JOIN tbl_cars_images ON tbl_cars_images.product_id = tbl_products.id Where car_type='Used' GROUP BY tbl_cars_images.product_id";
       results = await database.query(query, [] );
       if(results.length > 0){
        res.render('admin/used_cars', {
        title: 'Used cars',
        data: JSON.parse(results)
        }) 
       }else{
         res.render('admin/used_no_cars', {
         title: 'Used cars',
       });
       }
}else{
        res.render('admin/index', {
        title: 'Add content',
        
    }) 

 }
})

/*--------------------------------------- Display All Used Cars End--------------------------------------*/


/*--------------------------------------- Delete Cars--------------------------------------*/



app.post('/delete',async function(req, res, next) {
       
       res.locals.udata = req.session.udata;
       var g = res.locals.udata;

 if(g) { 

      if(req.method == "POST"){
         var post  = req.body;
         var id = post.id;
         var query = "SELECT * FROM tbl_cars_images WHERE product_id = ?";
          results = await database.query(query, [id] );
          var myJSON = JSON.parse(results);
          myJSON.forEach((v) => {
 
          var filePath = 'assets/uploads/'+v.image_name;
           fs.unlinkSync(filePath);
            });
           var query = "DELETE tbl_products,tbl_cars_images FROM tbl_products,tbl_cars_images WHERE tbl_products.id = tbl_cars_images.product_id AND tbl_products.id ='"+ id +"'"; 
           results = await database.query(query, [] );
            if (results) {
              res.writeHead(200, {'Content-Type': 'application/json'});
              var obj = {success : 1 , message : 'Product Removed Successfully!!'}
              res.end(JSON.stringify(obj));
             } else {                
             
                res.writeHead(200, {'Content-Type': 'application/json'});
                var obj = {success : 0 , message : 'Product Can not Removed!!'}
                res.end(JSON.stringify(obj));
             }
               

 }
 }
})

/*---------------------------------------Delete Cars End--------------------------------------*/











// app.get('/Details',async function(req, res, next) {

//   res.locals.udata = req.session.udata;
//    var g = res.locals.udata;

// if(g) { 
//        var query = "SELECT tbl_products.*,tbl_cars_images.image_name,tbl_user.user_name from tbl_products INNER JOIN tbl_cars_images ON tbl_cars_images.product_id = tbl_products.id INNER JOIN tbl_user ON tbl_user.id = tbl_cars_images.user_id";
//         results = await database.query(query, [] );
//       //  console.log(results);
//         res.render('admin/car_details', {
//             title: 'Add content',
//             data: JSON.parse(results)
//     }) 
//  } else{
//     res.render('admin/index', {
//         title: 'Add content',
        
//     }) 

//  }
// })
module.exports = app
