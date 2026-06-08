import { motion } from 'framer-motion';

function Card({ children, className = '', animate = true }) {
  const Comp = animate ? motion.div : 'div';
  const motionProps = animate
    ? { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.25 } }
    : {};

  return (
    <Comp className={`card ${className}`.trim()} {...motionProps}>
      {children}
    </Comp>
  );
}

export default Card;
