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
    <section className="bg-section-alternate px-6 md:px-12 py-16 md:py-12">
      <div className="max-w-3xl mx-auto py-6">

<<<<<<< /Users/heikomiertzsch/2. Areas/plinyoo/src/components/ui/Faq.tsx
<<<<<<< /Users/heikomiertzsch/2. Areas/plinyoo/src/components/ui/Faq.tsx
      <h2 className="text-3xl font-sans font-semibold text-text mb-6">
          {t('faq.title')}
        </h2>
        <ul className="divide-y divide-gray-200 rounded-2xl border border-gray-200 bg-white">
=======
=======
>>>>>>> /Users/heikomiertzsch/.windsurf/worktrees/plinyoo/plinyoo-a7eb93d5/src/components/ui/Faq.tsx
        {/* Intro-Satz - Knowledge Base Ton */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold font-headline text-primary mb-4">
            {t('faq.title')}
          </h2>
          <p className="text-sm text-text-muted">
            {t('faq.intro')}
          </p>
        </div>

        <ul className="divide-y divide-border rounded-lg border border-border bg-white">
<<<<<<< /Users/heikomiertzsch/2. Areas/plinyoo/src/components/ui/Faq.tsx
>>>>>>> /Users/heikomiertzsch/.windsurf/worktrees/plinyoo/plinyoo-a7eb93d5/src/components/ui/Faq.tsx
=======
>>>>>>> /Users/heikomiertzsch/.windsurf/worktrees/plinyoo/plinyoo-a7eb93d5/src/components/ui/Faq.tsx
          {faqs.map((f, i) => {
            const active = open === i;
            return (
              <li key={f.q}>
                <button
                  onClick={() => setOpen(active ? null : i)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-mist-green transition-colors duration-150"
                >
                  <span className="font-medium text-base">{f.q}</span>
                  <span className="ml-4 text-soft-teal text-sm">{active ? "−" : "+"}</span>
                </button>
                <AnimatePresence initial={false}>
                  {active && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-8 pb-4 text-sm text-text-muted pl-8"
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
