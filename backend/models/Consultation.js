const { DataTypes } = require('sequelize');
const { sequelize } = require('../config');
const User = require('./User');
const Doctor = require('./Doctor');

const Consultation = sequelize.define('Consultation', {
    patientId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id',
        },
    },
    doctorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Doctor,
            key: 'id',
        },
    },
    dateTime: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    reason: {               // Add reason field
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {          // Add description field
        type: DataTypes.TEXT,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('pending', 'Accepted', 'Rejected', 'Confirmed', 'Completed'),
        allowNull: false,
        defaultValue: 'pending'
    },
});

module.exports = Consultation;
