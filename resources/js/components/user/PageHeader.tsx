// import React from 'react';

// interface PageHeaderProps {
//     title: string;
//     description: string;
//     className?: string;
// }

// const PageHeader: React.FC<PageHeaderProps> = ({ title, description, className = '' }) => {
//     return (
//         <div className={`text-center mb-8 ${className}`}>
//             <h2 className="text-4xl md:text-5xl font-bold mb-4 text-black font-retro">
//                 {title}
//             </h2>
//             <p className="text-lg text-gray-600">
//                 {description}
//             </p>
//         </div>
//     );
// };

// export default PageHeader;


import React from "react";
import { motion } from "framer-motion";

interface PageHeaderProps {
  title: string;
  description: string;
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, description, className = '' }) => {
  const titleLetters = title.split('');
  const descWords = description.split(' ');

  return (
    <div className={`text-center mb-8 overflow-hidden ${className}`}>
      {/* Typing Title Animation */}
      <motion.h2
        className="text-4xl md:text-5xl font-bold mb-4 text-black font-retro inline-block"
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: { staggerChildren: 0.05 }
          }
        }}
      >
        {titleLetters.map((char, i) => (
          <motion.span
            key={i}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1 }
            }}
            transition={{ duration: 0.1 }}
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        ))}
      </motion.h2>

      {/* Falling Words Animation */}
      <div className="text-lg text-gray-600 flex flex-wrap justify-center gap-2">
        {descWords.map((word, i) => (
          <motion.span
            key={i}
            initial={{
              opacity: 0,
              y: -100 - Math.random() * 200, // random drop height
              x: Math.random() * 100 - 50,   // slight random horizontal offset
              rotate: Math.random() * 40 - 20
            }}
            animate={{
              opacity: 1,
              y: 0,
              x: 0,
              rotate: 0
            }}
            transition={{
              delay: 0.2 + i * 0.1,
              type: "spring",
              stiffness: 100,
              damping: 10
            }}
          >
            {word}
          </motion.span>
        ))}
      </div>
    </div>
  );
};

export default PageHeader;
