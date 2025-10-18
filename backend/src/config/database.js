const { Sequelize } = require("sequelize");
require("dotenv").config();

// Use environment variables, fallback to sensible defaults for Docker
const DB_NAME = process.env.DB_NAME || "compounds_db";
const DB_USER = process.env.DB_USER || "root";
const DB_PASS = process.env.DB_PASS || "";
const DB_HOST = process.env.DB_HOST || "chemical_db"; // Docker service name
const DB_PORT = process.env.DB_PORT || 3306;
const DB_DIALECT = process.env.DB_DIALECT || "mysql";

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  port: DB_PORT, // ensure Sequelize uses the correct port
  dialect: DB_DIALECT,
  logging: false,
  pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
});

// Debug logs
console.log("DB HOST:", DB_HOST);
console.log("DB PORT:", DB_PORT);

module.exports = sequelize;
