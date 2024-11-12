const Consultation = require('../models/Consultation');
const User = require('../models/User');
const Doctor = require('../models/Doctor'); 

// consultation requests 
exports.getConsultationRequests = async (req, res) => {

    if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated.' });
    }

    const doctorId = req.user.doctorId; 
    const baseUrl = 'http://localhost:5000/'; 

    try {
        const consultations = await Consultation.findAll({
            where: { doctorId },
            include: [{ 
                model: User, 
                as: 'Patient', 
                attributes: ['id', 'username', 'email'] 
            }],
        });

        if (!consultations.length) {
            return res.status(404).json({ message: 'No consultation requests found.' });
        }

        const response = consultations.map(consultation => ({
            id: consultation.id,
            patientId: consultation.patientId,
            doctorId: consultation.doctorId,
            status: consultation.status,
            dateTime: consultation.dateTime, 
            imageUrl: `${baseUrl}${consultation.imageUrl.replace(/\\/g, '/')}`,
            patientUsername: consultation.Patient.username,
            reason: consultation.reason,          // Include reason
            description: consultation.description, // Include description
        }));

        res.json(response);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch requests' });
    }
};



// Update consultation status
exports.updateConsultationStatus = async (req, res) => {
    const { id } = req.params;
    const { status, newDateTime } = req.body; 

    try {
        const consultation = await Consultation.findByPk(id);
        console.log('Received status:', status, 'New DateTime:', newDateTime); // Log here

        if (!consultation) {
            return res.status(404).json({ message: 'Consultation not found.' });
        }

        if (status === 'Accepted') {
            consultation.status = 'Accepted';
            if (newDateTime) {
                consultation.dateTime = newDateTime; 
            }
        } else if (status === 'Confirmed') {
            if (consultation.status === 'Accepted') {
                consultation.status = 'Confirmed';
            } else {
                return res.status(400).json({ message: 'Cant confirm consultation unless accepted.' });
            }
        } else if (status === 'Completed') {
            if (consultation.status === 'Confirmed') {
                consultation.status = 'Completed';
            } else {
                return res.status(400).json({ message: 'Cant complete consultation unless confirmed.' });
            }
        } else if (status === 'Rejected') {
            consultation.status = 'Rejected';
        } else {
            return res.status(400).json({ message: 'Invalid status' });
        }

        await consultation.save();
        res.json({ message: 'Consultation updated successfully', consultation });
    } catch (error) {
        res.status(500).json({ error: 'Failed to updatestatus' });
    }
};

