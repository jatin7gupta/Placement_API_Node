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
};

//get registrations
module.exports.getRegistrations = function (query, callback, limit) {
  Registrations.find(query, callback).limit(limit); //Check This
};

module.exports.removeRegistration = function (query, callback) {
  Registrations.remove(query, callback);
};