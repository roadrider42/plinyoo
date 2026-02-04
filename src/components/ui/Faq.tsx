// src/components/landing/Faq.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { fadeUp } from "../../lib/motion";

export default function Faq() {
  const { t } = useTranslation();
  const faqs = t('faq.items', { returnObjects: true }) as { q: string, a: string }[];
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="bg-main-background px-6 md:px-12 py-16 md:py-12">
      <div className="max-w-3xl mx-auto py-6">

      <h2 className="text-3xl font-bold font-serif text-primary mb-6 ">
          {t('faq.title')}
        </h2>
        <ul className="divide-y divide-gray-200 rounded-2xl border border-gray-200 bg-white">
          {faqs.map((f, i) => {
            const active = open === i;
            return (
              <li key={f.q}>
                <button
                  onClick={() => setOpen(active ? null : i)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between"
                >
                  <span className="font-semibold">{f.q}</span>
                  <span className="ml-4 text-primary">{active ? "–" : "+"}</span>
                </button>
                <AnimatePresence initial={false}>
                  {active && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="px-5 pb-4 text-sm text-main-text/80"
                    >
                      <motion.p variants={fadeUp} initial="hidden" animate="show">
                        {f.a}
                      </motion.p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
