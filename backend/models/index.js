const User = require('./User');
const Doctor = require('./Doctor');
const Consultation = require('./Consultation');

// associations
Consultation.belongsTo(User, { as: 'Patient', foreignKey: 'patientId' });
Consultation.belongsTo(Doctor, { foreignKey: 'doctorId' });
User.hasOne(Doctor, { foreignKey: 'userId' });
Doctor.belongsTo(User, { foreignKey: 'userId' });


module.exports = {
    User,
    Doctor,
    Consultation,
};
