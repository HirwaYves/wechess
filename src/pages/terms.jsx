import './terms.css'

const Terms = () => {
  return (
    <section className="terms">
      <div className="container">
        <h1 className="page-title">Terms of Service</h1>
        <div className="policy-content">
          <p><strong>Eligibility:</strong> must be honest age / identity; minors require guardian consent.</p>
          <p><strong>Registration & payment:</strong> seat confirmed when payment (if required) cleared or when registration accepted.</p>
          <p><strong>Refund policy:</strong> specify per event (suggest: no refunds within 48h of event start).</p>
          <p><strong>Code of conduct & anti-cheating:</strong> zero tolerance — accounts found cheating will be banned.</p>
          <p><strong>Liability:</strong> WEChess is not liable for indirect damages; we aim to run events professionally.</p>
          <p><strong>Disputes:</strong> contact <a href="mailto:support@wechess.org">support@wechess.org</a>; escalate to arbitration if unresolved.</p>
        </div>
      </div>
    </section>
  )
}

export default Terms