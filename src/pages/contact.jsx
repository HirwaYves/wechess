import { FaEnvelope, FaWhatsapp, FaInstagram } from 'react-icons/fa'
import './contact.css'

const Contact = () => {
  return (
    <section className="contact">
      <div className="container">
        <h1 className="page-title">Get in Touch</h1>
        <div className="contact-grid">
          <div className="contact-info">
            <h2>Contact Information</h2>
            <div className="contact-item">
              <FaEnvelope className="contact-icon" />
              <span>wechesscommunity@gmail.com</span>
            </div>
            <div className="contact-item">
              <FaWhatsapp className="contact-icon" />
              <span>+250 734 982 692</span>
            </div>
            <div className="social-links">
              <a href="https://www.instagram.com/wechessofficial?igsh=eG4wbmR6eWZrM3Bo&utm_source=qr" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <FaInstagram />
              </a>
              <a href="https://chat.whatsapp.com/KGfsgqgl4Rn3pcFVvUIMRt?mode=gi_t" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp Group">
                <FaWhatsapp />
              </a>
            </div>
          </div>
          <div className="contact-note">
            <h2>Partner with WEChess</h2>
            <p>WEChess is a rapidly growing chess community focused on hybrid tournaments and player development across Africa and beyond. We bring weekly online engagement (active players and watchers), monthly flagship events, and local meetups — together providing strong visibility for partners. Sponsorship opportunities include event title sponsorship, website branding, livestream overlays, and community coaching programs. We provide transparent reach metrics and sponsor reports after each sponsored event.</p>
            <p>Interested? Contact us via <a href="mailto:wechesscommunity@gmail.com">wechesscommunity@gmail.com</a> or via WhatsApp (+250734982692).</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Contact
