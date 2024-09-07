import jwt from 'jsonwebtoken';

const JWT_SECRET = 'your_jwt_secret'; // Byt detta till samma hemlighet som jag använde i inloggnings-API:t

export function verifyToken(req) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    throw new Error('No token provided');
  }

  const token = authHeader.split(' ')[1]; // Tar bort "Bearer" från headern
  if (!token) {
    throw new Error('Invalid token');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
}
