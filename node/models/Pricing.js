var mongoose = require('mongoose');

// mongodb schema for alan's exercise
var PricingSchema = new mongoose.Schema({
	vendor: String,
	region: String,
	zone: String,
	priceType: String,
	instanceType: String,
	productDescription: String,
	price: Number,
	timestamp: Date,
});

mongoose.model('Pricing', PricingSchema);
