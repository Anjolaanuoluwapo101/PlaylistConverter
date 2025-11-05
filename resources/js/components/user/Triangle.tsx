import React from "react";
import { motion } from "framer-motion";

/**
 * Props for the AnimatedTriangle component
 * @param {object} props
 * @param {number} [props.size=100] - The side length of the triangle.
 * @param {number} [props.strokeWidth=8] - The thickness of the lines.
 * @param {string} [props.color="white"] - The color of the triangle.
 */
export const AnimatedTriangle = ({ size = 100, strokeWidth = 8, color = "black" }) => {
  // Calculate the height of an equilateral triangle
  const height = size * (Math.sqrt(3) / 2);

  // Define the SVG path for each of the three lines
  const paths = {
    // M = MoveTo, L = LineTo
    // The base line (bottom)
    base: `M 0 ${height} L ${size} ${height}`,
    // The left line
    left: `M 0 ${height} L ${size / 2} 0`,
    // The right line
    right: `M ${size} ${height} L ${size / 2} 0`,
  };

  // Animation variants for drawing the path
  // We animate the 'pathLength' from 0 to 1
  const drawVariant = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        duration: 3,
        ease: "easeInOut",
      },
    },
  };

  return (
    // We use 'whileInView' to trigger the animation when it scrolls into view.
    // 'viewport={{ once: true }}' ensures it only animates once.
    <motion.svg
      width={size}
      height={height}
      // viewBox defines the coordinate system
      viewBox={`0 0 ${size} ${height}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      {/* Base Line */}
      <motion.path
        d={paths.base}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="transparent"
        strokeLinecap="square"
        variants={drawVariant}
      />
      {/* Left Line */}
      <motion.path
        d={paths.left}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="transparent"
        strokeLinecap="square"
        variants={drawVariant}
      />
      {/* Right Line */}
      <motion.path
        d={paths.right}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="transparent"
        strokeLinecap="square"
        variants={drawVariant}
      />
    </motion.svg>
  );
};

export default AnimatedTriangle;