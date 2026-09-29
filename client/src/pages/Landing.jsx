import { ArrowDownRight, ArrowRight, BellRing, ChefHat, ClipboardList, Sparkles, Sprout } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

const featureItems = [
  { icon: ClipboardList, title: 'Know what you have', copy: 'A calm, clear view of what is in your fridge, pantry, and freezer.' },
  { icon: BellRing, title: 'Use it in time', copy: 'Expiry dates become useful reminders, not another thing to remember.' },
  { icon: Sprout, title: 'Waste less, naturally', copy: 'Find recipes that make the most of what is already on hand.' },
  { icon: Sparkles, title: 'Make something new', copy: 'Ask Chef AI for a practical recipe shaped around your ingredients.' },
];

export default function Landing() {
  return <div className="landing-page">
    <header className="landing-nav"><Logo /><nav><a href="#features">Why FoodSentry</a><a href="#how">How it works</a></nav><div className="landing-nav-actions"><Link className="text-link" to="/login">Log in</Link><Link className="button button-primary button-small" to="/register">Get started <ArrowRight size={16} /></Link></div></header>
    <main>
      <section className="landing-hero">
        <div className="hero-copy"><span className="eyebrow"><span className="eyebrow-dot" /> THE THOUGHTFUL PANTRY</span><h1>Good food<br />deserves <em>to be used.</em></h1><p>See what you have. Know what needs using. Find something delicious to make before it gets forgotten.</p><div className="hero-actions"><Link className="button button-primary" to="/register">Start tracking <ArrowRight size={17} /></Link><a className="hero-secondary" href="#features">Explore FoodSentry <ArrowDownRight size={16} /></a></div><div className="hero-proof"><span className="proof-dot" /><span>A little more intention, a lot less waste.</span></div></div>
        <div className="hero-visual"><img src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=85" alt="A colorful bowl of fresh vegetables ready to be cooked" /><div className="hero-note"><span className="note-icon"><BellRing size={17} /></span><span><strong>Spinach, use it today</strong><small>Fresh ideas, right on time</small></span><span className="note-status">2 days</span></div><div className="hero-image-caption">A better relationship with your groceries.</div></div>
        <span className="hero-index">01 / 04</span>
      </section>
      <section id="features" className="landing-features"><div className="section-intro"><span className="eyebrow">A PANTRY THAT THINKS AHEAD</span><h2>Small habits. <em>Good things.</em></h2><p>FoodSentry makes it easier to care for the ingredients you already bought.</p></div><div className="feature-grid">{featureItems.map(({ icon: Icon, title, copy }, index) => <article className="feature-item" key={title}><span className="feature-number">0{index + 1}</span><span className="feature-icon"><Icon size={20} /></span><h3>{title}</h3><p>{copy}</p></article>)}</div></section>
      <section id="how" className="how-section"><div className="how-heading"><span className="eyebrow">FROM FRIDGE TO FORK</span><h2>A simple little rhythm.</h2><p>Less guessing, more good meals.</p></div><ol className="how-steps"><li><span>01</span><div><h3>Add what you bought</h3><p>Log ingredients and their best-by dates.</p></div></li><li><span>02</span><div><h3>Let FoodSentry keep watch</h3><p>See at a glance what is fresh and what needs attention.</p></div></li><li><span>03</span><div><h3>Find your next meal</h3><p>Turn the ingredients you have into something worth sitting down for.</p></div></li></ol></section>
      <section className="landing-cta"><span className="eyebrow">START WITH WHAT YOU HAVE</span><h2>Your next good meal<br />might already be here.</h2><Link className="button button-light" to="/register">Make your pantry count <ArrowRight size={17} /></Link><span className="cta-leaf cta-leaf-one"><Sprout size={72} /></span><span className="cta-leaf cta-leaf-two"><Sprout size={46} /></span></section>
    </main>
    <footer className="landing-footer"><Logo /><span>Keep good food in good hands.</span><span>© {new Date().getFullYear()} FoodSentry</span></footer>
  </div>;
}
