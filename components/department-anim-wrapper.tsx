"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

/**
 * Thin client boundary for department entrance animations.
 * Wraps each department block with a whileInView fade+slide reveal.
 */
export function DepartmentAnimWrapper({
    children,
    index,
}: {
    children: ReactNode;
    index: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px" }}
            transition={{
                duration: 0.6,
                delay: 0.05 * index,
                ease: [0.25, 0.1, 0.25, 1],
            }}
        >
            {children}
        </motion.div>
    );
}
