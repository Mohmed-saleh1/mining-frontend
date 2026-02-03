"use client";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Crypto Investor",
      location: "Singapore",
      image: "SC",
      rating: 5,
      text: "I've been using this platform for 6 months and the returns have been consistent. The daily payouts are reliable and the support team is incredibly responsive. Highly recommend!",
    },
    {
      name: "Michael Rodriguez",
      role: "Business Owner",
      location: "USA",
      image: "MR",
      rating: 5,
      text: "As someone new to crypto mining, I was hesitant at first. But the platform made it so easy - no technical setup needed. I'm earning passive income daily without any hassle.",
    },
    {
      name: "David Kim",
      role: "Trader",
      location: "South Korea",
      image: "DK",
      rating: 5,
      text: "The transparency is what sold me. I can see exactly what my machines are doing in real-time. The profit calculations are accurate and payouts are always on time.",
    },
    {
      name: "Emma Thompson",
      role: "Entrepreneur",
      location: "UK",
      image: "ET",
      rating: 5,
      text: "Best investment decision I've made this year. The platform is professional, secure, and profitable. I've already referred several friends who are now earning too!",
    },
    {
      name: "James Wilson",
      role: "Developer",
      location: "Canada",
      image: "JW",
      rating: 5,
      text: "I appreciate the technical excellence. The uptime is impressive and the dashboard provides all the metrics I need. It's clear they know what they're doing.",
    },
    {
      name: "Lisa Anderson",
      role: "Financial Advisor",
      location: "Australia",
      image: "LA",
      rating: 5,
      text: "After researching multiple platforms, this one stood out for its security measures and track record. My clients trust it, and so do I. Excellent service all around.",
    },
  ];

  return (
    <section className="py-20 relative">
      <div className="absolute inset-0 hero-pattern opacity-30" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            What Our <span className="gradient-text">Users Say</span>
          </h2>
          <p className="text-foreground-muted text-lg max-w-2xl mx-auto">
            Join thousands of satisfied miners who are earning passive income with our platform
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.name}
              className="glass rounded-2xl p-6 card-hover animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Rating */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 text-gold"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="text-foreground-muted mb-6 leading-relaxed">
                &quot;{testimonial.text}&quot;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold text-sm">
                  {testimonial.image}
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-foreground-muted">
                    {testimonial.role} • {testimonial.location}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

