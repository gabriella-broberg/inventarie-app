import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = 'your_jwt_secret'; // Replace with your actual secret

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, password } = req.body;

    try {
      // Find user by email
      const user = await prisma.user.findUnique({ where: { email } });

      // Check if user exists
      if (!user) {
        return res.status(401).json({ message: 'User does not exist. Please sign up first.' });
      }

      // Compare password with hashed password in database
      const isValid = await bcrypt.compare(password, user.password);

      // If password is incorrect
      if (!isValid) {
        return res.status(401).json({ message: 'Incorrect password. Please try again.' });
      }

      // Generate JWT token if credentials are valid
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });

      // Send the token to the client
      res.status(200).json({ token });
    } catch (error) {
      res.status(500).json({ message: 'An error occurred during login. Please try again later.' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed. Only POST requests are accepted.' });
  }
}




// Vad gör denna kod?
//Den tar emot en POST-begäran med e-post och lösenord.
//Den letar upp användaren baserat på e-post.
//Den jämför lösenordet som användaren anger med det hashade lösenordet i databasen.
//Om inloggningen lyckas, genererar den en JWT-token och skickar tillbaka den till klienten.
