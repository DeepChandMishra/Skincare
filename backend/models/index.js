const User = require('./User');
const Doctor = require('./Doctor');
const Consultation = require('./Consultation');
const DoctorAvailability = require('./DoctorAvailability');

// associations
Consultation.belongsTo(User, { as: 'Patient', foreignKey: 'patientId' });
Consultation.belongsTo(Doctor, { foreignKey: 'doctorId' });
User.hasOne(Doctor, { foreignKey: 'userId' });
Doctor.belongsTo(User, { foreignKey: 'userId' });
Doctor.hasMany(DoctorAvailability, { foreignKey: 'doctorId' });
DoctorAvailability.belongsTo(Doctor, { foreignKey: 'doctorId' });
Consultation.belongsTo(DoctorAvailability, { foreignKey: 'doctorAvailabilityId' });
DoctorAvailability.hasMany(Consultation, { foreignKey: 'doctorAvailabilityId' });

module.exports = {
    User,
    Doctor,
    Consultation,
    DoctorAvailability,
};
