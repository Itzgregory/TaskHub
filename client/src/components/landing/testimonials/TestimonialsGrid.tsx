import { TESTIMONIALS } from "@/lib/constants/landing";
import { TestimonialCard } from "./TestimonialCard";

export function TestimonialsGrid() {
  return (
    <section className="max-w-7xl mx-auto px-5 md:px-8 py-24">
      <div className="text-center mb-14">
        <h2
          style={{ color: "var(--c-texPri)" }}
          className="text-3xl sm:text-4xl font-bold tracking-tight mb-3"
        >
          Loved by teams everywhere
        </h2>
        <p style={{ color: "var(--c-texSec)" }} className="text-lg">
          Don't take our word for it. Here's what real teams say.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {TESTIMONIALS.map((testimonial) => (
          <TestimonialCard key={testimonial.name} {...testimonial} />
        ))}
      </div>
    </section>
  );
}