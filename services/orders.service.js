"use strict";

const DbService = require("moleculer-db");
const MongooseAdapter = require("moleculer-db-adapter-mongoose");
const Order = require("../models/order.model");

/**
 * orders service
 */
module.exports = {

	name: "orders",

	mixins: [DbService],
	adapter: new MongooseAdapter(process.env.MONGO_UI || "mongodb://mongo:27017/ecommerce"),
	model: Order,

	/**
	 * Service settings
	 */
	settings: {
		fileds: ["_id", "id", "customer_id", "state", "total"]
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
				response: "Orders: Hello Moleculer"
			};
		},
		async place_order(ctx) {
			 const customer_id = ctx.params.customer_id;
			 const total = ctx.params.total;
			 const node_id = this.broker.nodeID;
			 this.broker.emit("order.created", {customer_id, total});

			 return "This Order Place Order was called in node_id: " +  node_id ;
		}
	},

	/**
	 * Events
	 */
	events: {
		"creditReserved"(payload){
			this.logger.info("Credit Reserved:", payload);
		},
		"creditLimitExceed"(payload){
			this.logger.info("Credit Limit Exceed:", payload);
		}
	},

	/**
	 * Methods
	 */
	methods: {
		seedDB(){
			this.logger.info("Seed Orders DB...");

			return Promise.resolve()
				.then(() => this.adapter.insert({
					id: 1,
					customer_id : 1,
					state: "pending",
					total: 90000
				}))
				.then(() => this.adapter.insert({
					id: 2,
					customer_id : 2,
					state: "pending",
					total: 26000
				}))
				.then( orders => {
					this.logger.info(`Generated ${orders.length} orders!`);
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
