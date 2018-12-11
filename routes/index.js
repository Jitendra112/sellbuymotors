var express = require('express')
var app = express()
const {database} = require('../db.js')
var http = require('http');
let axios = require('axios');
let cheerio = require('cheerio');
const replaceString = require('replace-string');
var multer  =   require('multer');
var bodyParser =    require("body-parser");
const path = require('path');
let fs = require('fs');
var url = require('url')
var request = require('request');
var lowerCase = require('lower-case')

app.get('/', function(req, res, next) {
     res.locals.udata = req.session.udata;
        res.render('sellbuy/index', {
            title: 'Add content',
            
        }) 
})


app.post('/uploads', async function(req, res, next){

 res.locals.udata = req.session.udata;

  var userdata = res.locals.udata

  var newdata =  JSON.stringify(userdata);
  var alldata = JSON.parse(newdata);
    //console.log(alldata[0].id)

   if(req.method == "POST"){
         var post  = req.body;
	       var car_id = post.carid;
     
          var file = req.files.userPhoto;
       //  console.log(file.size);
          
	      	var img_name='IMG_'+ Date.now();
          //console.log(img_name)
	     	 if(file.mimetype == "image/jpeg" ||file.mimetype == "image/png"||file.mimetype == "image/gif" || file.size < 52428800 ){
                                 
              file.mv('assets/uploads/'+img_name , async function(err) {
                             
                  
          var query = "INSERT INTO `tbl_cars_images`(`user_id`,`product_id`,`image_name`) VALUES ('" + alldata[0].id + "','" + car_id + "','" + img_name + "')";
         // console.log(query);
            results = await database.query(query, [] );  
    		 if (results) {
              res.writeHead(200, {'Content-Type': 'application/json'});
              var obj = {success : 1 , message : 'Image Uploaded Successfully!!'}
              res.end(JSON.stringify(obj));
             } else {                
             
                res.writeHead(200, {'Content-Type': 'application/json'});
                var obj = {success : 0 , message : 'Image Can not Uploaded!!'}
                res.end(JSON.stringify(obj));
             }
           	   
            });
          } else {
            res.writeHead(200, {'Content-Type': 'application/json'});
                var obj = {success : 0 , message : 'Image Size is Too Large!!'}
                res.end(JSON.stringify(obj));
          }
       
   } else {
      res.render('addcontent');
   }
 
});

app.get('/get_images', async function(req, res, next){

 var query = 'SELECT * FROM  tbl_cars_images where product_id = '+req.query.id;
 console.log(query)
     results = await database.query(query, [] );
       // res.writeHead(200, {'Content-Type': 'application/json'});
        res.send(results); 

})



app.get('/registration', async function(req, res, next) {
   
    var query = "select * from tbl_countries ORDER BY id ASC";
    results = await database.query(query, [] );
    res.render('sellbuy/registration', {
        title: 'Add content',
        data: JSON.parse(results)
    }) 
})

app.post('/register',async function(req, res, next){
            
    
      var cl = {
          
            user_name: req.sanitize('user_name').escape().trim(),
            email: req.sanitize('email_address').escape().trim(),
            password: req.sanitize('password').escape().trim(),
            country_id: req.sanitize('country').escape().trim(),
            state_id: req.sanitize('State').escape().trim(),
            postal_code: req.sanitize('postal_code').escape().trim(),
            role: 'U',
        }

       
            var query = 'INSERT INTO tbl_user  SET ? ';
            results = await database.query(query, [cl] );
                if (results) {
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    var obj = {success : 1 , message : 'Registration Done Successfully!!'}
                    res.end(JSON.stringify(obj));
                    
                } else {

                    res.writeHead(200, {'Content-Type': 'application/json'});
                    var obj = {success : 0 , message : 'Registration Failed!! '}
                    res.end(JSON.stringify(obj));
                    
                }
           
})

app.get('/login', function(req, res, next) {


  
    res.render('sellbuy/login', {
        title: 'Add content',
        
    }) 
})
var sess;
app.post('/user_login',async function(req, res, next){
       sess=req.session;
       sess.udata;
      
    //console.log(sess)
   

       var query = 'SELECT * FROM tbl_user Where user_name = "' + req.body.user_name + '" && password = "' + req.body.password  + '"';
      // console.log(query);
        results = await database.query(query, [] );
        //console.log(results.length);
        if(results.length > 0 ){
         
          sess.udata = JSON.parse(results);
        
        
       
                  res.writeHead(200, {'Content-Type': 'application/json'});
                  var obj = {success : 1 , message : 'Login Successfully!!'}
                  res.end(JSON.stringify(obj));
                  
              } else {

                  res.writeHead(200, {'Content-Type': 'application/json'});
                  var obj = {success : 0 , message : 'Login Failed!! '}
                  res.end(JSON.stringify(obj));
                  
              }

      
})

app.get('/sellcar', function(req, res, next) {
   // console.log(req.session.udata); 
 res.locals.udata = req.session.udata;
 var g = res.locals.udata;

if(g) {
        res.render('sellbuy/sellcar', {
            title: 'Add content',
             
    }) 
 } else{
    res.render('sellbuy/login', {
        title: 'Add content',
        
    }) 

 }
})

app.get('/logout', function (req, res) {
    req.session.destroy();

      res.redirect('/login');
  });

app.get('/show_states', async function(req, res, next) {
    var query = 'SELECT * FROM  tbl_states where country_id = '+req.query.id;
     results = await database.query(query, [] );
       // res.writeHead(200, {'Content-Type': 'application/json'});
        res.send(results);  
});


// Auth wiith google


app.get('/google_login', async function (req, res, next) {
  
 var query = 'SELECT * FROM  tbl_user where email =  "' + req.query.sid  +  '"';

  //console.log(query);
  results = await database.query(query, [] );

  if(results.length > 0){
   console.log(results.length);
   var sess;
   sess=req.session;
   sess.udata;
   sess.udata = JSON.parse(results);
   console.log(sess.udata)
  var query ='Update tbl_user SET google_id ="' + req.query.id + '" Where email="' + req.query.sid  +  '"';

  results = await database.query(query, [] );
	res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(JSON.stringify({success : 1 , message : 'Login Successfully'}));
    
  }else{
   
   var query = 'INSERT INTO tbl_user(google_id,user_name,email)VALUES("'+ req.query.id +'" ,"'+ req.query.vid +'" ,"' + req.query.sid  +  '")';
    results = await database.query(query, [] , true );
 	 var query = 'SELECT * FROM  tbl_user where email =  "' + req.query.sid  +  '" and google_id = "'+ req.query.id+'"';
	  results = await database.query(query, [] );

  	if(results.length > 0){
	   console.log(results.length);
	   var sess;
	   sess=req.session;
	   sess.udata;
	   sess.udata = JSON.parse(results);
	res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(JSON.stringify({success : 1 , message : 'Login Successfully'}));
   	}else{
   			res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(JSON.stringify({success : 0 , message : 'error while login'}));
   	}   

  }


})

app.get('/sellcars', function(req, res, next) {
  res.locals.udata = req.session.udata;
    res.render('sellbuy/upload_pictures', {
        title: 'Add content',
        
    }) 
})


app.get('/mycars',async function(req, res, next) {
    res.locals.udata = req.session.udata;
    var userdata = res.locals.udata
    var newdata =  JSON.stringify(userdata);
    var alldata = JSON.parse(newdata);
    var query = 'SELECT tbl_products.*,tbl_cars_images.image_name from tbl_products INNER JOIN tbl_cars_images ON tbl_cars_images.product_id = tbl_products.id where tbl_cars_images.user_id ="' + alldata[0].id + '" GROUP BY tbl_cars_images.product_id';
    results = await database.query(query, [] );
              res.render('sellbuy/my_cars', {
                  title: 'Add content',
                  data: JSON.parse(results)
              })
})


app.get('/all_product',async function(req, res, next){
 res.locals.udata = req.session.udata;
  var query = 'SELECT tbl_products.*,tbl_cars_images.image_name from tbl_products INNER JOIN tbl_cars_images ON tbl_cars_images.product_id = tbl_products.id where tbl_cars_images.product_id ="' +req.query.id + '" GROUP BY tbl_cars_images.image_name';
     results = await database.query(query, [] );
       //console.log(results);
    res.render('sellbuy/all_cars', {
                  title: 'Add content',
                  data: JSON.parse(results)
              })

        //console.log(data);
})

app.get('/featured_cars',async function(req, res, next){
 res.locals.udata = req.session.udata;
  var query = 'SELECT tbl_products.*,tbl_cars_images.image_name from tbl_products INNER JOIN tbl_cars_images ON tbl_cars_images.product_id = tbl_products.id GROUP BY tbl_cars_images.product_id';
     results = await database.query(query, [] );
       //console.log(results);
         res.render('sellbuy/featured_cars', {
                  title: 'Add content',
                  data: JSON.parse(results)
              })

        //console.log(data);
})



 var inserted_id;
app.post('/save_post',async function(req, res, next){
            
    
      var cl = {
          
              make_year: req.sanitize('make_year').escape().trim(),
               mileage: req.sanitize('mileage').escape().trim(),
                make: req.sanitize('make').escape().trim(),
                 model: req.sanitize('model').escape().trim(),
                  variant: req.sanitize('varient').escape().trim(),
                   color: req.sanitize('color').escape().trim(),
                    body_type: req.sanitize('body_type').escape().trim(),
                     fuel_type: req.sanitize('fuel_type').escape().trim(),
                      engine_size: req.sanitize('engine_size').escape().trim(),
                       fuel_consumption: req.sanitize('fuel_consumption').escape().trim(),
                        acceleration: req.sanitize('acceleration').escape().trim(),
                         gear_box: req.sanitize('gearbox').escape().trim(),
                          drive_train: req.sanitize('drivetrain').escape().trim(),
                           co2_emission: req.sanitize('emissions').escape().trim(),
                            doors: req.sanitize('doors').escape().trim(),
                             seats: req.sanitize('seats').escape().trim(),
                              insurance_group: req.sanitize('insurance_group').escape().trim(),
                               annual_tax: req.sanitize('annual_tax').escape().trim(),
                                private_trade: req.sanitize('private_trade').escape().trim(),
                                 owner: req.sanitize('owner').escape().trim(),
                                  price_expectation: req.sanitize('price_expect').escape().trim(),
                                   car_description: req.sanitize('car_desc').escape().trim(),
             
        }

       
            var query = 'INSERT INTO tbl_products  SET ? ';
            results = await database.query(query, [cl], true);
            
                if (results) {

                  var sql = 'SELECT LAST_INSERT_ID() as id;'
                   result = await database.query(sql);
          
                     
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    var obj = {success : 1 , message : 'Registration Done Successfully!!', product_id:result}
                    res.end(JSON.stringify(obj));
                    
                } else {

                    res.writeHead(200, {'Content-Type': 'application/json'});
                    var obj = {success : 0 , message : 'Registration Failed!! '}
                    res.end(JSON.stringify(obj));
                    
                }
           
})

// Kuldeep Sir Scrapping Code<!--- Starts-->

app.get('/search-cars', async function (req, res, next) {
     res.locals.udata = req.session.udata;
    res.render('sellbuy/second_search', {
        title: 'Search Cars',
        data: []
    })
})

app.get('/search-results', async function (req, res, next) {
 
    var q = url.parse(req.url, true).query;
    var path = 'https://www.autotrader.co.uk/car-search?postcode=wv23aq&make=' + q.make + '&model=' + q.model;
    axios.get(path)
            .then((response) => {
                if (response.status === 200) {
                    const html = response.data;
                    const $ = cheerio.load(html);
                    var filters = {};
                    var radius = {};
                    var make = {};
                    var model = {}
                    var model_variant = {}
                    $(html).find("select[name=radius] option").each(function (i, elem) {
                        radius[i] = {
                            value: $(this).val(),
                            text: $(this).text(),
                        }

                    });
                    $('.sf-flyout__scrollable-options').each(function (i, elem) {
                        filters[i] = {
                            filter: $(this).html(),
                        }
                    });
                    $(filters[0].filter).find(".js-value-button").each(function (i, elem) {
                        make[i] = {
                            value: $(this).data('selected-value'),
                            text: $(this).data('selected-display-name'),
                            count: $(this).find('span.count').text(),
                        }

                    });
                    $(filters[1].filter).find(".js-value-button").each(function (i, elem) {
                        model[i] = {
                            value: $(this).data('selected-value'),
                            text: $(this).data('selected-display-name'),
                            count: $(this).find('span.count').text(),
                        }

                    });
                    $(filters[2].filter).find(".js-value-button").each(function (i, elem) {
                        model_variant[i] = {
                            value: $(this).data('selected-value'),
                            text: $(this).data('selected-display-name'),
                            count: $(this).find('span.count').text(),
                        }

                    });
                    filters = {
                        radius: radius,
                        make: make,
                        model: model,
                        model_variant: model_variant,
                    }

                    var obj = {'cars': q, filters: filters}
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify(obj));
                }
            }, (error) => console.log(err));

})

app.get('/auto-search-results', async function (req, res, next) {
 
    var q = url.parse(req.url, true).query;
//    return;
    var makeModel;
    if (q.make) {
        if (q.model) {
            if (q.aggregatedTrim) {
                makeModel = [{Value: q.make, Models: [{value: q.model}], Trims: [{value: q.aggregatedTrim}]}]
            } else {
                makeModel = [{Value: q.make, Models: [{value: q.model}], Trims: []}]
            }
        } else {
            makeModel = [{Value: q.make, Models: [], Trims: []}]
        }
    } else {
        makeModel = []
    }
    var onesearchad;
    if (q.onesearchad == 'New') {
        onesearchad = 'New';
    } else if (q.onesearchad == 'Used') {
        onesearchad = 'Used&onesearchad=Nearly%20New';
    } else {
        onesearchad = 'Used&onesearchad=Nearly%20New&onesearchad=New';
    }
    var path = 'https://www.autotrader.co.uk/results-car-search?sort=' + q.sort + '&radius=' + q.radius + '&make=' + q.make + '&model=' + q.model + '&aggregatedTrim=' + q.aggregatedTrim + '&onesearchad=' + onesearchad
            + '&price-from=' + q.price_from + '&price-to=' + q.price_to + '&postcode=' + q.postal_code + '&year-from=' + q.year_from + '&year-to=' + q.year_to + '&minimum-mileage=' + q.mileage_from + '&maximum-mileage=' +
            q.mileage_to + '&body-type=' + q.body_type + '&fuel-type=' + q.fuel_type + '&minimum-badge-engine-size=' + q.minimum_badge_engine_size + '&maximum-badge-engine-size=' + q.maximum_badge_engine_size
            + '&fuel-consumption=' + q.fuel_consumption + '&zero-to-60=' + q.zero_to_60 + '&transmission=' + q.transmission + '&drivetrain=' + q.drivetrain + '&co2-emissions-cars='
            + q.co2_emissions_cars + '&quantity-of-doors=' + q.quantity_of_doors + '&minimum-seats=' + q.minimum_seats + '&maximum-seats=' + q.maximum_seats + '&insuranceGroup=' + q.insuranceGroup +
            '&annual-tax-cars=' + q.annual_tax_cars + '&colour=' + q.colour + '&seller-type=' + q.seller_type + '&page=' + q.page;
    axios.get(path)
            .then((response) => {
                if (response.status === 200) {
                    console.log('first response come')
                    const html = response.data;
                    const $ = cheerio.load(html);
                    var cars = {}, filters = {}, radius = {}, make = {}, model = {}, model_variant = {}, aggregatedTrim = {}, pages = []
                    $(html.html).find('li.search-page__result').each(function (i, elem) {
                        cars[i] = {
                            product_id: $(this).attr('id'),
                            name: $(this).find('h2').text().trim(),
                            image: $(this).find(".listing-main-image .js-click-handler img").attr('src'),
                            listings: $(this).find(".listing-key-specs").html(),
                            title: $(this).find("p.listing-attention-grabber").text(),
                            description: $(this).find("p").text(),
                            price: $(this).find(".vehicle-price").text(),
                        }
                    });
                    $(html.html).find('li.pagination--li').each(function (i, elem) {
                        pages[i] = {
                            page: $(this).text(),
                        }
                    });
                    $('<div>' + html.refinements.fields[0].html + '</div>').find(".value-button").each(function (i, elem) {
                        radius[i] = {
                            value: $(this).data('selected-value'),
                            text: $(this).data('selected-display-name'),
                        }
                    });
                    $('<div>' + html.refinements.fields[1].html + '</div>').find(".value-button").each(function (i, elem) {
                        make[i] = {
                            value: $(this).data('selected-value'),
                            text: $(this).data('selected-display-name'),
                            count: $(this).find('span').text().replace('(', '').replace(')', '').replace($(this).data('selected-display-name'), '')
                        }
                    });
                    $('<div>' + html.refinements.fields[2].html + '</div>').find(".value-button").each(function (i, elem) {
                        model[i] = {
                            value: $(this).data('selected-value'),
                            text: $(this).data('selected-display-name'),
                            count: $(this).find('span').text().replace('(', '').replace(')', '').replace($(this).data('selected-display-name'), ''),
                        }
                    });
                    $('<div>' + html.refinements.fields[3].html + '</div>').find(".value-button").each(function (i, elem) {
                        aggregatedTrim[i] = {
                            value: $(this).data('selected-value'),
                            text: $(this).data('selected-display-name'),
                            count: $(this).find('span').text(),
                        }
                    });
                    filters = {
                        radius: radius,
                        make: make,
                        model: model,
                        aggregatedTrim: aggregatedTrim
                    }
                    data = {
                        filters: filters,
                        html1: html.refinements,
                        params:q,
                        cars: cars,
                        path: path,
                        pages: pages
                    }
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify(data));
                }
            }
            , (error) => console.log(err));
})
app.get('/mot-search', async function (req, res, next) {
 
    var q = url.parse(req.url, true).query;
    var path = 'https://www.motors.co.uk/search/car/results';
    var makeModel;
    if (q.make) {
        if (q.model) {
            if (q.aggregatedTrim) {
                makeModel = [{Value: q.make, Models: [{value: q.model}], Trims: [{value: q.aggregatedTrim}]}]
            } else {
                makeModel = [{Value: q.make, Models: [{value: q.model}], Trims: []}]
            }
        } else {
            makeModel = [{Value: q.make, Models: [], Trims: []}]
        }
    } else {
        makeModel = []
    }
    var params = {
        "isNewSearch": true,
        "pagination":
                {
                    "TotalPages": 0,
                    "BasicResultCount": 334186,
                    "TotalRecords": 334186,
                    "FirstRecord": (q.page * 15) - 14,
                    "LastRecord": 15,
                    "CurrentPage": q.page,
                    "LastPage": 22280,
                    "PageSize": 15,
                    "PageLinksPerPage": 5,
                    "PageLinks": [
                        {"Name": "1", "Link": "1"},
                        {"Name": "2", "Link": "2"},
                        {"Name": "3", "Link": "3"},
                        {"Name": "4", "Link": "4"},
                        {"Name": "5", "Link": "5"}],
                    "FirstPageLink":
                            {
                                "Name": "1", "Link": "1"},
                    "Level": null,
                    "Variants": 0,
                    "CurrentPageLvl1": 1,
                    "CurrentPageLvl2": 1,
                    "CurrentPageLvl3": 1,
                    "CurrentPageLvl4": 1
                },
        "searchPanelParameters":
                {
                    "Doors": [],
                    "Seats": [],
                    "SafetyRatings": [],
                    "SelectedTopSpeed": null,
                    "SelectedPower": null,
                    "SelectedAcceleration": null,
                    "SelectedEngineSize": null,
                    "BodyStyles": [],
                    "MakeModels": makeModel,
                    "FuelTypes": [],
                    "Transmissions": [],
                    "Colours": [],
                    "IsPaymentSearch": false,
                    "IsReduced": false,
                    "IsHot": false,
                    "IsRecentlyAdded": false,
                    "IsRecommendedSearch": true,
                    "VoucherEnabled": false,
                    "IsGroupStock": false,
                    "PartExAvailable": false,
                    "IsPriceAndGo": false,
                    "IsPreReg": false,
                    "IsExDemo": false,
                    "ExcludeExFleet": false,
                    "ExcludeExHire": false,
                    "Keywords": [],
                    "SelectedInsuranceGroup": null,
                    "SelectedFuelEfficiency": null,
                    "SelectedCostAnnualTax": null,
                    "SelectedCO2Emission": null,
                    "SelectedTowingBrakedMax": null,
                    "SelectedTowingUnbrakedMax": null,
                    "SelectedAdvertType": "*",
                    "SelectedTankRange": null,
                    "DealerId": 0,
                    "Age": -1,
                    "Mileage": -1,
                    "MinPrice": -1,
                    "MaxPrice": -1,
                    "MinPaymentMonthlyCost": -1,
                    "MaxPaymentMonthlyCost": -1,
                    "PaymentTerm": 60,
                    "PaymentMileage": 10000,
                    "PaymentDeposit": 1000,
                    "SelectedSoldStatus": "both",
                    "SelectedBatteryRangeMiles": null,
                    "SelectedBatteryFastChargeMinutes": null,
                    "BatteryIsLeased": false,
                    "BatteryIsWarrantyWhenNew": false,
                    "ExcludeImports": false,
                    "ExcludeHistoryCatNCatD": false,
                    "ExcludeHistoryCatSCatC": false,
                    "ExcludedVehicles": [],
                    "Type": 1,
                    "PostCode": "N111NP",
                    "Distance": 1000,
                    "PaginationCurrentPage": 1,
                    "SortOrder": q.sort2,
                    "DealerGroupId": 0
                }
    }
    axios.post(path, params)
            .then((response) => {
//                console.log(response)
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(response.data.Results));
            }, (error) => console.log(error));
})
app.get('/motors-filter-search', async function (req, res, next) {
  
    var q = url.parse(req.url, true).query;
    var make = replaceString(q.make, '+', ' ')
    var makeModel;
    if (make) {
        if (q.model) {
            var model = replaceString(q.model, '+', ' ')
            if (q.aggregatedTrim) {
                var aggregatedTrim = replaceString(q.aggregatedTrim, '+', ' ')
                makeModel = [{Value: make, Models: [model], Trims: [aggregatedTrim]}]
            } else {
                makeModel = [{Value: make, Models: [model], Trims: []}]
            }
        } else {
            makeModel = [{Value: make, Models: [], Trims: []}]
        }
    } else {
        makeModel = []
    }
    console.log(makeModel)
    if (q.postal_code) {
        var postal_code = replaceString(q.postal_code, '+', '');
    } else {
        var postal_code = 'WV23AQ';
    }
    if (q.body_type != '') {
        var bodystyle =  [lowerCase(q.body_type)];
    }else{
        var bodystyle = [];
    }
    if (q.fuel_type != '') {
        var fuel_type =  [lowerCase(q.fuel_type)];
    }else{
        var fuel_type = [];
    }
    if(q.colour){
        var colour = [lowerCase(q.colour)]
    }else{
        var colour = [];
    }
    if(q.quantity_of_doors){
        var quantity_of_doors = [q.quantity_of_doors +' doors']
    }else{
        var quantity_of_doors = [];
    }
    if(q.transmission){
        var transmission = [replaceString(q.transmission , '-',' ')]
    }else{
        var transmission = [];
    }
    if(q.radius != ''){
      if(q.radius == '1500'){
        var radius = '1000'
      }else{
        var radius = q.radius
      }
    }else{
      var radius = []
    }
    var searchPanelParameters = {
        "Doors":quantity_of_doors,
        "Seats":[],
        "SafetyRatings":[],
        "SelectedTopSpeed":null,
        "SelectedPower":null,
        "SelectedAcceleration":null,
        "SelectedEngineSize":null,
        "BodyStyles":bodystyle,
        "MakeModels":makeModel,
        "FuelTypes":fuel_type,
        "Transmissions":transmission,
        "Colours":colour,
        "IsPaymentSearch":false,
        "IsReduced":false,
        "IsHot":false,
        "IsRecentlyAdded":false,
        "IsRecommendedSearch":true,
        "VoucherEnabled":false,
        "IsGroupStock":false,
        "PartExAvailable":false,
        "IsPriceAndGo":false,
        "IsPreReg":false,
        "IsExDemo":false,
        "ExcludeExFleet":false,
        "ExcludeExHire":false,
        "Keywords":[],
        "SelectedInsuranceGroup":null,
        "SelectedFuelEfficiency":replaceString(q.fuel_consumption , 'OVER_','')+'+',
        "SelectedCostAnnualTax":null,
        "SelectedCO2Emission":null,
        "SelectedTowingBrakedMax":null,
        "SelectedTowingUnbrakedMax":null,
        "SelectedAdvertType":"*",
        "SelectedTankRange":null,
        "DealerId":0,
        "Age":-1,
        "Mileage":-1,
        "MinPrice":-1,
        "MaxPrice":-1,
        "MinPaymentMonthlyCost":-1,
        "MaxPaymentMonthlyCost":-1,
        "PaymentTerm":60,
        "PaymentMileage":10000,
        "PaymentDeposit":1000,
        "SelectedSoldStatus":"both",
        "SelectedBatteryRangeMiles":null,
        "SelectedBatteryFastChargeMinutes":null,
        "BatteryIsLeased":false,
        "BatteryIsWarrantyWhenNew":false,
        "ExcludeImports":false,
        "ExcludeHistoryCatNCatD":false,
        "ExcludeHistoryCatSCatC":false,
        "ExcludedVehicles":[],
        "Type":1,
        "PostCode":postal_code,
        "Distance":radius,
        "PaginationCurrentPage":1,
        "SortOrder":0,
        "DealerGroupId":0
      }
    // var path2 = 'https://www.motors.co.uk/search/car/updatesearchpanel';
    var path2 = 'https://www.motors.co.uk/search/car/fastupdatesearchpanel';
    // console.log(path2)
    axios.post(path2, searchPanelParameters)
            .then((response) => {
//                console.log(response)
                // response.data['aaa'] = response
                res.setHeader('Content-Type', 'application/json');
//                console.log(searchPanelParameters)
                res.send(JSON.stringify({data: response.data, params: searchPanelParameters}));
            }, (error) => console.log(error));
})

app.get('/product_search', async function (req, res, next) {
    res.locals.udata = req.session.udata;
    var q = url.parse(req.url, true).query;
    var path = 'https://www.autotrader.co.uk/classified/advert/' + q.id;
    axios.get(path)
            .then((response) => {
                if (response.status === 200) {
                    const html = response.data;
                    const $ = cheerio.load(html);
                    var overview = [];
                    var thumbs = [];
                    var details = [];
                    var phones = [];
                    $('ul.keyFacts__list li').each(function (i, elem) {
                        overview[i] = {
                            view: $(this).html(),
                        }
                    });
                    $('.fpaImages__thumbs figure.fpaImages__thumb').each(function (i, elem) {
                        thumbs[i] = {
                            thumb: $(this).find('img').data('src'),
                        }
                    });
                    $('.seller_private__telephone').each(function (i, elem) {
                        phones[i] = {
                            phone: $(this).text(),
                        }
                    });
                    if (phones) {
                        phones = $(html).find('.seller_private__telephone').text();
                    }
                    $('section.fpaSpecifications .fpaSpecifications__expandingSection').each(function (i, elem) {
                        details[i] = {
                            detail_heading: $(this).find('h3').text(),
                            detail: $(this).find('.fpaSpecifications__list').html(),
                        }
                    });
                    var data = {
                        overview: overview,
                        desc: $(html).find(".fpa-description-text").text(),
                        thumbs: thumbs,
                        title: $(html).find("h1 span.vehicle-title__text").text(),
                        phones: $(html).find("section.seller_trade .seller_trade__telephone").text(),
                        phone2: $(html).find(".seller_private__telephone").text(),
                        price: $(html).find(".vehicle-price-info--total p").text(),
                        distance: $(html).find(".seller_private__location").text(),
                        details: details,
                    }
                    var obj = {'cars': q, 'data': data}
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify(obj));
                }
            }, (error) => console.log(err));
})


app.get('/show_product', function (req, res, next) {
     res.locals.udata = req.session.udata;
    var q = url.parse(req.url, true).query;
    var path = 'https://www.autotrader.co.uk/classified/advert/' + q.id + '?onesearchad=New&onesearchad=Nearly%20New&onesearchad=Used&postcode=cv12ue&advertising-location=at_cars&sort=sponsored&radius=1501&page=1';
    axios.get(path)
            .then((response) => {
                if (response.status === 200) {
                    const html = response.data;
                    const $ = cheerio.load(html);
                    var overview = [];
                    var thumbs = [];
                    var details = [];
                    var phones = [];
                    $('ul.keyFacts__list li').each(function (i, elem) {
                        overview[i] = {
                            view: $(this).find('span').text(),
                        }
                    });
                    $('.fpaImages__thumbs figure.fpaImages__thumb').each(function (i, elem) {
                        thumbs[i] = {
                            thumb:replaceString(replaceString($(this).find('img').data('src'), 'w92h69pe8e8e3', 'w720h540pe8e8e3'),'https','http'),
                        }
                    });
                    $('.seller_private__telephone').each(function (i, elem) {
                        phones[i] = {
                            phone: $(this).text(),
                        }
                    });
                    if (phones) {
                        phones = $(html).find('.seller_private__telephone').text();
                    }
                    $('section.fpaSpecifications .fpaSpecifications__expandingSection').each(function (i, elem) {
                        details[i] = {
                            detail_heading: $(this).find('h3').text(),
                            detail:  replaceString($(this).find('.fpaSpecifications__list').html(), '_', ''),
                        }
                    });
                    var data = {
                        overview: overview,
                        desc: $(html).find(".fpa-description-text").text(),
                        thumbs: thumbs,
                        title: $(html).find("h1 span.vehicle-title__text").text(),
                        phones: $(html).find("section.seller_trade .seller_trade__telephone").text(),
                        phone2: $(html).find(".seller_private__telephone").text(),
                        price: $(html).find(".vehicle-price-info--total p").text(),
                        distance: $(html).find(".seller_private__location").text(),
                        details: details,
                    }
                    var obj = {'cars': q, 'data': data}
                    res.render('sellbuy/product_view', {
                        title: 'Search Cars',
                        data: data
                    })
//                    res.writeHead(200, {'Content-Type': 'application/json'});
//                    res.end(JSON.stringify(obj));
                }
            }, (error) => console.log(err));
})

app.get('/motView', async function (req, res, next) {
    var q = url.parse(req.url, true).query;
    var path = 'https://www.motors.co.uk/car-' + q.id + '/?i=3&m=vdn';
    // var path = 'https://www.motors.co.uk/car-51623111/?i=0&m=srf';
    await axios.get(path)
            .then((response) => {
                if (response.status === 200) {
                    const html = response.data;
                    const $ = cheerio.load(html);
                    var thumbs = [];
                    var icons = []
                    var specs = []
                    var details = []
                    var detailsd = []
                    $(html).find('#dpvGallery').find('li').each(function (i, elem) {
                        thumbs[i] = {
                            thumb: replaceString($(this).find('img').attr('src'),'f.jpg','.jpg'),
                        }
                    });
                    $(html).find('.spec__icons').find('li').each(function (i, elem) {
                      if($(this).find('span.spec__caption').text()){
                        icons[i] = {
                            icon: $(this).find('span.icon').attr('class'),
                            iconval: $(this).find('span.spec__caption').text(),
                            iconvalue:$(this).find('div').text()
                        }
                      }
                    });
                    $(html).find('.spec__highlight').find('li').each(function (i, elem) {
                        specs[i] = {
                            name: $(this).find('span.highlight__caption').text(),
                            value: $(this).find('span.highlight__figure').text(),
                        }
                    });
                    $(html).find('.accordion-pane ul li').each(function (i, elem) {
                      if($(this).find('a').text()){
                         details[i] = {
                              detail_heading: $(this).find('a').text(),
                              id: 'panel-'+$(this).find('a').data('tab'),
                          }
                      }
                    });
                    $(html).find('.accordion-pane section').each(function (i, elem) {
                         detailsd[i] = {
                              detail:  $(this).html(),
                              id: $(this).attr('id'),
                          }
                    });
                    var data = {
//                        overview: overview,
                        desc: $(html).find("p,vehicle__sub").text(),
                       thumbs: thumbs,
                        title: $(html).find("header h1.vdp-header__vehicle-name").text(),
                        phones: '01403 858697',//$(html).find(".cta-button__item").html(),
//                        phone2: $(html).find(".seller_private__telephone").text(),
                        price: $(html).find("h2.vdp-header__full-price").text(),
//                        distance: $(html).find(".seller_private__location").text(),
                       details: details,
                       detailsd:detailsd,
                        icons:icons,
                        specs:specs
                    }
                    // var obj = {'data': data }
                    // console.log(data.phones)
                      res.render('sellbuy/mot_product_view', {
                          title: 'Search Cars',
                          data: data
                      })
                    //  res.writeHead(200, {'Content-Type': 'application/json'});
                    // res.end(JSON.stringify(obj));
                }
            }, (error) => console.log(err));
})
 // facebook login
app.get('/facebook_login',async function(req, res, next) {
  console.log('Here');
  var query = 'SELECT * FROM  tbl_user where email =  "' + req.query.sid  +  '"';

  //console.log(query);
  results = await database.query(query, [] );

  if(results.length > 0){
   console.log(results.length);
   var sess;
   sess=req.session;
   sess.udata;
   sess.udata = JSON.parse(results);
   console.log(sess.udata)
  var query ='Update tbl_user SET facebook_id ="' + req.query.id + '" Where email="' + req.query.sid  +  '"';

  results = await database.query(query, [] );
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(JSON.stringify({success : 1 , message : 'Login Successfully'}));
    
  }else{
   
   var query = 'INSERT INTO tbl_user(facebook_id,user_name,email)VALUES("'+ req.query.id +'" ,"'+ req.query.vid +'" ,"' + req.query.sid  +  '")';
    results = await database.query(query, [] , true );
   var query = 'SELECT * FROM  tbl_user where email =  "' + req.query.sid  +  '" and facebook_id = "'+ req.query.id+'"';
    results = await database.query(query, [] );

    if(results.length > 0){
     console.log(results.length);
     var sess;
     sess=req.session;
     sess.udata;
     sess.udata = JSON.parse(results);
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(JSON.stringify({success : 1 , message : 'Login Successfully'}));
    }else{
        res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(JSON.stringify({success : 0 , message : 'error while login'}));
    }   

  }

})


module.exports = app;