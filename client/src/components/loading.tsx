import { motion } from "framer-motion";
import { images } from "@/lib/data";

export function PageLoader() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      onAnimationComplete={() => {}}
      className="fixed inset-0 z-[100] bg-background flex items-center justify-center pointer-events-none"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.img
          src={images.logo}
          alt="Loading"
          className="w-16 h-16 opacity-80"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </motion.div>
    </motion.div>
  );
}

export function SectionLoader() {
  return (
    <div className="flex items-center justify-center py-12">
      <motion.div
        className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}
