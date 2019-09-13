"use strict";

const DbService = require("moleculer-db");
const MongooseAdapter = require("moleculer-db-adapter-mongoose");
const Customer = require("../models/customer.model");

/**
 * customers service
 */
module.exports = {

	name: "customers",

	mixins: [DbService],
	adapter: new MongooseAdapter(process.env.MONGO_UI || "mongodb://mongo:27017/ecommerce"),
	model: Customer,

	/**
	 * Service settings
	 */
	settings: {
		fileds: ["_id", "id", "name", "credit_limit"]

	},

	/**
	 * Service metadata
	 */
	metadata: {

	},

	/**
	 * Service dependencies
	 */
	dependencies: [],

	/**
	 * Actions
	 */
	actions: {

		hello() {
			return {
				from: this.broker.nodeID,
				response: "Customers: Hello Moleculer"
			};
		},
	},

	/**
	 * Events
	 */
	events: {
		"order.created"(payload){
			//payload.customer_id
			//payload.total
			this.logger.info("Something happened in order.created", payload);

			//Check the customer credit_limit
			this.check_customer_credit_limit(payload.customer_id, payload.total)			
		},
	},

	/**
	 * Methods
	 */
	methods: {
		seedDB(){
			this.logger.info("Seed Customers DB...");

			return Promise.resolve()
				.then(() => this.adapter.insert({
					id: 1,
					name: "Joe",
					credit_limit: 90000
				}))
				.then(() => this.adapter.insert({
					id: 2,
					name: "Jeen",
					credit_limit: 10000
				}))
				.then( customers => {
					this.logger.info(`Generated ${customers.length} customers!`);
				});
		},

		check_customer_credit_limit(customer_id, total){

			Customer.findOne({id : customer_id}, (err, foundCustomer) => {
				if(err)
					this.logger.error("Error connect to Customers DB");

				//this.logger.warn(foundCustomer.credit_limit);
				const credit_limit = foundCustomer.credit_limit;
				

				if(total <= credit_limit )
					this.broker.emit("creditReserved", "Under Customer Credit Limit, Can proceed the orders");
				else	
					this.broker.emit("creditLimitExceed", "Exceed Customer Credit Limit, Can not proceed the orders");
			});

		}

	},

	afterConnected(){
		return this.adapter.count().then(count => {
			if (count == 0){
				this.seedDB();
			}
		});
	},

	/**
	 * Service created lifecycle event handler
	 */
	created() {

	},

	/**
	 * Service started lifecycle event handler
	 */
	started() {

	},

	/**
	 * Service stopped lifecycle event handler
	 */
	stopped() {

	}
};
