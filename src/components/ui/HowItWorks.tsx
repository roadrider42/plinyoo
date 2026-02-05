// src/components/landing/HowItWorks.tsx
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { fadeUp, staggerList } from "../../lib/motion";

export default function HowItWorks() {
  const { t } = useTranslation();
  const steps = t('howItWorks.steps', { returnObjects: true }) as { title: string, desc: string }[];

  return (
    <section className="bg-section-alternate px-6 md:px-12 py-16 md:py-12">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-3xl font-bold font-headline text-primary mb-12">
          {t('howItWorks.title', "So einfach geht's")}
        </h2>
        <motion.ol
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerList(0.12)}
          className="grid md:grid-cols-3 gap-8 text-left"
        >
          {steps.map((s, i) => (
            <motion.li 
              key={s.title} 
              variants={fadeUp} 
              className="rounded-xl border border-border bg-white p-6 transition-all hover:shadow-lg hover:-translate-y-1"
            >
              <div className="text-5xl font-bold text-primary/20 mb-4">{String(i + 1).padStart(2, '0')}</div>
              <h4 className="mt-2 font-semibold text-primary">{s.title}</h4>
              <p className="text-sm mt-1 text-main-text/80">{s.desc}</p>
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </section>
  );
}
