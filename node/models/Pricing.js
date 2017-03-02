var mongoose = require('mongoose');

// mongodb schema for alan's exercise
var PricingSchema = new mongoose.Schema({
	vendor: String,
	priceType: String,
	instanceType: String,
	productDescription: String,
	price: Number,
	timestamp: String,
});

mongoose.model('Pricing', PricingSchema);