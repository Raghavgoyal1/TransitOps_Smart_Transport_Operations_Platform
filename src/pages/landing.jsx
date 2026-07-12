import { motion } from \"framer-motion\";
import { Link } from \"react-router-dom\";
import { Button } from \"@/components/ui/button\";
import { Card } from \"@/components/ui/card\";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from \"@/components/ui/accordion\";
import {
  Truck, MapPin, Bot, ShieldCheck, Zap, BarChart3, Fuel, Wrench,
  ArrowRight, Check, Star, Menu
} from \"lucide-react\";
import { useState } from \"react\";

const stats = [
  { label: \"Vehicles Managed\", value: \"12,400+\" },
  { label: \"Trips Optimized\", value: \"3.8M\" },
  { label: \"Fuel Saved\", value: \"18%\" },
  { label: \"On-Time Rate\", value: \"97.2%\" },
];

const features = [
  { icon: Truck, title: \"Fleet Management\", desc: \"50+ vehicle types, real-time status, insurance tracking, and predictive maintenance.\" },
  { icon: MapPin, title: \"Live GPS Tracking\", desc: \"Watch every vehicle move on an OpenStreetMap canvas with animated markers and route drawing.\" },
  { icon: Bot, title: \"AI Delay Prediction\", desc: \"GPT-5.2 powered assistant analyzes traffic, weather, and driver history to forecast ETAs.\" },
  { icon: Fuel, title: \"Fuel Intelligence\", desc: \"Log consumption per vehicle, predict weekly cost, and surface efficiency outliers.\" },
  { icon: Wrench, title: \"Maintenance Scheduler\", desc: \"Never miss a service. Automated reminders and parts-changed audit trail.\" },
  { icon: BarChart3, title: \"Analytics That Move\", desc: \"Revenue, occupancy, delay heatmaps, driver performance—all in one command deck.\" },
];

const testimonials = [
  { name: \"Sarah Chen\", role: \"Ops Director, Metro Transit\", body: \"TransitOps cut our late-arrival rate by 34% in the first quarter. The AI insights actually work.\", rating: 5 },
  { name: \"Marcus Rivera\", role: \"Fleet Manager, LogiCore\", body: \"One dashboard replaced four tools. The live map alone is worth it.\", rating: 5 },
  { name: \"Aisha Okoye\", role: \"CFO, RapidGo\", body: \"Fuel savings paid for the platform in month two. The analytics are surgical.\", rating: 5 },
];

const pricing = [
  { name: \"Starter\", price: \"$49\", period: \"/mo\", features: [\"Up to 10 vehicles\", \"Basic analytics\", \"Email support\", \"Live tracking\"] },
  { name: \"Growth\", price: \"$199\", period: \"/mo\", featured: true, features: [\"Up to 100 vehicles\", \"AI insights\", \"Priority support\", \"All analytics\", \"Maintenance scheduler\"] },
  { name: \"Enterprise\", price: \"Custom\", period: \"\", features: [\"Unlimited vehicles\", \"Dedicated CSM\", \"Custom integrations\", \"SLA 99.9%\", \"White-glove onboarding\"] },
];

const faqs = [
  { q: \"How long does setup take?\", a: \"Most fleets are live in under an hour. Import your CSV or use our seeded demo to explore first.\" },
  { q: \"Does it work with existing GPS hardware?\", a: \"Yes. TransitOps accepts feeds from any NMEA-compatible tracker and normalizes them in the platform.\" },
  { q: \"What ML models power the AI module?\", a: \"We use GPT-5.2 for conversational insights and scikit-learn regressors for delay and fuel forecasting.\" },
  { q: \"Is there a free trial?\", a: \"The demo environment ships with 50 vehicles, 100 drivers, and 500 trips—explore everything before you subscribe.\" },
];

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className=\"min-h-screen bg-[#0a0a0b] text-white\">
      {/* NAV */}
      <nav className=\"sticky top-0 z-50 border-b border-white/10 bg-black/60 backdrop-blur-xl\" data-testid=\"landing-nav\">
        <div className=\"mx-auto flex max-w-7xl items-center justify-between px-6 py-4\">
          <Link to=\"/\" className=\"flex items-center gap-2\" data-testid=\"brand-link\">
            <div className=\"grid h-8 w-8 place-items-center rounded-md bg-gradient-to-br from-blue-500 to-emerald-500\">
              <Truck className=\"h-4 w-4 text-white\" />
            </div>
            <span className=\"font-display text-xl font-bold tracking-tight\">TransitOps</span>
          </Link>
          <div className=\"hidden items-center gap-8 md:flex\">
            <a href=\"#features\" className=\"text-sm text-zinc-400 hover:text-white\" data-testid=\"nav-features\">Features</a>
            <a href=\"#pricing\" className=\"text-sm text-zinc-400 hover:text-white\" data-testid=\"nav-pricing\">Pricing</a>
            <a href=\"#testimonials\" className=\"text-sm text-zinc-400 hover:text-white\" data-testid=\"nav-testimonials\">Testimonials</a>
            <a href=\"#faq\" className=\"text-sm text-zinc-400 hover:text-white\" data-testid=\"nav-faq\">FAQ</a>
          </div>
          <div className=\"flex items-center gap-3\">
            <Link to=\"/login\"><Button variant=\"ghost\" className=\"hidden text-zinc-300 hover:text-white md:inline-flex\" data-testid=\"nav-login-btn\">Sign in</Button></Link>
            <Link to=\"/register\"><Button className=\"bg-blue-600 text-white hover:bg-blue-500\" data-testid=\"nav-signup-btn\">Get started <ArrowRight className=\"ml-2 h-4 w-4\" /></Button></Link>
            <button className=\"md:hidden\" onClick={() => setMenuOpen(!menuOpen)} data-testid=\"mobile-menu-btn\"><Menu className=\"h-5 w-5\" /></button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className=\"hero-glow relative overflow-hidden\">
        <div className=\"grain absolute inset-0\" />
        <div className=\"relative mx-auto max-w-7xl px-6 py-24 md:py-32\">
          <div className=\"grid gap-12 md:grid-cols-12\">
            <div className=\"md:col-span-7\">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className=\"inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-emerald-400\">
                <Zap className=\"h-3 w-3\" /> Live Fleet Intelligence
              </motion.div>
              <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.7 }} className=\"mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl\" data-testid=\"hero-title\">
                The command center<br />for <span className=\"text-gradient-brand\">modern transport</span>.
              </motion.h1>
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }} className=\"mt-6 max-w-xl text-lg text-zinc-400\">
                Track every vehicle, predict every delay, optimize every route. TransitOps unifies fleet, drivers, fuel, and AI into one relentless dashboard.
              </motion.p>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className=\"mt-10 flex flex-wrap items-center gap-4\">
                <Link to=\"/register\"><Button size=\"lg\" className=\"bg-blue-600 text-base text-white hover:bg-blue-500\" data-testid=\"hero-cta-primary\">Start free demo <ArrowRight className=\"ml-2 h-4 w-4\" /></Button></Link>
                <Link to=\"/login\"><Button size=\"lg\" variant=\"outline\" className=\"border-white/20 bg-white/5 text-base text-white hover:bg-white/10\" data-testid=\"hero-cta-secondary\">Sign in</Button></Link>
              </motion.div>
              <div className=\"mt-8 flex items-center gap-2 text-sm text-zinc-500\">
                <ShieldCheck className=\"h-4 w-4 text-emerald-500\" /> No credit card required · Full demo dataset included
              </div>
            </div>
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.7 }} className=\"md:col-span-5\">
              <div className=\"relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-2xl backdrop-blur-xl\">
                <img src=\"https://images.unsplash.com/photo-1635822279175-67270a5bffcb?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzNDR8MHwxfHNlYXJjaHwyfHxsb2dpc3RpY3MlMjBmbGVldCUyMHRydWNrJTIwbmlnaHQlMjBoaWdod2F5fGVufDB8fHx8MTc4MzgzMzMyNnww&ixlib=rb-4.1.0&q=85\" alt=\"Fleet at night\" className=\"h-full w-full object-cover\" />
                <div className=\"absolute bottom-4 left-4 right-4 rounded-lg border border-white/10 bg-black/70 p-4 backdrop-blur-xl\">
                  <div className=\"flex items-center gap-2 text-xs uppercase tracking-widest text-emerald-400\"><span className=\"h-2 w-2 animate-pulse rounded-full bg-emerald-400\" /> Live · 47 vehicles moving</div>
                  <div className=\"mt-2 font-mono text-lg text-white\">ETA precision: 97.2%</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className=\"border-y border-white/5 bg-white/[0.02]\">
        <div className=\"mx-auto grid max-w-7xl grid-cols-2 gap-px overflow-hidden md:grid-cols-4\">
          {stats.map((s) => (
            <div key={s.label} className=\"bg-[#0a0a0b] px-6 py-10 text-center\">
              <div className=\"font-display text-4xl font-bold text-white md:text-5xl\">{s.value}</div>
              <div className=\"mt-2 text-xs uppercase tracking-[0.2em] text-zinc-500\">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id=\"features\" className=\"mx-auto max-w-7xl px-6 py-24 md:py-32\">
        <div className=\"max-w-2xl\">
          <div className=\"text-xs uppercase tracking-[0.2em] text-blue-400\">Modules</div>
          <h2 className=\"mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl\">Every operation, one canvas.</h2>
          <p className=\"mt-4 text-lg text-zinc-400\">From dispatch to depreciation, TransitOps replaces spreadsheets, radios, and guesswork with a single source of truth.</p>
        </div>
        <div className=\"mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3\">
          {features.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
              <Card className=\"group h-full border-white/10 bg-white/[0.02] p-8 hover:bg-white/[0.04]\">
                <div className=\"grid h-11 w-11 place-items-center rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20\"><f.icon className=\"h-5 w-5\" /></div>
                <h3 className=\"mt-5 font-display text-xl font-semibold\">{f.title}</h3>
                <p className=\"mt-2 text-sm leading-relaxed text-zinc-400\">{f.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id=\"testimonials\" className=\"border-y border-white/5 bg-white/[0.02]\">
        <div className=\"mx-auto max-w-7xl px-6 py-24\">
          <h2 className=\"max-w-2xl font-display text-4xl font-bold tracking-tight md:text-5xl\">Loved by ops teams that don't tolerate excuses.</h2>
          <div className=\"mt-16 grid gap-6 md:grid-cols-3\">
            {testimonials.map((t) => (
              <Card key={t.name} className=\"border-white/10 bg-black/40 p-8\">
                <div className=\"flex gap-1\">{[...Array(t.rating)].map((_, i) => <Star key={i} className=\"h-4 w-4 fill-amber-400 text-amber-400\" />)}</div>
                <p className=\"mt-4 text-zinc-300\">\"{t.body}\"</p>
                <div className=\"mt-6 border-t border-white/10 pt-4\">
                  <div className=\"font-semibold\">{t.name}</div>
                  <div className=\"text-xs text-zinc-500\">{t.role}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id=\"pricing\" className=\"mx-auto max-w-7xl px-6 py-24 md:py-32\">
        <div className=\"max-w-2xl\">
          <div className=\"text-xs uppercase tracking-[0.2em] text-emerald-400\">Pricing</div>
          <h2 className=\"mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl\">Priced per vehicle. Not per surprise.</h2>
        </div>
        <div className=\"mt-16 grid gap-6 md:grid-cols-3\">
          {pricing.map((p) => (
            <Card key={p.name} className={`p-8 ${p.featured ? \"border-blue-500/40 bg-blue-500/[0.04]\" : \"border-white/10 bg-white/[0.02]\"}`}>
              {p.featured && <div className=\"mb-4 inline-block rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold uppercase tracking-wider\">Most popular</div>}
              <div className=\"font-display text-2xl font-bold\">{p.name}</div>
              <div className=\"mt-4 flex items-baseline gap-1\"><span className=\"font-display text-5xl font-bold\">{p.price}</span><span className=\"text-zinc-500\">{p.period}</span></div>
              <ul className=\"mt-8 space-y-3\">
                {p.features.map((f) => <li key={f} className=\"flex items-center gap-3 text-sm text-zinc-300\"><Check className=\"h-4 w-4 text-emerald-500\" /> {f}</li>)}
              </ul>
              <Link to=\"/register\"><Button className={`mt-8 w-full ${p.featured ? \"bg-blue-600 hover:bg-blue-500\" : \"bg-white/10 hover:bg-white/20\"}`} data-testid={`pricing-${p.name.toLowerCase()}-btn`}>Choose {p.name}</Button></Link>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id=\"faq\" className=\"border-t border-white/5 bg-white/[0.02]\">
        <div className=\"mx-auto max-w-3xl px-6 py-24\">
          <h2 className=\"text-center font-display text-4xl font-bold tracking-tight md:text-5xl\">Questions, answered.</h2>
          <Accordion type=\"single\" collapsible className=\"mt-12\">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`} className=\"border-white/10\">
                <AccordionTrigger data-testid={`faq-${i}`} className=\"text-left font-semibold hover:text-blue-400\">{f.q}</AccordionTrigger>
                <AccordionContent className=\"text-zinc-400\">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA / FOOTER */}
      <section className=\"mx-auto max-w-7xl px-6 py-24\">
        <Card className=\"overflow-hidden border-white/10 bg-gradient-to-br from-blue-900/40 to-emerald-900/20 p-12 md:p-16\">
          <div className=\"grid gap-8 md:grid-cols-2 md:items-center\">
            <div>
              <h2 className=\"font-display text-4xl font-bold tracking-tight md:text-5xl\">Take control of the road.</h2>
              <p className=\"mt-4 text-zinc-300\">Explore the full command center with a fully-seeded demo. No card, no waiting.</p>
            </div>
            <div className=\"flex flex-wrap gap-4 md:justify-end\">
              <Link to=\"/register\"><Button size=\"lg\" className=\"bg-white text-black hover:bg-zinc-200\" data-testid=\"footer-cta-btn\">Start free <ArrowRight className=\"ml-2 h-4 w-4\" /></Button></Link>
              <Link to=\"/login\"><Button size=\"lg\" variant=\"outline\" className=\"border-white/20 bg-transparent text-white hover:bg-white/10\" data-testid=\"footer-signin-btn\">Sign in</Button></Link>
            </div>
          </div>
        </Card>
      </section>

      <footer className=\"border-t border-white/5 bg-black\">
        <div className=\"mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-zinc-500 md:flex-row\">
          <div>© 2026 TransitOps. Move with certainty.</div>
          <div className=\"flex gap-6\"><a href=\"#\" className=\"hover:text-white\">Privacy</a><a href=\"#\" className=\"hover:text-white\">Terms</a><a href=\"#\" className=\"hover:text-white\">Contact</a></div>
        </div>
      </footer>
    </div>
  );
}
