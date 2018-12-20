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


app.get('/admin', function(req, res, next) {
    
        res.render('admin/index', {
            title: 'Add content',
            
        }) 
})
module.exports = app
