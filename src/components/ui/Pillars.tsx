// src/components/landing/Pillars.tsx
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { fadeUp, staggerList } from "../../lib/motion";

export default function Pillars() {
  const { t } = useTranslation();
  const pillars = t('pillars.items', { returnObjects: true }) as { title: string, desc: string }[];

  return (
    <section className="bg-surface-2 border-y border-border/60 px-6 md:px-12 py-16 md:py-12">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          variants={staggerList(0.1)}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {pillars.map((p) => (
            <motion.div
              key={p.title}
              variants={fadeUp}
              className="rounded-lg border border-border bg-surface-1 p-6 shadow-ci-hairline hover:shadow-ci transition-shadow"
            >
              <h4 className="font-semibold text-primary">{p.title}</h4>
              <p className="text-sm mt-1 text-text-muted">{p.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
