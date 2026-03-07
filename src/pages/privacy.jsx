import './privacy.css'

const Privacy = () => {
  return (
    <section className="privacy">
      <div className="container">
        <h1 className="page-title">Privacy Policy</h1>
        <div className="policy-content">
          <p><strong>Controller:</strong> WEChess (contact: <a href="mailto:privacy@wechess.org">privacy@wechess.org</a>)</p>
          <p><strong>Data we collect:</strong> name, email, chess username, country, WhatsApp/phone, age (optional), event participation, payment receipts (if paid).</p>
          <p><strong>Purpose:</strong> run tournaments, verify registration, contact players, publish standings, prevent fraud.</p>
          <p><strong>Legal basis:</strong> consent and legitimate interests in running events.</p>
          <p><strong>Retention:</strong> we retain registration & results for event-history and community management; contact data removed on request.</p>
          <p><strong>Sharing:</strong> we may share player names and results publicly (leaderboards). We do not sell personal data. Payment processors handle payment details.</p>
          <p><strong>Security:</strong> stored on secure servers, admin access limited.</p>
          <p><strong>Contact & rights:</strong> email <a href="mailto:privacy@wechess.org">privacy@wechess.org</a> to request data access, correction, or deletion.</p>
        </div>
      </div>
    </section>
  )
}

export default Privacy