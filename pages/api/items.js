// api/items/index.js
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../../utils/auth'; // Se till att stigen är korrekt

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { method } = req;
  const { category, inStock } = req.query; // Hämta filtreringsparametrar från query

  if (method === 'GET') {
    try {
      // Verifiera JWT-token
      const decoded = verifyToken(req);

      // Skapa filterobjekt för Prisma-begäran
      let filter = {};

      // Lägg till filtrering baserat på kategori om den finns
      if (category) {
        filter.category = category;
      }

      // Lägg till filtrering baserat på lagerstatus (inStock) om det finns
      if (inStock) {
        filter.quantity = inStock === 'true' ? { gt: 0 } : 0; // Om "inStock" är "true", hämta alla med quantity > 0
      }

      // Hämta items med eventuella filter
      const items = await prisma.item.findMany({
        where: filter,
      });

      res.status(200).json(items);
    } catch (error) {
      res.status(401).json({ error: 'Unauthorized' });
    }
  } else if (method === 'POST') {
    try {
      const { name, description, quantity, category } = req.body;

      // Verifiera JWT-token
      const decoded = verifyToken(req);

      // Skapa ett nytt item i databasen
      const newItem = await prisma.item.create({
        data: {
          name,
          description,
          quantity: parseInt(quantity, 10),
          category,
        },
      });

      res.status(201).json(newItem);
    } catch (error) {
      res.status(400).json({ error: 'Failed to create item' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
