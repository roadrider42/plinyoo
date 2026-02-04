// src/components/landing/HowItWorks.tsx
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { fadeUp, staggerList } from "../../lib/motion";

export default function HowItWorks() {
  const { t } = useTranslation();
  const steps = t('howItWorks.steps', { returnObjects: true }) as { title: string, desc: string }[];

  return (
    <section className="bg-main-background px-6 md:px-12 py-16 md:py-12">
      <div className="max-w-5xl mx-auto">
        <motion.ol
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerList(0.12)}
          className="grid md:grid-cols-3 gap-6"
        >
          {steps.map((s, i) => (
            <motion.li key={s.title} variants={fadeUp} className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="text-3xl font-bold text-primary">{i + 1}</div>
              <h4 className="mt-2 font-semibold">{s.title}</h4>
              <p className="text-sm mt-1 text-main-text/80">{s.desc}</p>
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </section>
  );
}
