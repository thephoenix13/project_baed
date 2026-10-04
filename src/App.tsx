import { useState, useEffect, useRef } from "react";

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isInView };
}

function WaitlistForm({ onNavigate }: { onNavigate?: (page: string) => void } = {}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setStatus("error");
      setErrorMsg("Please enter your name.");
      return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error");
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (!mobile || !/^[0-9]{10}$/.test(mobile.replace(/\s/g, ""))) {
      setStatus("error");
      setErrorMsg("Please enter a valid 10-digit mobile number.");
      return;
    }
    setStatus("loading");
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, mobile: mobile.replace(/\s/g, "") }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Something went wrong");
      }
      setStatus("success");
    } catch (err: unknown) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <div className="animate-fade-in text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/10 mb-4">
          <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">You're on the list!</h3>
        <p className="text-zinc-400 text-sm">
          We'll reach out before launch. Stay tuned.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
      <div className="flex flex-col gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (status === "error") setStatus("idle");
          }}
          placeholder="Your name"
          className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20 transition-all text-sm"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === "error") setStatus("idle");
          }}
          placeholder="Email address"
          className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20 transition-all text-sm"
        />
        <input
          type="tel"
          value={mobile}
          onChange={(e) => {
            setMobile(e.target.value);
            if (status === "error") setStatus("idle");
          }}
          placeholder="Mobile number"
          className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20 transition-all text-sm"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full px-6 py-3.5 bg-rose-500 hover:bg-rose-400 disabled:bg-rose-500/70 text-white font-medium rounded-xl transition-all duration-200 text-sm hover:shadow-lg hover:shadow-rose-500/20 active:scale-[0.98]"
        >
          {status === "loading" ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Joining...
            </span>
          ) : (
            "Join the waitlist"
          )}
        </button>
      </div>
      {status === "error" && (
        <p className="text-red-400 text-xs mt-2 animate-fade-in">{errorMsg}</p>
      )}
      <p className="text-zinc-500 text-xs mt-3 text-center">
        No spam. We'll notify you before launch.{" "}
        {onNavigate && (
          <span className="underline cursor-pointer hover:text-zinc-400 transition-colors" onClick={() => onNavigate("privacy")}>
            Privacy Policy
          </span>
        )}
      </p>
    </form>
  );
}

function ProfileCard({ name, age, city, role, intent, interests, delay }: {
  name: string; age: number; city: string; role: string; intent: number; interests: string; delay: number;
}) {
  const { ref, isInView } = useInView();
  const initials = name.charAt(0);

  return (
    <div
      ref={ref}
      className={`bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-5 transition-all duration-700 ${
        isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-rose-500/20 to-purple-500/20 flex items-center justify-center text-rose-300 font-medium text-sm border border-rose-500/10">
          {initials}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-white font-medium text-sm">{name}, {age}</span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-medium">
              <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Verified
            </span>
          </div>
          <p className="text-zinc-500 text-xs">{city} · {role}</p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-zinc-400 text-xs">{interests}</span>
        <span className="text-rose-400 text-xs font-medium">{intent}% intent</span>
      </div>
    </div>
  );
}

function PrivacyPolicy({ onNavigate }: { onNavigate: (page: string) => void }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-rose-500/[0.03] rounded-full blur-[120px]" />
      </div>

      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-zinc-950/80 border-b border-white/[0.04]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => onNavigate("home")} className="text-lg font-bold tracking-tight cursor-pointer">
            <span className="text-white">Bae</span>
            <span className="text-rose-400">'d</span>
          </button>
          <button
            onClick={() => onNavigate("home")}
            className="text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        </div>
      </nav>

      <section className="relative pt-28 pb-20 px-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">Privacy Policy</h1>
          <p className="text-zinc-500 text-sm mb-10">Last updated: 01-10-2026</p>

          <div className="space-y-8 text-zinc-300 text-sm leading-relaxed">
            <div>
              <h2 className="text-white font-semibold text-base mb-2">Overview</h2>
              <p>
                Bae'd respects your privacy. This policy explains what information we collect when you join our waitlist and how we use it.
              </p>
            </div>

            <div>
              <h2 className="text-white font-semibold text-base mb-2">Information We Collect</h2>
              <p>When you join the waitlist, we collect:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-zinc-400">
                <li>Your name</li>
                <li>Your email address</li>
                <li>Your mobile number</li>
              </ul>
            </div>

            <div>
              <h2 className="text-white font-semibold text-base mb-2">How We Use Your Information</h2>
              <p className="text-rose-300 font-medium">
                Your email address and mobile number will <span className="underline">only</span> be used for communication from the Bae'd app.
              </p>
              <p className="mt-2 text-zinc-400">
                This includes:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-zinc-400">
                <li>Notifying you when Bae'd launches</li>
                <li>Sending you updates about the app</li>
                <li>Communicating important information related to your account</li>
              </ul>
              <p className="mt-3 text-zinc-400">
                We will <span className="text-white font-medium">never</span> sell, share, or use your email or mobile number for any purpose other than direct communication from Bae'd. Your data is not shared with third parties, advertisers, or any external services.
              </p>
            </div>

            <div>
              <h2 className="text-white font-semibold text-base mb-2">Data Security</h2>
              <p>
                We take reasonable measures to protect your personal information from unauthorized access, alteration, or destruction.
              </p>
            </div>

            <div>
              <h2 className="text-white font-semibold text-base mb-2">Your Rights</h2>
              <p>
                You may request deletion of your data at any time by contacting us. We will remove your information promptly.
              </p>
            </div>

            <div>
              <h2 className="text-white font-semibold text-base mb-2">Changes to This Policy</h2>
              <p>
                We may update this policy from time to time. Any changes will be reflected on this page.
              </p>
            </div>

            <div>
              <h2 className="text-white font-semibold text-base mb-2">Contact</h2>
              <p>
                For any privacy-related questions, reach out to us through the app once it launches.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function LandingPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [count] = useState(32);
  const heroRef = useInView(0.1);
  const featuresRef = useInView(0.1);
  const profilesRef = useInView(0.1);
  const howItWorksRef = useInView(0.1);
  const wingmanRef = useInView(0.1);
  const curatedRef = useInView(0.1);

  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-hidden">
      {/* Ambient background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-rose-500/[0.03] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-purple-500/[0.02] rounded-full blur-[100px]" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-zinc-950/80 border-b border-white/[0.04]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-lg font-bold tracking-tight">
            <span className="text-white">Bae</span>
            <span className="text-rose-400">'d</span>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {count}+ waiting
          </span>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div
          ref={heroRef.ref}
          className={`max-w-3xl mx-auto text-center transition-all duration-1000 ${
            heroRef.isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-zinc-400 text-xs mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            India's first verified-first and intent based dating app
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
            Dating, without
            <br />
            the{" "}
            <span className="relative inline-block">
              <span className="text-rose-400 italic">doubt.</span>
              <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 200 8" fill="none">
                <path d="M2 6C50 2 150 2 198 6" stroke="rgb(244 63 94 / 0.3)" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
          </h1>

          <p className="text-zinc-400 text-base sm:text-lg max-w-lg mx-auto mb-10 leading-relaxed">
            Every profile is ID-verified before they can match. Real people. Real intent. Built for India.
          </p>

          <WaitlistForm onNavigate={onNavigate} />
        </div>
      </section>

      {/* Curated Profiles Section */}
      <section className="relative py-16 px-6">
        <div
          ref={curatedRef.ref}
          className={`max-w-2xl mx-auto transition-all duration-1000 ${
            curatedRef.isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-rose-500/[0.06] to-purple-500/[0.03] border border-rose-500/[0.08] overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-rose-500/5 rounded-full blur-3xl" />
            <div className="relative text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-rose-500/10 mb-4">
                <svg className="w-6 h-6 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">
                Selective, curated profiles — <span className="text-zinc-400">not a sea of strangers.</span>
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed max-w-md mx-auto">
                Unlike other apps that throw everyone at you, Bae'd handpicks profiles curated specifically for you. Every person you see has better intent, verified identity, and a genuine desire to connect.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative py-16 px-6">
        <div
          ref={featuresRef.ref}
          className={`max-w-4xl mx-auto transition-all duration-1000 delay-200 ${
            featuresRef.isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: "ID Verified",
                desc: "Every profile verified before matching",
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                ),
                title: "Real Profiles",
                desc: "Zero bots, zero fakes, zero doubt",
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                ),
                title: "Safe Conversations",
                desc: "Block, report, trusted contact — built in",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400 mb-3 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-white font-medium text-sm mb-1">{feature.title}</h3>
                <p className="text-zinc-500 text-xs leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative py-16 px-6">
        <div
          ref={howItWorksRef.ref}
          className={`max-w-3xl mx-auto transition-all duration-1000 ${
            howItWorksRef.isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="text-center mb-12">
            <p className="text-rose-400 text-xs font-medium tracking-wider uppercase mb-3">How it works</p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Verified before <span className="text-zinc-500">you match.</span>
            </h2>
          </div>

          <div className="space-y-6">
            {[
              {
                step: "01",
                title: "Create your profile",
                desc: "Add photos, write your bio, share what you're looking for. Your personality, honestly.",
              },
              {
                step: "02",
                title: "Verify your ID",
                desc: "Quick government ID verification. Takes under 2 minutes. Your data is never stored or shared.",
              },
              {
                step: "03",
                title: "Match with confidence",
                desc: "Every person you match with is real and verified. Focus on the connection, not the doubt.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex gap-5 items-start group"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-rose-400 text-xs font-bold group-hover:bg-rose-500/10 group-hover:border-rose-500/20 transition-all">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-white font-medium mb-1">{item.title}</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Verified Profiles */}
      <section className="relative py-16 px-6">
        <div
          ref={profilesRef.ref}
          className={`max-w-4xl mx-auto transition-all duration-1000 ${
            profilesRef.isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="text-center mb-10">
            <p className="text-rose-400 text-xs font-medium tracking-wider uppercase mb-3">Real people</p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Verified profiles <span className="text-zinc-500">across India.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ProfileCard name="Riya" age={27} city="Mumbai" role="UX Designer" intent={91} interests="Hikes · Coffee · Books" delay={0} />
            <ProfileCard name="Arjun" age={29} city="Pune" role="Software Engineer" intent={87} interests="Cycling · Films · Travel" delay={150} />
            <ProfileCard name="Priya" age={26} city="Bengaluru" role="Marketing Lead" intent={94} interests="Running · Food · Music" delay={300} />
          </div>
        </div>
      </section>

      {/* Wingman CTA - Updated */}
      <section className="relative py-16 px-6">
        <div
          ref={wingmanRef.ref}
          className={`max-w-2xl mx-auto transition-all duration-1000 ${
            wingmanRef.isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="relative p-8 rounded-3xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.06] overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl" />
            <div className="relative">
              <span className="text-3xl mb-4 block">🪽</span>
              <h3 className="text-xl font-bold text-white mb-2">While you wait, try Wingman</h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                Our free AI dating coach. Opens convos, reads signals, preps you for dates — works on any app.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/10 text-amber-300 text-xs">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  <strong className="text-amber-200">October 30th</strong> — live for the first few on the waitlist, then by invite only.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Real people.{" "}
            <span className="text-zinc-500">Better connections.</span>
          </h2>
          <p className="text-zinc-400 text-sm mb-8 max-w-md mx-auto">
            Be among the first to access Bae'd when we launch. No spam, just a heads-up before doors open.
          </p>
          <WaitlistForm onNavigate={onNavigate} />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold">
              <span className="text-white">Bae</span>
              <span className="text-rose-400">'d</span>
            </span>
            <span className="text-zinc-600 text-xs">· Dating, without the doubt.</span>
          </div>
          <button
            onClick={() => onNavigate("privacy")}
            className="text-xs text-zinc-500 hover:text-white transition-colors cursor-pointer"
          >
            Privacy Policy
          </button>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("home");

  if (page === "privacy") {
    return <PrivacyPolicy onNavigate={setPage} />;
  }

  return <LandingPage onNavigate={setPage} />;
}
