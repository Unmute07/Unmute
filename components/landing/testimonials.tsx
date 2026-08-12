"use client";

import { motion } from "framer-motion";

import { SectionHeading } from "@/components/landing/section-heading";
import { TestimonialCard } from "@/components/landing/testimonial-card";

type Testimonial = {
  name: string;
  role: string;
  quote: string;
};

type TestimonialsProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
  testimonials: Testimonial[];
};

export function Testimonials({
  eyebrow = "Testimonials",
  title = "Loved by people preparing for the next chapter",
  description = "The experience is designed to be supportive, focused, and genuinely useful when the pressure is on.",
  testimonials,
}: TestimonialsProps) {
  return (
    <section className="section-container">
      <SectionHeading eyebrow={eyebrow} title={title} description={description} align="center" />
      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={testimonial.name}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <TestimonialCard {...testimonial} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
