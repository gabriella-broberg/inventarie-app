import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../../../utils/auth';  // Här importerar du verifyToken från auth.js

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'PUT') {
    try {
      // Verifiera JWT-token
      const decoded = verifyToken(req);

      const { name, description, quantity, category } = req.body;

      // Uppdatera ett item
      const updatedItem = await prisma.item.update({
        where: { id: parseInt(id) },
        data: { name, description, quantity, category },
      });
      return res.status(200).json(updatedItem);
    } catch (error) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  } else if (req.method === 'DELETE') {
    try {
      // Verifiera JWT-token
      const decoded = verifyToken(req);

      // Radera ett item
      await prisma.item.delete({
        where: { id: parseInt(id) },
      });
      return res.status(204).json({});
    } catch (error) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
