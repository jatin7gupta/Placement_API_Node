var mongoose=require('mongoose');

var studentSchema = mongoose.Schema({
    name:{
        type : String, //The name will be a string value and it is absolutely required for any function to be performed
        required : true
    },
    department:{
        type : String, //as per given document
        required : true
    },
    rollno:{
        type : Number, //as per given document
        required : true
    },
    cgpa:{
        type : Number, //as per given document
        required : true
    }
});


var Students = module.exports = mongoose.model('Student', studentSchema);

//get Students

module.exports.getStudents = function (callback,limit) { //get all students
  Students.find(callback).limit(limit);
};

module.exports.addStudent = function (student, callback) { //add student
  Students.create(student, callback);
};

module.exports.updateStudents = function (dbQuery, student, callback) { //multi update
    Students.update(dbQuery, student, {multi : true }, callback);
};

module.exports.deleteStudents = function (dbQuery, callback) {
  Students.remove(dbQuery, callback);
};





