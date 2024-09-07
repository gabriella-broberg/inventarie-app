// pages/api/categories.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const categories = await prisma.item.findMany({
        select: { category: true }, // Select only the category field
        distinct: ['category'], // Ensure categories are distinct
      });
      const categoryList = categories.map(item => item.category); // Map to list of categories
      res.status(200).json(categoryList);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
