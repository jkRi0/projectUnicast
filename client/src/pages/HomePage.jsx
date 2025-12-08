import InstallPrompt from '../components/InstallPrompt.jsx';
import { useAuthContext } from '../context/AuthContext.jsx';

const highlights = [
  {
    title: 'Real-time collaboration',
    description: 'Stay in sync with your team through live updates.',
  },
  {
    title: 'Offline ready',
    description: 'Access cached content even when you are offline.',
  },
  {
    title: 'Analytics',
    description: 'Track progress and plan with precision.',
  },
];

const HomePage = () => {
  const { user, logout } = useAuthContext();

  return (
    <div className="container home-page">
      {user ? (
        <section className="hero">
          <div style={{ maxWidth: '640px' }}>
            <h1 className="hero__title">Welcome back, {user.username}!</h1>
            <p style={{ fontSize: '1.05rem', color: '#475569', lineHeight: 1.7 }}>
              You are successfully logged in. This is your landing page.
            </p>
            <div className="hero__cta" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
              <button type="button" className="btn btn--outline" onClick={logout}>
                Log out
              </button>
              <InstallPrompt />
            </div>
          </div>
        </section>
      ) : (
        <>
          <section className="hero">
            <div style={{ maxWidth: '640px' }}>
              <h1 className="hero__title">Welcome</h1>
              <p style={{ fontSize: '1.05rem', color: '#475569', lineHeight: 1.7 }}>
                Your platform for staying productive and organized.
              </p>
              <div className="hero__cta" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
                <InstallPrompt />
              </div>
            </div>
          </section>

          <section>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '2rem', color: '#1f2937', textAlign: 'center' }}>
              Features
            </h2>
            <div className="card-grid">
              {highlights.map((item, idx) => {
                const colors = ['#2563eb', '#10b981', '#f59e0b'];
                return (
                  <article key={item.title} className="card" style={{ borderLeftColor: colors[idx % 3] }}>
                    <h2 className="card__title">{item.title}</h2>
                    <p style={{ color: '#64748b', lineHeight: 1.6 }}>{item.description}</p>
                  </article>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default HomePage;
