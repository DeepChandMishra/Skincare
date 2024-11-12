const Consultation = require('../models/Consultation');
const Doctor = require('../models/Doctor');
const User = require('../models/User');

// available doctors
exports.getDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.findAll({
            include: [{
                model: User,
                attributes: ['username'],
            }],
            attributes: ['id', 'specialization', 'contactDetails'], 
        });

        const formattedDoctors = doctors.map(doctor => ({
            id: doctor.id,
            name: doctor.User.username,
            specialization: doctor.specialization,
        }));

        res.json(formattedDoctors);
    } catch (error) {
        res.status(500).json({ error: 'Failed to find doctors' });
    }
};


// Request a consultation
exports.requestConsultation = async (req, res) => {
    try {
        const { patientId, doctorId, dateTime, reason, description } = req.body;

        // Validate if the required fields are present
        if (!req.file) {
            return res.status(400).json({ error: 'Image is required' });
        }

        if (!reason || !description) {
            return res.status(400).json({ error: 'Reason and description are required' });
        }

        const imageUrl = req.file.path;

        // Create a new consultation record with the new fields
        const consultation = await Consultation.create({
            patientId,
            doctorId,
            dateTime,
            reason,         // Save the reason
            description,    // Save the description
            imageUrl,
        });

        res.status(201).json({ message: 'Consultation requested', consultation });
    } catch (error) {
        console.error('Failed consultation request:', error);
        res.status(500).json({ error: 'Failed to request consultation' });
    }
};

exports.getConsultationStatus = async (req, res) => {
    const { patientId } = req.params;

    try {
        const consultations = await Consultation.findAll({
            where: { patientId },
            attributes: ['id', 'doctorId', 'dateTime', 'status'],
            include: [{
                model: Doctor,
                attributes: ['specialization'],
                include: [{
                    model: User,
                    attributes: ['username'], 
                }],
            }],
        });

        if (!consultations.length) {
            return res.status(404).json({ message: 'No consultations' });
        }

        const formattedConsultations = consultations.map(consultation => ({
            id: consultation.id,
            doctorId: consultation.doctorId,
            dateTime: consultation.dateTime,
            status: consultation.status,
            doctorName: consultation.Doctor.User.username, 
            specialty: consultation.Doctor.specialization, 
        }));

        res.json(formattedConsultations);
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
};

