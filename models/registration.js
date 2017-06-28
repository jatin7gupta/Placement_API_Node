var mongoose = require('mongoose');

var registrationSchema = mongoose.Schema({
    sId : mongoose.Schema.Types.ObjectId,
    cId : mongoose.Schema.Types.ObjectId,
    updated_date : {type:Date, default : Date.now}
});

var Registrations = module.exports = mongoose.model('Registration', registrationSchema);

//register
module.exports.apply = function (registration, callback) { //used update because one student cant register again
    Registrations.update(registration, registration, {upsert : true, setDefaultsOnInsert: true}, callback); //Check this!!
}; // using UPSERT: If set to true, creates a new document when no document matches the query criteria. The default value is false, which does not insert a new document when no match is found.

//get registrations
module.exports.getRegistrations = function (callback, limit) {
  Registrations.find(callback).limit(limit);
};

module.exports.removeRegistration = function (query, callback) {
  Registrations.remove(query, callback);
};