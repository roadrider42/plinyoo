// src/components/landing/VisionMission.tsx
import { motion, useReducedMotion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { fadeUp, staggerList } from "../../lib/motion";
import Tag from "./Tag";

export default function VisionMission() {
  const { t } = useTranslation();
  useReducedMotion();

  return (
    <section className="bg-surface-2 border-y border-border/60 text-main-text px-6 md:px-12 py-16 md:py-8">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerList(0.12)}
        >
          <motion.div variants={fadeUp}>
            <Tag variant="highlight">
              {t('visionMission.visionTitle')}
            </Tag>
            <p className="mt-6 text-lg md:text-xl">
              {t('visionMission.visionText')}
            </p>
          </motion.div>

          <motion.div className="mt-8" variants={fadeUp}>
            <Tag variant="primary">
              {t('visionMission.missionTitle')}
            </Tag>
            <p className="mt-6 text-lg md:text-xl">
              {t('visionMission.missionText')}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
