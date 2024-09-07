import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      // Kryptera lösenordet
      const hashedPassword = await bcrypt.hash(password, 10);

      // Skapa användare i databasen
      const user = await prisma.user.create({
        data: { name, email, password: hashedPassword },
      });

      res.status(201).json({ message: 'User created', user });
    } catch (error) {
      res.status(400).json({ error: 'Email already exists' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
