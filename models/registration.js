var mongoose = require('mongoose');

var registrationSchema = mongoose.Schema({
    //studentId : mongoose.Schema.Types.ObjectID,
   // companyId : mongoose.Schema.Types.ObjectID,
    studentId : String,
    companyId : String,
    updated_date : {type:Date, default : Date.now}
});

var Registrations = module.exports = mongoose.model('Registration', registrationSchema);

//register
module.exports.apply = function (registration, callback) {
    Registrations.update(registration, registration, {upsert : true, setDefaultsOnInsert: true}, callback);
};

//get registrations
module.exports.getRegistrations = function (query, callback) {
  Registrations.find(query, callback).limit(limit);
};

module.exports.removeRegistration = function (query, callback) {
  Registrations.remove(query, callback);
};