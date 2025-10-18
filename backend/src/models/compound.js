const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');


const Compound = sequelize.define('Compound', {
id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
name: { type: DataTypes.STRING(255), allowNull: false },
image: { type: DataTypes.TEXT, allowNull: false },
description: { type: DataTypes.TEXT('long'), allowNull: true }
}, {
tableName: 'compounds',
timestamps: false
});


module.exports = Compound;