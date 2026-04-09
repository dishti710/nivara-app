import { Request, Response } from 'express';
import { SOSAlert } from '../models/SOSAlert';
import { User } from '../models/User';
import { sendEmergencySMS, sendEmergencyEmail } from '../services/alertService';

export const triggerSOS = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { location } = req.body;

    // Create SOS alert record
    const sosAlert = new SOSAlert({
      userId,
      timestamp: new Date().toISOString(),
      location,
      status: 'active',
      contactsNotified: [],
    });

    await sosAlert.save();

    // Get user and emergency contacts
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Notify emergency contacts
    const primaryContacts = user.emergencyContacts
      .filter((c) => c.isPrimary)
      .slice(0, 3);

    for (const contact of primaryContacts) {
      try {
        // Send SMS
        if (contact.phone) {
          await sendEmergencySMS(
            contact.phone,
            `🆘 EMERGENCY: ${user.name} needs help! Location: https://maps.google.com/?q=${location.lat},${location.lng}`
          );
        }

        // Send Email
        if (contact.email) {
          await sendEmergencyEmail(contact.email, {
            name: contact.name,
            emergencyName: user.name,
            location,
          });
        }

        sosAlert.contactsNotified.push(contact.id);
      } catch (error) {
        console.error(`Failed to notify ${contact.name}:`, error);
      }
    }

    await sosAlert.save();

    res.json({
      message: 'SOS alert sent',
      alertId: sosAlert._id,
      contactsNotified: sosAlert.contactsNotified.length,
    });
  } catch (error) {
    console.error('SOS trigger error:', error);
    res.status(500).json({ error: 'Failed to trigger SOS' });
  }
};

export const cancelSOS = async (req: Request, res: Response) => {
  try {
    const { alertId } = req.body;

    const sosAlert = await SOSAlert.findByIdAndUpdate(
      alertId,
      { status: 'cancelled' },
      { new: true }
    );

    res.json({ message: 'SOS alert cancelled', sosAlert });
  } catch (error) {
    console.error('Cancel SOS error:', error);
    res.status(500).json({ error: 'Failed to cancel SOS' });
  }
};

export const getSOSHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const sosAlerts = await SOSAlert.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json(sosAlerts);
  } catch (error) {
    console.error('Get SOS history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};