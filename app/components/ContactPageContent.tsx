"use client";

import { useState, FormEvent } from "react";
import { contactPublicApi, ContactSubject } from "@/app/lib/api";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subject: ContactSubject | "";
  message: string;
}

const ContactPageContent = () => {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      if (!formData.firstName || !formData.email || !formData.subject || !formData.message) {
        throw new Error("Please fill in all required fields");
      }

      await contactPublicApi.submit({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || undefined,
        subject: formData.subject as ContactSubject,
        message: formData.message,
      });
      
      setSubmitStatus({
        type: "success",
        message: "Thank you for your message! We'll get back to you within 24 hours.",
      });
      setFormData({ firstName: "", lastName: "", email: "", phone: "", subject: "", message: "" });
    } catch (err: unknown) {
      const error = err as Error;
      setSubmitStatus({
        type: "error",
        message: error?.message || "Something went wrong. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const stats = [
    { label: "Active Users", value: "8,750", icon: "👥" },
    { label: "Total Deposits", value: "$2,865,500", icon: "💰" },
    { label: "Total Payouts", value: "$363,530", icon: "📊" },
  ];

  const contactMethods = [
    {
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      title: "Email Support",
      description: "Get a response within 2 hours",
      value: "support@x-bin.com",
      action: "mailto:support@x-bin.com",
      gradient: "from-amber-500/20 to-yellow-600/20",
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      title: "Live Chat",
      description: "Available 24/7 for instant help",
      value: "Start Chat Now",
      action: "#",
      gradient: "from-emerald-500/20 to-green-600/20",
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      title: "Phone Support",
      description: "Mon-Fri from 8am to 6pm UTC",
      value: "+1 (555) 123-4567",
      action: "tel:+15551234567",
      gradient: "from-blue-500/20 to-indigo-600/20",
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: "Office Location",
      description: "Visit our headquarters",
      value: "123 Crypto Street, Digital City",
      action: "#",
      gradient: "from-purple-500/20 to-pink-600/20",
    },
  ];

  const faqs = [
    {
      question: "How long does it take to process withdrawals?",
      answer: "Withdrawals are typically processed within 24-48 hours. For larger amounts, additional verification may be required which can take up to 72 hours.",
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept Bitcoin (BTC), Ethereum (ETH), USDT, and other major cryptocurrencies. Bank transfers are available for verified accounts.",
    },
    {
      question: "Is my investment secure?",
      answer: "Yes, we use industry-leading security measures including cold storage for funds, 2FA authentication, and regular security audits to protect your assets.",
    },
    {
      question: "What is the minimum investment amount?",
      answer: "The minimum investment varies by package. Our starter package begins at $100, while premium packages have higher minimums for increased returns.",
    },
    {
      question: "How do I track my earnings?",
      answer: "You can track all your earnings in real-time through your dashboard. We provide detailed reports on daily profits, withdrawals, and overall portfolio performance.",
    },
  ];

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="pt-24 pb-20 relative overflow-hidden">
      {/* Decorative orbs */}
      <div className="absolute top-20 right-10 w-96 h-96 bg-linear-to-br from-gold/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-40 left-0 w-80 h-80 bg-linear-to-tr from-gold/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      
      {/* Hero Section */}
      <section className="relative py-16">
        <div className="absolute inset-0 hero-pattern opacity-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-linear-to-r from-gold/10 to-gold/5 border border-gold/20 mb-8">
              <span className="w-2 h-2 rounded-full bg-green animate-pulse" />
              <span className="text-gold text-sm font-medium tracking-wide">24/7 Support Available</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
              Get In <span className="gradient-text">Touch</span>
            </h1>
            <p className="text-foreground-muted text-lg max-w-2xl mx-auto leading-relaxed">
              Have questions about our platform? Need assistance with your account? 
              Our dedicated support team is here to help you every step of the way.
            </p>
          </div>

          {/* Stats Bar */}
          <div className="mt-16 grid grid-cols-3 gap-4 max-w-3xl mx-auto animate-fade-in-up stagger-1">
            {stats.map((stat, index) => (
              <div 
                key={stat.label}
                className="relative group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="absolute inset-0 bg-linear-to-br from-gold/20 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative glass rounded-2xl p-5 text-center border border-gold/10 hover:border-gold/30 transition-all duration-300">
                  <span className="text-2xl mb-2 block">{stat.icon}</span>
                  <div className="text-xl sm:text-2xl font-bold text-gold mb-1">{stat.value}</div>
                  <div className="text-foreground-muted text-xs sm:text-sm">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Methods Grid */}
      <section className="py-12 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {contactMethods.map((method, index) => (
              <a
                key={method.title}
                href={method.action}
                className="group relative animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Hover glow effect */}
                <div className={`absolute inset-0 bg-linear-to-br ${method.gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500`} />
                
                <div className="relative h-full glass rounded-2xl p-6 border border-gold/10 hover:border-gold/30 transition-all duration-300 hover:-translate-y-1">
                  {/* Icon container */}
                  <div className="w-14 h-14 rounded-xl bg-linear-to-br from-gold/20 to-gold/5 border border-gold/30 flex items-center justify-center text-gold mb-5 group-hover:scale-110 transition-transform duration-300">
                    {method.icon}
                  </div>
                  
                  <h3 className="text-lg font-semibold text-foreground mb-1.5">
                    {method.title}
                  </h3>
                  <p className="text-foreground-muted text-sm mb-3 leading-relaxed">
                    {method.description}
                  </p>
                  <span className="text-gold font-medium text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
                    {method.value}
                    <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="py-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Contact Form - Takes 3 columns */}
            <div className="lg:col-span-3 animate-fade-in-up">
              <div className="relative">
                <div className="absolute inset-0 bg-linear-to-br from-gold/10 to-transparent rounded-3xl blur-2xl opacity-50" />
                <div className="relative glass rounded-3xl p-8 lg:p-10 border border-gold/10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">
                      Send Us a Message
                    </h2>
                  </div>
                  <p className="text-foreground-muted mb-8 ml-13">
                    Fill out the form and we&apos;ll respond within 24 hours.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label
                          htmlFor="firstName"
                          className="block text-sm font-medium text-foreground-muted"
                        >
                          First Name <span className="text-gold">*</span>
                        </label>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          required
                          className="input-gold w-full px-4 py-3.5 rounded-xl bg-background-secondary/50"
                          placeholder="Ahmed"
                        />
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="lastName"
                          className="block text-sm font-medium text-foreground-muted"
                        >
                          Last Name
                        </label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          className="input-gold w-full px-4 py-3.5 rounded-xl bg-background-secondary/50"
                          placeholder="Hassan"
                        />
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-foreground-muted"
                        >
                          Email Address <span className="text-gold">*</span>
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="input-gold w-full px-4 py-3.5 rounded-xl bg-background-secondary/50"
                          placeholder="ahmed@example.com"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label
                          htmlFor="phone"
                          className="block text-sm font-medium text-foreground-muted"
                        >
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="input-gold w-full px-4 py-3.5 rounded-xl bg-background-secondary/50"
                          placeholder="+1 (555) 000-0000"
                        />
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="subject"
                          className="block text-sm font-medium text-foreground-muted"
                        >
                          Subject <span className="text-gold">*</span>
                        </label>
                        <div className="relative">
                          <select
                            id="subject"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            required
                            className="input-gold w-full px-4 py-3.5 rounded-xl bg-background-secondary/50 appearance-none cursor-pointer"
                          >
                            <option value="">Select a topic</option>
                            <option value="general">General Inquiry</option>
                            <option value="booking">Booking</option>
                            <option value="complaint">Complaint</option>
                            <option value="feedback">Feedback</option>
                            <option value="partnership">Partnership</option>
                            <option value="other">Other</option>
                          </select>
                          <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="message"
                        className="block text-sm font-medium text-foreground-muted"
                      >
                        Message <span className="text-gold">*</span>
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={5}
                        className="input-gold w-full px-4 py-3.5 rounded-xl bg-background-secondary/50 resize-none"
                        placeholder="Please describe your inquiry in detail..."
                      />
                    </div>

                    {submitStatus.type && (
                      <div
                        className={`p-4 rounded-xl flex items-center gap-3 ${
                          submitStatus.type === "success"
                            ? "bg-green/10 border border-green/30 text-green"
                            : "bg-red/10 border border-red/30 text-red"
                        }`}
                      >
                        {submitStatus.type === "success" ? (
                          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                        <span>{submitStatus.message}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-gold w-full py-4 rounded-xl font-semibold text-base tracking-wide flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Message
                          <svg
                            className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                            />
                          </svg>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Right Side Info - Takes 2 columns */}
            <div className="lg:col-span-2 space-y-6 animate-fade-in-up stagger-2">
              {/* Map Card */}
              <div className="relative group">
                <div className="absolute inset-0 bg-linear-to-br from-gold/10 to-transparent rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative glass rounded-3xl overflow-hidden border border-gold/10">
                  <div className="h-56 bg-linear-to-br from-background-secondary to-background relative">
                    {/* Grid overlay */}
                    <div className="absolute inset-0 grid-pattern opacity-50" />
                    
                    {/* Decorative elements */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative">
                        {/* Pulsing rings */}
                        <div className="absolute inset-0 w-32 h-32 rounded-full border border-gold/20 animate-ping" style={{ animationDuration: '3s' }} />
                        <div className="absolute inset-0 w-32 h-32 rounded-full border border-gold/30 animate-ping" style={{ animationDuration: '3s', animationDelay: '1s' }} />
                        
                        {/* Center marker */}
                        <div className="w-16 h-16 rounded-full bg-linear-to-br from-gold/30 to-gold/10 border-2 border-gold flex items-center justify-center">
                          <svg className="w-7 h-7 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    {/* Location label */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="glass rounded-xl px-4 py-3 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gold/20 flex items-center justify-center">
                          <svg className="w-4 h-4 text-gold" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-foreground font-medium text-sm">Our Headquarters</p>
                          <p className="text-foreground-muted text-xs">123 Crypto Street, Digital City</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Hours */}
              <div className="relative group">
                <div className="absolute inset-0 bg-linear-to-br from-gold/10 to-transparent rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative glass rounded-3xl p-6 border border-gold/10">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">Business Hours</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-border/30">
                      <span className="text-foreground-muted">Live Chat</span>
                      <span className="text-green font-medium flex items-center gap-2 text-sm">
                        <span className="w-2 h-2 rounded-full bg-green animate-pulse" />
                        24/7 Available
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-border/30">
                      <span className="text-foreground-muted">Email Support</span>
                      <span className="text-foreground text-sm">24/7 (2hr response)</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-border/30">
                      <span className="text-foreground-muted">Phone Support</span>
                      <span className="text-foreground text-sm">Mon-Fri 8AM-6PM</span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-foreground-muted">Office Hours</span>
                      <span className="text-foreground text-sm">Mon-Fri 9AM-5PM</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="relative group">
                <div className="absolute inset-0 bg-linear-to-br from-gold/10 to-transparent rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative glass rounded-3xl p-6 border border-gold/10">
                  <h3 className="text-lg font-semibold text-foreground mb-5">
                    Connect With Us
                  </h3>
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      {
                        name: "Twitter",
                        icon: (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                          </svg>
                        ),
                        href: "#",
                        color: "hover:bg-[#1DA1F2]/10 hover:border-[#1DA1F2]/30 hover:text-[#1DA1F2]",
                      },
                      {
                        name: "Telegram",
                        icon: (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                          </svg>
                        ),
                        href: "#",
                        color: "hover:bg-[#0088CC]/10 hover:border-[#0088CC]/30 hover:text-[#0088CC]",
                      },
                      {
                        name: "Discord",
                        icon: (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                          </svg>
                        ),
                        href: "#",
                        color: "hover:bg-[#5865F2]/10 hover:border-[#5865F2]/30 hover:text-[#5865F2]",
                      },
                      {
                        name: "LinkedIn",
                        icon: (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                          </svg>
                        ),
                        href: "#",
                        color: "hover:bg-[#0A66C2]/10 hover:border-[#0A66C2]/30 hover:text-[#0A66C2]",
                      },
                    ].map((social) => (
                      <a
                        key={social.name}
                        href={social.href}
                        className={`aspect-square rounded-xl bg-background-secondary border border-border/50 flex items-center justify-center text-foreground-muted transition-all duration-300 ${social.color}`}
                        aria-label={social.name}
                      >
                        {social.icon}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 relative">
        <div className="absolute inset-0 hero-pattern opacity-30" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 mb-6">
              <svg className="w-4 h-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-gold text-sm font-medium">FAQ</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Frequently Asked <span className="gradient-text">Questions</span>
            </h2>
            <p className="text-foreground-muted max-w-2xl mx-auto">
              Find quick answers to common questions. Can&apos;t find what you&apos;re looking for? Contact our support team.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="animate-fade-in-up group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`glass rounded-2xl overflow-hidden border transition-all duration-300 ${openFaq === index ? 'border-gold/30' : 'border-gold/10 hover:border-gold/20'}`}>
                  <button
                    className="w-full px-6 py-5 flex items-center justify-between text-left"
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  >
                    <span className="font-medium text-foreground pr-4">{faq.question}</span>
                    <div className={`w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center shrink-0 transition-all duration-300 ${openFaq === index ? 'bg-gold/20 rotate-180' : ''}`}>
                      <svg
                        className="w-4 h-4 text-gold"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      openFaq === index ? "max-h-48" : "max-h-0"
                    }`}
                  >
                    <div className="px-6 pb-5 text-foreground-muted leading-relaxed">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative animate-fade-in-up">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-linear-to-r from-gold/20 via-gold/10 to-gold/20 rounded-3xl blur-2xl" />
            
            <div className="relative glass rounded-3xl p-8 sm:p-12 text-center border border-gold/20 overflow-hidden">
              {/* Decorative pattern */}
              <div className="absolute inset-0 grid-pattern opacity-30" />
              
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-gold/20 to-gold/5 border border-gold/30 flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                
                <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                  Still Have Questions?
                </h2>
                <p className="text-foreground-muted mb-8 max-w-xl mx-auto">
                  Our support team is standing by to help. Start a live chat for instant assistance or schedule a call with our experts.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button className="btn-gold px-8 py-4 rounded-xl font-semibold inline-flex items-center justify-center gap-2 group">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Start Live Chat
                    <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                  <button className="btn-outline px-8 py-4 rounded-xl font-semibold inline-flex items-center justify-center gap-2 group">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Schedule a Call
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPageContent;
