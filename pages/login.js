import { useState } from 'react';
import { useRouter } from 'next/router';
import Modal from 'react-modal';

// Make sure to bind modal to your app element
Modal.setAppElement('#__next');

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); // För att visa felmeddelanden
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false); // För att hantera registreringsmodals synlighet
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerErrorMessage, setRegisterErrorMessage] = useState(''); // Felmeddelande för registrering
  const router = useRouter();

  // Hantera inloggning
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(''); // Återställ felmeddelande innan ny inloggning

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        router.push('/items'); // Redirect to items page
      } else {
        setErrorMessage(data.message);
      }
    } catch (error) {
      setErrorMessage('An unexpected error occurred. Please try again.');
    }
  };

  // Hantera registrering
  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterErrorMessage('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: registerEmail, password: registerPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsRegisterModalOpen(false); // Stäng modal om registrering lyckas
        setRegisterEmail('');
        setRegisterPassword('');
      } else {
        setRegisterErrorMessage(data.message);
      }
    } catch (error) {
      setRegisterErrorMessage('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">Login</button>
      </form>

      {/* Visa felmeddelande för inloggning */}
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

      {/* Register button to open modal */}
      <button onClick={() => setIsRegisterModalOpen(true)}>Register New User</button>

      {/* Register Modal */}
      <Modal
        isOpen={isRegisterModalOpen}
        onRequestClose={() => setIsRegisterModalOpen(false)}
        contentLabel="Register New User"
      >
        <h2>Register New User</h2>
        <form onSubmit={handleRegister}>
          <input
            type="email"
            value={registerEmail}
            onChange={(e) => setRegisterEmail(e.target.value)}
            placeholder="Email"
            required
          />
          <input
            type="password"
            value={registerPassword}
            onChange={(e) => setRegisterPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <button type="submit">Register</button>
        </form>

        {/* Visa felmeddelande för registrering */}
        {registerErrorMessage && <p style={{ color: 'red' }}>{registerErrorMessage}</p>}

        <button onClick={() => setIsRegisterModalOpen(false)}>Close</button>
      </Modal>
    </div>
  );
}
