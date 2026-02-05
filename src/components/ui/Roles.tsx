// src/components/landing/Roles.tsx
import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { flyLeft, flyRight, staggerList, fadeUp } from "../../lib/motion";
import { Link } from "react-router-dom";

// Icons
function IconLeader() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8 text-soft-teal">
      <path fill="currentColor" d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4 0-6 2-6 4v1h12v-1c0-2-2-4-6-4Z"/>
    </svg>
  );
}
function IconCreator() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8 text-primary">
      <path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25Zm18-10.5a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75Z"/>
    </svg>
  );
}
function IconTeam() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8 text-primary">
      <path fill="currentColor" d="M16 11a3 3 0 1 0-3-3 3 3 0 0 0 3 3Zm-8 0a3 3 0 1 0-3-3 3 3 0 0 0 3 3Zm0 2c-3.33 0-5 1.67-5 3.33V18h6.5a5.49 5.49 0 0 1 1.58-3.89A7.71 7.71 0 0 0 8 13Zm8 0a5.48 5.48 0 0 0-3.5 1.27A4.5 4.5 0 0 0 12 18H22v-.67C22 14.67 19.33 13 16 13Z"/>
    </svg>
  );
}

export default function Roles() {
  const { t } = useTranslation();

  const overview = {
    title: t('roles.overview.title'),
    mini: t('roles.overview.mini_cards', { returnObjects: true }) as { title: string, desc: string }[],
    points: t('roles.overview.points', { returnObjects: true }) as string[],
    cta: { label: t('roles.overview.cta'), to: "/login" }
  };

  const roles = [
    {
      title: t('roles.leader.title'),
      points: t('roles.leader.points', { returnObjects: true }) as string[],
      cta: { label: t('roles.leader.cta'), to: "/login" },
      variant: flyLeft
    },
    {
      title: t('roles.creator.title'),
      points: t('roles.creator.points', { returnObjects: true }) as string[],
      cta: { label: t('roles.creator.cta'), to: "/login" },
      variant: flyRight
    },
    {
      title: t('roles.team.title'),
      points: t('roles.team.points', { returnObjects: true }) as string[],
      cta: { label: t('roles.team.cta'), to: "/login" },
      variant: flyLeft
    }
  ];

  const miniIcons = [<IconLeader />, <IconCreator />, <IconTeam />];
  return (
    <section className="bg-main-background text-main-text px-6 md:px-12 py-16 md:py-12">
      <div className="max-w-6xl mx-auto space-y-12">

        {/* Übersicht */}
        <motion.article
          className="rounded-lg border border-border bg-surface-1 p-8 md:p-12 shadow-ci-hairline text-center"
        >
          <h2 className="text-3xl font-bold font-headline text-primary mb-12">
            {overview.title}
          </h2>

          {/* Mini-Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-10">
            {overview.mini.map((item, index) => (
              <div
                key={item.title}
                className="group relative rounded-lg bg-surface-1 border border-border p-5 shadow-ci-hairline overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-surface-1/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                <div className="mx-auto h-12 w-12 rounded-lg bg-surface-2 flex items-center justify-center mb-3 relative z-10 border border-border">
                  {miniIcons[index]}
                </div>
                <div className="font-semibold text-primary relative z-10">{item.title}</div>
                <div className="text-sm text-text-muted mt-1 relative z-10">{item.desc}</div>
              </div>
            ))}
          </div>

          {/* Bullets */}
          <motion.ul variants={staggerList(0.08)} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} className="mx-auto grid gap-4 max-w-3xl text-left">
            {overview.points.map((p) => (
              <motion.li key={p} variants={fadeUp} className="flex items-start gap-3">
                <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-primary/60" />
                <span className="text-main-text/90">{p}</span>
              </motion.li>
            ))}
          </motion.ul>

          {/* CTA */}
          <div className="mt-8">
            <Link
              to={overview.cta.to}
              className="inline-flex items-center gap-2 bg-primary text-white hover:bg-primary/90 font-semibold px-5 py-2.5 rounded-xl transition"
            >
              {overview.cta.label}
            </Link>
          </div>
        </motion.article>

        {/* Einzelrollen */}
        <div className="space-y-8">
          {roles.map((r) => (
            <motion.article
              key={r.title}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.25 }}
              variants={r.variant}
              className="rounded-lg border border-border bg-surface-1 p-6 md:p-8 shadow-ci-hairline"
            >
              <h4 className="text-xl md:text-2xl font-bold font-headline text-primary mb-4">{r.title}</h4>

              <motion.ul variants={staggerList(0.08)} initial="hidden" animate="show" className="grid gap-4">
                {r.points.map((p) => (
                  <motion.li key={p} variants={fadeUp} className="flex items-start gap-3">
                    <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-primary/60" />
                    <span className="text-main-text/90">{p}</span>
                  </motion.li>
                ))}
              </motion.ul>

              <div className="mt-6">
                <Link
                  to={r.cta.to}
                  className="inline-flex items-center gap-2 bg-primary text-white hover:bg-primary/90 font-semibold px-4 py-2 rounded-xl transition"
                >
                  {r.cta.label}
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
