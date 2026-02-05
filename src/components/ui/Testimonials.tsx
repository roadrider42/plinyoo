// src/components/landing/Testimonials.tsx
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { fadeUp, staggerList } from "../../lib/motion";

export default function Testimonials() {
  const { t } = useTranslation();
  const title = t('testimonials.title');
  const subtitle = t('testimonials.subtitle');
  const quotes = t('testimonials.quotes', { returnObjects: true }) as string[];

  return (
    <section className="bg-main-background px-6 md:px-12 py-16 md:py-12">
      <div className="max-w-4xl mx-auto">
        {/* Beobachtungs-Frame statt Emotion */}
        <div className="mb-8 text-center">
          <h2 className="text-sm font-medium tracking-wide text-soft-teal mb-2 uppercase">
            {title}
          </h2>
          <p className="text-lg text-text-muted">
            {subtitle}
          </p>
        </div>

        <motion.ul
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          variants={staggerList(0.12)}
          className="grid md:grid-cols-2 gap-6"
        >
          {quotes.map((q) => (
            <motion.li
              key={q}
              variants={fadeUp}
              className="rounded-lg border-l-2 border-accent bg-white p-6 text-left hover:shadow-ci transition-shadow duration-200"
            >
              <p className="text-sm text-text-muted not-italic">{q}</p>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
