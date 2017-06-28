var mongoose=require('mongoose');

var companySchema =  mongoose.Schema({
    name:{
        type : String,
        required : true
    },
    date_of_Placement : {
        type : String,
        required : true
    }
});

var Companies = module.exports = mongoose.model('Company', companySchema);

module.exports.getCompanies = function (callback, limit) {
  Companies.find(callback).limit(limit);
};

module.exports.addCompany = function (company, callback) {
    Companies.create(company, callback);
};

//remove company
module.exports.removeCompany = function (query, callback) {
    Companies.remove(query, callback);
};
module.exports.updateCompany = function (dbQuery, company, callback) { //multi update
    Companies.update(dbQuery, company, {multi : true }, callback);
};