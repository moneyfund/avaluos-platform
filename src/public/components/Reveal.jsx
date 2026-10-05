import { motion } from 'framer-motion';

export default function Reveal({ children, className = '', delay = 0, y = 24 }) {
  return <motion.div
    className={className}
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: .2 }}
    transition={{ duration: .72, delay }}
  >
    {children}
  </motion.div>;
}
