import { Link } from 'react-router-dom';
import { FaUsers, FaTrophy, FaChartLine } from 'react-icons/fa';
import Button from '../components/button';
import './home.css';

const Home = () => {
  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="container hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Play Together. <span className="gold-text">Grow Together.</span>
            </h1>
            <p className="hero-subtitle">
              Join the most welcoming chess community. Compete, learn, and connect with players worldwide.
            </p>
            <Button variant="primary" onClick={() => window.location.href='/register'}>
              Join WEChess
            </Button>
          </div>
          <div className="hero-bg"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Why WEChess?</h2>
          <div className="features-grid">
            <Link to="/" className="feature-card" style={{ textDecoration: 'none' }}>
              <div className="feature-icon">
                <FaUsers />
              </div>
              <h3>Community</h3>
              <p>Friendly players, discussion boards, and team events.</p>
            </Link>
            <Link to="/tournaments" className="feature-card" style={{ textDecoration: 'none' }}>
              <div className="feature-icon">
                <FaTrophy />
              </div>
              <h3>Tournaments</h3>
              <p>Regular online and over‑the‑board tournaments for all levels.</p>
            </Link>
            <Link to="/leaderboard" className="feature-card" style={{ textDecoration: 'none' }}>
              <div className="feature-icon">
                <FaChartLine />
              </div>
              <h3>Rankings</h3>
              <p>Live rating updates and performance analytics.</p>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
