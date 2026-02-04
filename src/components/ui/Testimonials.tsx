// src/components/landing/Testimonials.tsx
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { fadeUp, staggerList } from "../../lib/motion";

export default function Testimonials() {
  const { t } = useTranslation();
  const quotes = t('testimonials.quotes', { returnObjects: true }) as string[];

  return (
    <section className="bg-main-background px-6 md:px-12 py-16 md:py-12">
      <div className="max-w-4xl mx-auto">
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
              className="rounded-2xl border border-gray-200 bg-white p-6 text-center"
            >
              <p className="text-base text-main-text">{q}</p>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
