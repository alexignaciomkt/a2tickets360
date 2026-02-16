"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValue, useAnimationFrame, MotionValue } from "framer-motion";
import { Link } from "react-router-dom";
export const HeroParallax = ({
  products
}: {
  products: {
    title: string;
    link: string;
    thumbnail: string;
  }[];
}) => {
  // Duplica os produtos para criar o efeito infinito
  const duplicatedProducts = [...products, ...products];
  const firstRow = duplicatedProducts.slice(0, 10);
  const secondRow = duplicatedProducts.slice(10, 20);
  const thirdRow = duplicatedProducts.slice(20, 30);
  const ref = useRef(null);
  const {
    scrollYProgress
  } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });
  const springConfig = {
    stiffness: 300,
    damping: 30
  };

  // Scroll-based animations
  const translateX = useTransform(scrollYProgress, [0, 1], [0, 1000]);
  const translateXReverse = useTransform(scrollYProgress, [0, 1], [0, -1000]);
  const rotateX = useSpring(useTransform(scrollYProgress, [0, 0.2], [15, 0]), springConfig);
  const opacity = useSpring(useTransform(scrollYProgress, [0, 0.2], [0.2, 1]), springConfig);
  const rotateZ = useSpring(useTransform(scrollYProgress, [0, 0.2], [20, 0]), springConfig);
  const translateY = useSpring(useTransform(scrollYProgress, [0, 0.2], [-400, 200]), springConfig);

  // Movimento horizontal contínuo (infinito)
  const continuousMove = useMotionValue(0);
  useAnimationFrame(() => {
    continuousMove.set((continuousMove.get() + 0.5) % 100); // velocidade do movimento
  });
  return <div ref={ref} className="min-h-screen pb-10 overflow-hidden antialiased relative flex flex-col self-auto [perspective:1000px] [transform-style:preserve-3d] my-0">
    <Header />
    <motion.div style={{
      rotateX,
      rotateZ,
      translateY,
      opacity
    }} className="">
      <motion.div className="flex flex-row-reverse space-x-reverse space-x-8 mb-6">
        {firstRow.map((product, idx) => <ProductCard key={`${product.title}-${idx}`} product={product} translate={translateX} continuousMove={continuousMove} />)}
      </motion.div>
      <motion.div className="flex flex-row mb-6 space-x-8">
        {secondRow.map((product, idx) => <ProductCard key={`${product.title}-${idx}`} product={product} translate={translateXReverse} continuousMove={continuousMove} />)}
      </motion.div>
      <motion.div className="flex flex-row-reverse space-x-reverse space-x-8">
        {thirdRow.map((product, idx) => <ProductCard key={`${product.title}-${idx}`} product={product} translate={translateX} continuousMove={continuousMove} />)}
      </motion.div>
    </motion.div>
  </div>;
};
export const Header = () => {
  return <div className="max-w-7xl relative mx-auto py-10 md:py-16 px-4 w-full left-0 top-0 my-[228px]">
    <h1 className="text-2xl font-bold text-red-950 text-left md:text-5xl">
      A2 Tickets 360 <br /> A plataforma completa para seus eventos
    </h1>
    <p className="max-w-2xl text-sm md:text-base mt-4 dark:text-neutral-200">
      Compre ingressos, participe de eventos e compartilhe suas melhores experiências.
      Somos a plataforma que conecta você aos melhores eventos da sua região.
    </p>
  </div>;
};
export const ProductCard = ({
  product,
  translate,
  continuousMove
}: {
  product: {
    title: string;
    link: string;
    thumbnail: string;
  };
  translate: MotionValue<number>;
  continuousMove: MotionValue<number>;
}) => {
  return <motion.div style={{
    x: translate,
    translateX: continuousMove
  }} whileHover={{
    y: -20
  }} className="group/product h-72 w-[22rem] relative flex-shrink-0">
    <Link to={product.link} className="block group-hover/product:shadow-2xl">
      <img src={product.thumbnail} className="object-cover object-left-top absolute h-full w-full inset-0" alt={product.title} />
    </Link>
    <div className="absolute inset-0 h-full w-full opacity-0 group-hover/product:opacity-80 bg-black pointer-events-none"></div>
    <h2 className="absolute bottom-4 left-4 opacity-0 group-hover/product:opacity-100 text-white text-sm">
      {product.title}
    </h2>
  </motion.div>;
};
