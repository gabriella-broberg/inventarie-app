import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = 'your_jwt_secret'; // Byt detta till något säkrare i en riktig applikation

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, password } = req.body;

    try {
      // Hitta användaren baserat på e-post
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Jämför lösenordet med det hashade lösenordet i databasen
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generera JWT-token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });

      // Returnera token till klienten
      res.status(200).json({ token });
    } catch (error) {
      res.status(400).json({ error: 'Login failed' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}



// Vad gör denna kod?
//Den tar emot en POST-begäran med e-post och lösenord.
//Den letar upp användaren baserat på e-post.
//Den jämför lösenordet som användaren anger med det hashade lösenordet i databasen.
//Om inloggningen lyckas, genererar den en JWT-token och skickar tillbaka den till klienten.
