// src/components/landing/Outcomes.tsx
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { fadeUp, staggerList } from "../../lib/motion";

export default function Outcomes() {
  const { t } = useTranslation();
  const items = t('outcomes.items', { returnObjects: true }) as { kpi: string, label: string }[];

  return (
    <section className="bg-main-background px-6 md:px-12 py-16 md:py-12">
      <div className="max-w-6xl mx-auto">
        <motion.ul
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          variants={staggerList(0.1)}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {items.map((i) => (
            <motion.li
              key={i.label}
              variants={fadeUp}
              className="rounded-lg border border-border bg-surface-1 p-6 text-center shadow-ci-hairline"
            >
              <div className="text-4xl font-extrabold text-primary">{i.kpi}</div>
              <div className="mt-2 text-sm text-text-muted">{i.label}</div>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
