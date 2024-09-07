import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = 'your_jwt_secret'; // Make sure this matches your login route secret

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { name, email, password } = req.body;

    try {
      // Kontrollera om användaren redan finns
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Hasha lösenordet
      const hashedPassword = await bcrypt.hash(password, 10);

      // Skapa en ny användare
      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });

      // Generera en JWT-token för den nya användaren
      const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '30d' });

      // Returnera token
      res.status(201).json({ token });
    } catch (error) {
      res.status(500).json({ message: 'Error creating user' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
