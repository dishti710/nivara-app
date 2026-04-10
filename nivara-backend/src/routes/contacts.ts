import express from 'express';

const router = express.Router();

// Add emergency contact
router.post('/add', async (req, res) => {
  // TODO: Implement add contact
  res.json({ message: 'Add contact endpoint' });
});

// Remove emergency contact
router.delete('/:contactId', async (req, res) => {
  // TODO: Implement remove contact
  res.json({ message: 'Remove contact endpoint' });
});

export default router;