import { useEffect, useState } from 'react';
import TicketConfirmation from './TicketConfirmation.jsx';
import TicketForm from './TicketForm.jsx';
import TicketList from './TicketList.jsx';

const screens = {
  list: 'danh-sach',
  form: 'tao-phieu',
  confirmation: 'xac-nhan'
};

function screenFromHash() {
  const currentHash = window.location.hash.slice(1);
  return Object.keys(screens).find((screen) => screens[screen] === currentHash) || 'list';
}

export default function App() {
  const [screen, setScreen] = useState(screenFromHash);

  useEffect(() => {
    const syncScreen = () => setScreen(screenFromHash());
    window.addEventListener('hashchange', syncScreen);
    return () => window.removeEventListener('hashchange', syncScreen);
  }, []);

  function navigate(nextScreen) {
    const nextHash = `#${screens[nextScreen]}`;
    if (window.location.hash === nextHash) setScreen(nextScreen);
    else window.location.hash = nextHash;
    window.scrollTo(0, 0);
  }

  function submitForm(event) {
    event.preventDefault();
    navigate('confirmation');
  }

  return (
    <main className="khungNoiDung">
      {screen === 'list' && <TicketList onCreate={() => navigate('form')} />}
      {screen === 'form' && (
        <TicketForm onCancel={() => navigate('list')} onSubmit={submitForm} />
      )}
      {screen === 'confirmation' && (
        <TicketConfirmation
          onBack={() => navigate('form')}
          onConfirm={() => navigate('list')}
        />
      )}
    </main>
  );
}
