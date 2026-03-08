import Button from '../components/button'  
//import './home.css'

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
          <div className="hero-bg"></div> {/* subtle knight illustration via CSS */}
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Why WEChess?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3>Community</h3>
              <p>Friendly players, discussion boards, and team events.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏆</div>
              <h3>Tournaments</h3>
              <p>Regular online and over‑the‑board tournaments for all levels.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Rankings</h3>
              <p>Live rating updates and performance analytics.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Home
