var express = require('express'); // initializing packages

var app = express();

var bodyParser = require('body-parser');

var mongoose = require('mongoose');

var mongo = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

var ObjectId = require('mongoose').ObjectID;

var validator = require('validator');

var errors = require('errors');

var winston = require('winston');

app.use(bodyParser.json());

winston.add(winston.transports.File, {filename: 'appLog.log'});


Students = require('./models/student');
Companies = require('./models/company');
Registrations = require('./models/registration');

mongoose.connect('mongodb://localhost/placement'); // connecting to mongoDB
var db = mongoose.connection;

var departmentList = ['cse', 'ece', 'eee', 'me', 'cv'];

app.get('/', function(req,res){
    res.send('Placement APIs'); //default page of the APIs
});

app.listen(3000); // It will be seen by typing this in browser http://localhost:3000/
console.log("Started running on Port 3000"); // the app will run on port 3000, and this will indicate the success of it

//Get Methods
//-----------------------------------------------------------
app.get('/api/students', function (req,res) { //get Students
    Students.getStudents(function (err,students) {
        if(err){
            winston.log('error', err);
            winston.log('error', "getStudents() : " +err);
            throw err;
        }
        winston.log('info', students);
        res.json(students);
    })
});

app.get('/api/Companies', function (req,res) { //get Companies
    Companies.getCompanies(function (err,companies) {
        if(err){
            winston.log('error', err);
            winston.log('error', "getCompanies() : " +err);
            throw err;
        }
        winston.log('info', companies);
        res.json(companies);
    })
});

app.get('/api/registrations', function (req, res) {
   Registrations.getRegistrations(function (err, registrations) {
     if(err){
         winston.log('error', err);
         winston.log('error', "getRegistrations() : " +err);
         throw err;
     }
       winston.log('info', registrations);
     res.json(registrations);
   });
});


//Post Methods
app.post('/api/students/add', function (req , res) {
    var student = req.body;

    if(student.hasOwnProperty("name") && student.hasOwnProperty("department") && student.hasOwnProperty("rollno") && student.hasOwnProperty("cgpa")){
        if(!validator.isByteLength(student.name, {min:2, max:70})){ //Minimum name size is 2 and max is 70 char
            res.send("Please Enter name only");
            return;
        }
        if(!validator.isIn(student.department.toLowerCase(), departmentList)){
            res.send('Kindly put the value between cse, ece, eee, me, cv'); // only these values supported
            return;
        }
        if(!validator.isInt(student.rollno)){ //rollnumber must be a Integer
            res.send("Enter only numeric values");
            return;
        }
        if(!validator.isFloat(student.cgpa, {min: 0.1, max : 10.0})){ //enter CGPA between 0.1 and 10 only
            res.send("CGPA entered is not valid, enter it between 0.1 - 10.0");
            return;
        }

        //if everything is checked then, it shall add the data
        Students.addStudent(student, function (err, student) {
            if(err){
                winston.log('error', err);
                winston.log('error', "addStudent() : " +err);
                throw err;
            }
            winston.log('info', student);
            res.json(student);
        });
    }
    else {
        res.send('Required fields not set');
    }

});

app.post('/api/companies/add', function (req, res) {
    var company = req.body;
    if(company.hasOwnProperty("name") && company.hasOwnProperty("date_of_Placement")){
        if(!validator.isByteLength(company.name, {min:2, max:70})){ //Minimum name of company size is 2 and max is 70 char
            res.send("Please Enter company names only");
            return;
        }
        if(!validator.isAfter(company.date_of_Placement)){
            res.send('Please enter a Valid date');
            return;
        }
        Companies.addCompany(company, function (err, company) {
            if(err){
                winston.log('error', err);
                winston.log('error', "addCompany() : " +err);
                throw err;
            }
            winston.log('info', company);
            res.json(company);
        });
    }else {
        res.send('Required Fields not set');
    }
}); //add company

app.post('/api/students/update', function (req, res) {
    var student = req.body;
    var reqId = req.query.id;
    var reqName = req.query.name;
    var reqDepartment = req.query.department;
    var reqCgpa = req.query.cgpa;
    var reqRollNo = req.query.rollno;

    var dbQuery = {};

    if(reqId !== undefined) { //check if the request id is correct or not
        if (validator.isMongoId(reqId)) {
            dbQuery._id = ObjectID(reqId); //if correct put it in dbQuery object for searching the db
        }
        else {
            res.send('The ID is wrong in the query');
            return;
        }
    }
    if(reqName !== undefined){
        if(validator.isByteLength(reqName, {min:2, max:70})){
            dbQuery.name = reqName;
        }
        else{
            res.send('The Name is invalid');
            return;
        }
    }
    if(reqDepartment !== undefined){
        if(validator.isIn(reqDepartment.toLowerCase(), departmentList)){
            dbQuery.department = reqDepartment;
        }
        else {
            res.send('This Department is invalid');
            return;
        }
    }
    if(reqRollNo !== undefined){
        if(validator.isInt(reqRollNo)){
            dbQuery.rollno = reqRollNo;
        }
        else {
            res.send('This roll is invalid'); //FIX THIS
        }
    }
    if(reqCgpa !== undefined){ //fix this
        if(validator.isFloat(reqCgpa,  {min: 0.1, max : 10.0})){
            dbQuery.cgpa = reqCgpa;
        }
        else{
            return;
        }
    }
    if( student.hasOwnProperty('name')){
        if(!validator.isByteLength(student.name, {min:2, max:70})){
            res.send('this is invalid name');
            return;
        }
    }
    if(student.hasOwnProperty('department')){
        if(!validator.isIn(student.department.toLowerCase(), departmentList)){
            res.send("invalid dept");
            return;
        }
    }
    if(student.hasOwnProperty('rollno')){ //fix this
        if(!validator.isInt(student.rollno)){
            res.send('invalid rollno');
            return;
        }
    }
    if(student.hasOwnProperty('cgpa')){ // fix this
        if(!validator.isFloat(student.cgpa,  {min: 0.1, max : 10.0})){
            res.send('invalid cgpa');
            return;
        }
    }
    Students.updateStudents(dbQuery, student, function (err, students) {
        if(err){
            winston.log('error', err);
            winston.log('error', "updateStudents() : " +err);
            throw err;
        }
        winston.log('info', students);
        res.json(students);
    });
});


//apply function
app.post('/api/students/apply', function (req, res) { //not working
   var req_sId = req.query.sId;
   var req_cId = req.query.cId;

   if(!(validator.isMongoId(req_sId)&& validator.isMongoId(req_cId))){
       res.send('invalid ids');
       return;
   }
   var dbQuery = {};
   if(req_cId !== undefined && req_sId !== undefined){
       dbQuery.sId = ObjectID(req_sId);
       dbQuery.cId = ObjectID(req_cId);
       Registrations.apply(dbQuery, function (err, query_res) {
          if(err){
              winston.log('error', err);
              winston.log('error', "apply() : " +err);
              throw err;
          }
           winston.log('info', query_res);
          res.json(query_res);
       });
   }else{
       res.send('Invalid Query Parameters');
   }
});// Check if the student and company exists or not then update



//delete functions
app.delete('/api/students/remove', function (req, res) {
    var reqId = req.query.id;
    var reqName = req.query.name;
    var reqDepartment = req.query.department;
    var reqCgpa = req.query.cgpa;
    var reqRollNo = req.query.rollno;
    var dbQuery = {};

    if(reqId !== undefined) { //check if the request id is correct or not
        if (validator.isMongoId(reqId)) {
            dbQuery._id = ObjectID(reqId); //if correct put it in dbQuery object for searching the db
        }
        else {
            res.send('The ID is wrong in the query');
            return;
        }
    }
    if(reqName !== undefined){
        if(validator.isByteLength(reqName, {min:2, max:70})){
            dbQuery.name = reqName;
        }
        else{
            res.send('The Name is invalid');
            return;
        }
    }
    if(reqDepartment !== undefined){
        if(validator.isIn(reqDepartment.toLowerCase(), departmentList)){
            dbQuery.department = reqDepartment;
        }
        else {
            res.send('This Department is invalid');
            return;
        }
    }
    if(reqRollNo !== undefined){
        if(validator.isInt(reqRollNo)){
            dbQuery.rollno = reqRollNo;
        }
        else {
            res.send('This roll is invalid'); //FIX THIS
        }
    }
    if(reqCgpa !== undefined){ //fix this
        if(validator.isFloat(reqCgpa,  {min: 0.1, max : 10.0})){
            dbQuery.cgpa = reqCgpa;
        }
        else{
            return;
        }
    }

    Students.deleteStudents(dbQuery, function (err, student) {
        if(err){
            winston.log('error', err);
            winston.log('error', "deleteStudents() : " +err);
            throw err;
        }
        winston.log('info', student);
        res.json(student);
    })

});

//delete company
app.delete('/api/companies/remove', function (req, res) { //not working
    var cId = req.query.id;
    var dbQueryReg = {};
    if (cId !== undefined) {
        if (!validator.isMongoId(cId)) {
            res.send('Invalid company id');
            return;
        }
        dbQueryReg.cId = ObjectID(cId); //if correct put it in dbQuery object for searching the db
        var dbQueryCom = {};
        dbQueryCom._id = ObjectID(cId);
        Companies.removeCompany(dbQueryCom, function (err, company) {
            if (err) {
                winston.log('error', err);
                winston.log('error', "removeCompany() : " +err);
                throw err;
            }
            Registrations.removeRegistration(dbQueryReg, function (err, registration) {
                if (err) {
                    winston.log('error', err);
                    winston.log('error', "removeRegistrations() : " +err);
                    throw err;
                }
                winston.log('info', registration);
                winston.log('info', company);
                res.json(registration + " " + company); // Cannot send 2 responses to the client
                //res.json(company);
            });
        });
    }
    else{
        res.send('Invalid parameters');
    }
});

//deregister student
app.delete('/api/students/unregister', function (req, res) {
    var sId = req.query.sId;
    var cId = req.query.cId;
    var dbQuery = {};
    if(cId !== undefined && sId !== undefined){
        if(!validator.isMongoId(cId)){
            res.send('Invalid id');
            return;
        }
        if(!validator.isMongoId(sId)){
            res.send('Invalid id');
            return;
        }
        dbQuery.sId = ObjectID(sId);
        dbQuery.cId = ObjectID(cId);
        Registrations.removeRegistration(dbQuery, function (err, registration) {
           if(err){
               winston.log('error', err);
               winston.log('error', "removeRegistration() : " +err);
               throw err;
           }
            winston.log('info', registration);
           res.json(registration);
        });
    }

});