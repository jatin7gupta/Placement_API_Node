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

var cors = require('cors');

app.use(cors());

winston.add(winston.transports.File, {filename: 'appLog.log'}); //logging in appLog.log file

//imports
Students = require('./models/student');
Companies = require('./models/company');
Registrations = require('./models/registration');

mongoose.connect('mongodb://localhost/placement'); // connecting to mongoDB
//var db = mongoose.connection;

var departmentList = ['cse', 'ece', 'eee', 'me', 'cv'];

errors.create({
    name : 'FailedNameValidation',
    code: 1,
    defaultMessage : 'Invalid Name',
    defaultExplanation : 'The String is not a valid Name. It must be more than 2 characters and below 70 characters',
    defaultResponse : 'Unable to complete the query, change the name and try again'
});
errors.create({
    name : 'FailedDepartmentValidation',
    code: 2,
    defaultMessage : 'Invalid Department',
    defaultExplanation : 'The String is not a valid Department. It must be from the following cse, ece, eee, me, cv',
    defaultResponse : 'Unable to complete the query, change the department and try again'
});
errors.create({
    name : 'FailedRollnoValidation',
    code: 3,
    defaultMessage : 'Invalid Rollno',
    defaultExplanation : 'The String is not a valid Rollno. It must be an integer',
    defaultResponse : 'Unable to complete the query, corrent the Rollno and try again'
});
errors.create({
    name : 'FailedCGPAValidation',
    code: 4,
    defaultMessage : 'Invalid CGPA',
    defaultExplanation : 'The String is not a valid cgpa. It must be a float between 0.1 - 10.0',
    defaultResponse : 'Unable to complete the query, correct the cgpa and try again'
});
errors.create({
    name : 'RequiredFiledNotSet',
    code: 5,
    defaultMessage : 'Required Field not set',
    defaultExplanation : 'The JSON provided does not set the required fields',
    defaultResponse : 'Unable to complete the query, fill the required fields and try again'
});
errors.create({
    name : 'FailedDateValidation',
    code: 6,
    defaultMessage : 'Invalid Date or You cant register',
    defaultExplanation : 'The String is not a valid Date. It must be a in the format of MM-DD-YYYY',
    defaultResponse : 'Unable to complete the query, fill the required fields in correct format and try again'
});
errors.create({
    name : 'FailedMongoIdValidation',
    code: 7,
    defaultMessage : 'Invalid Mongo ID',
    defaultExplanation : 'The String is not a valid Mongo ID',
    defaultResponse : 'Unable to complete the query, fill the required Mongo Id in correct format and try again'
});


app.get('/', function(req,res){
    winston.log('info', "Status Code :"+res.statusCode );
    res.send('Placement APIs'); //default page of the APIs
});

app.listen(3000); // It will be seen by typing this in browser http://localhost:3000/
console.log("Started running on Port 3000"); // the app will run on port 3000, and this will indicate the success of it

//Get Methods
app.get('/api/students', function (req,res) { //get Students
    Students.getStudents(function (err,students) {
        if(err){
            winston.log('info', "Status Code :"+res.statusCode );
            winston.log('error', err);
            winston.log('error', "getStudents() : " +err);
            throw err;
        }
        winston.log('info', "Status Code :"+res.statusCode );
        winston.log('info', students);
        res.json(students);
    })
});

app.get('/api/companies', function (req,res) { //get Companies
    Companies.getCompanies(function (err,companies) {
        if(err){
            winston.log('info', "Status Code :"+res.statusCode );
            winston.log('error', err);
            winston.log('error', "getCompanies() : " +err);
            throw err;
        }
        winston.log('info', "Status Code :"+res.statusCode );
        winston.log('info', companies);
        res.json(companies);
    })
});

app.get('/api/registrations', function (req, res) {
   Registrations.getRegistrations(function (err, registrations) {
       console.log(registrations);
     if(err){
         winston.log('info', "Status Code :"+res.statusCode );
         winston.log('error', err);
         winston.log('error', "getRegistrations() : " +err);
         throw err;
     }
       winston.log('info', "Status Code :"+res.statusCode );
       winston.log('info', registrations);
       res.json(registrations);
   });
});


//Post Methods
app.post('/api/students/add', function (req , res) { //add student
    var student = req.body;

    if(student.hasOwnProperty("name") && student.hasOwnProperty("department") && student.hasOwnProperty("rollno") && student.hasOwnProperty("cgpa")){
        if(!validator.isByteLength(student.name, {min:2, max:70})){ //Minimum name size is 2 and max is 70 char
            res.send(new errors.FailedNameValidation().toString());
            return;
        }
        if(!validator.isIn(student.department.toLowerCase(), departmentList)){
            res.send(new errors.FailedDepartmentValidation().toString()); // only these values supported
            return;
        }
        if(!validator.isInt(student.rollno)){ //rollnumber must be a Integer
            res.send(new errors.FailedRollnoValidation().toString());
            return;
        }
        if(!validator.isFloat(student.cgpa, {min: 0.1, max : 10.0})){ //enter CGPA between 0.1 and 10 only
            res.send(new errors.FailedCGPAValidation().toString());
            return;
        }

        //if everything is checked then, it shall add the data
        Students.addStudent(student, function (err, student) {
            if(err){
                winston.log('info', "Status Code :"+res.statusCode );
                winston.log('error', err);
                winston.log('error', "addStudent() : " +err);
                throw err;
            }
            winston.log('info', "Status Code :"+res.statusCode );
            winston.log('info', student);
            res.json(student);
        });
    }
    else {
        res.send(new errors.RequiredFieldNotSet().toString());
    }

});

app.post('/api/companies/add', function (req, res) { //add company
    var company = req.body;

    if(company.hasOwnProperty("name") && company.hasOwnProperty("date_of_Placement")){
        if(!validator.isByteLength(company.name, {min:2, max:70})){ //Minimum name of company size is 2 and max is 70 char
            res.send(new errors.FailedNameValidation().toString());
            return;
        }
        if(!validator.isAfter(company.date_of_Placement)){ //VALIDATE DATE
            res.send(new error.FailedDateValidation().toString());
            return;
        }
        Companies.addCompany(company, function (err, company) {
            if(err){
                winston.log('info', "Status Code :"+res.statusCode );
                winston.log('error', err);
                winston.log('error', "addCompany() : " +err);
                throw err;
            }
            winston.log('info', "Status Code :"+res.statusCode );
            winston.log('info', company);
            res.json(company);
        });
    }else {
        res.send(new error.RequiredFieldNotSet().toString());
    }
});

app.post('/api/companies/update', function (req, res) { //update company
    var company = req.body;
    var reqId = req.query.id;
    var reqName = req.query.name;
    var reqDate = req.query.date_of_Placement;

    var dbQuery = {};
    if(reqId !== undefined) { //check if the request id is correct or not
        if (validator.isMongoId(reqId)) {
            dbQuery._id = ObjectID(reqId); //if correct put it in dbQuery object for searching the db
            console.log(dbQuery._id);
        }
        else {
            res.send(new errors.FailedMongoIdValidation());
            return;
        }
    }
    if(reqName !== undefined){
        if(validator.isByteLength(reqName, {min:2, max:70})){
            dbQuery.name = reqName;
        }
        else{
            res.send(new errors.FailedNameValidation());
            return;
        }
    }
    if(reqDate !== undefined){
        if(!validator.isAfter(reqDate)){ //VALIDATE DATE
            res.send(new error.FailedDateValidation().toString());
            return;
        }
        dbQuery.date_of_Placement = reqDate;
    }

    if(company.hasOwnProperty("name")) {
        if(!validator.isByteLength(company.name, {min:2, max:70})){ //Minimum name of company size is 2 and max is 70 char
            res.send(new errors.FailedNameValidation().toString());
            return;
        }
    }
    if(company.hasOwnProperty("date_of_Placement")){
        if(!validator.isAfter(company.date_of_Placement)){ //VALIDATE DATE
            res.send(new error.FailedDateValidation().toString());
            return;
        }

    }else {
        console.log('activitated');
        res.send(new error.RequiredFieldNotSet().toString());
    }
    Companies.updateCompany(dbQuery, company, function (err, company) {
        if(err){
            winston.log('info', "Status Code :"+res.statusCode );
            winston.log('error', err);
            winston.log('error', "addCompany() : " +err);
            throw err;
        }
        winston.log('info', "Status Code :"+res.statusCode );
        winston.log('info', company);
        res.json(company);

    });
});

app.post('/api/students/update', function (req, res) { //update student
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
            res.send(new errors.FailedMongoIdValidation());
            return;
        }
    }
    if(reqName !== undefined){
        if(validator.isByteLength(reqName, {min:2, max:70})){
            dbQuery.name = reqName;
        }
        else{
            res.send(new errors.FailedNameValidation());
            return;
        }
    }
    if(reqDepartment !== undefined){
        if(validator.isIn(reqDepartment.toLowerCase(), departmentList)){
            dbQuery.department = reqDepartment.toLowerCase();
        }
        else {
            res.send(new errors.FailedDepartmentValidation());
            return;
        }
    }
    if(reqRollNo !== undefined){
        if(validator.isInt(reqRollNo)){
            dbQuery.rollno = reqRollNo;
        }
        else {
            res.send(new errors.FailedRollnoValidation());
            return;
        }
    }
    if(reqCgpa !== undefined){
        if(validator.isFloat(reqCgpa,  {min: 0.1, max : 10.0})){
            dbQuery.cgpa = reqCgpa;
        }
        else{
            res.send(new errors.FailedCGPAValidation());
            return;
        }
    }
    if( student.hasOwnProperty('name')){
        if(!validator.isByteLength(student.name, {min:2, max:70})){
            res.send(new errors.FailedNameValidation());
            return;
        }
    }
    if(student.hasOwnProperty('department')){
        if(!validator.isIn(student.department.toLowerCase(), departmentList)){
            res.send(new errors.FailedDepartmentValidation());
            return;
        }
    }
    if(student.hasOwnProperty('rollno')){
        if(!validator.isInt(student.rollno)){
            res.send(new errors.FailedRollnoValidation());
            return;
        }
    }
    if(student.hasOwnProperty('cgpa')){
        if(!validator.isFloat(student.cgpa,  {min: 0.1, max : 10.0})){
            res.send(new errors.FailedCGPAValidation());
            return;
        }
    }
    Students.updateStudents(dbQuery, student, function (err, students) {
        if(err){
            winston.log('info', "Status Code :"+res.statusCode );
            winston.log('error', err);
            winston.log('error', "updateStudents() : " +err);
            throw err;
        }
        winston.log('info', "Status Code :"+res.statusCode );
        winston.log('info', students);
        res.json(students);
    });
});

app.post('/api/students/register', function (req, res) {
   var req_sId = req.query.sId;
   var req_cId = req.query.cId;

   if(!(validator.isMongoId(req_sId)&& validator.isMongoId(req_cId))){
       res.send(new errors.FailedMongoIdValidation());
       return;
   }
   var dbQuery = {};
   if(req_cId !== undefined && req_sId !== undefined){
       dbQuery.sId = ObjectID(req_sId);
       dbQuery.cId = ObjectID(req_cId);
       Registrations.apply(dbQuery, function (err, query_res) {
          if(err){
              winston.log('info', "Status Code :"+res.statusCode );
              winston.log('error', err);
              winston.log('error', "apply() : " +err);
              throw err;
          }
           winston.log('info', "Status Code :"+res.statusCode );
           winston.log('info', query_res);
           res.json(query_res);
       });
   }else{
       res.send(new errors.RequiredFieldNotSet());
   }
});


//delete functions
//delete students
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
            res.send(new errors.FailedMongoIdValidation());
            return;
        }
    }
    if(reqName !== undefined){
        if(validator.isByteLength(reqName, {min:2, max:70})){
            dbQuery.name = reqName;
        }
        else{
            res.send(new errors.FailedNameValidation());
            return;
        }
    }
    if(reqDepartment !== undefined){
        if(validator.isIn(reqDepartment.toLowerCase(), departmentList)){
            dbQuery.department = reqDepartment;
        }
        else {
            res.send(new errors.FailedDepartmentValidation());
            return;
        }
    }
    if(reqRollNo !== undefined){
        if(validator.isInt(reqRollNo)){
            dbQuery.rollno = reqRollNo;
        }
        else {
            res.send(new errors.FailedRollnoValidation());
            return;
        }
    }
    if(reqCgpa !== undefined){
        if(validator.isFloat(reqCgpa,  {min: 0.1, max : 10.0})){
            dbQuery.cgpa = reqCgpa;
        }
        else{
            res.send(new errors.FailedCGPAValidation());
            return;
        }
    }

    Students.removeStudents(dbQuery, function (err, student) {
        if(err){
            winston.log('info', "Status Code :"+res.statusCode );
            winston.log('error', err);
            winston.log('error', "deleteStudents() : " +err);
            throw err;
        }
        winston.log('info', "Status Code :"+res.statusCode );
        winston.log('info', student);
        res.json(student);
    })

});

//delete company
app.delete('/api/companies/remove', function (req, res) {
    var cId = req.query.id;
    var dbQueryReg = {};
    if (cId !== undefined) {
        if (!validator.isMongoId(cId)) {
            res.send(new errors.FailedMongoIdValidation());
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
                    winston.log('info', "Status Code :"+res.statusCode );
                    winston.log('error', err);
                    winston.log('error', "removeRegistrations() : " +err);
                    throw err;
                }
                winston.log('info', "Status Code :"+res.statusCode );
                winston.log('info', registration);
                winston.log('info', company);
                res.json(registration + " " + company); // Cannot send 2 responses to the client
            });
        });
    }
    else{
        res.send(new errors.FailedMongoIdValidation());
    }
});

//unregister student
app.delete('/api/students/unregister', function (req, res) {
    var sId = req.query.sId;
    var cId = req.query.cId;
    var dbQuery = {};
    if(cId !== undefined && sId !== undefined){
        if(!validator.isMongoId(cId)){
            res.send(new errors.FailedMongoIdValidation());
            return;
        }
        if(!validator.isMongoId(sId)){
            res.send(new errors.FailedMongoIdValidation());
            return;
        }
        dbQuery.sId = ObjectID(sId);
        dbQuery.cId = ObjectID(cId);
        Registrations.removeRegistration(dbQuery, function (err, registration) {
           if(err){
               winston.log('info', "Status Code :"+res.statusCode );
               winston.log('error', err);
               winston.log('error', "removeRegistration() : " +err);
               throw err;
           }
            winston.log('info', "Status Code :"+res.statusCode );
            winston.log('info', registration);
           res.json(registration);
        });
    }else{
        res.send(new errors.FailedMongoIdValidation());
    }

});