export const modalOverlayVariant = {
  opened: {
    opacity: 1,
    transition: {
      duration: 0.25,
      ease: "easeOut",
    },
  },
  closed: {
    opacity: 0,
    transition: {
      duration: 0.25,
      ease: "easeInOut",
    },
  },
};
export const modalCardVariant = {
  opened: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.3,
      //   ease: "easeOut",
      ease: [0.41, 0.11, 0.22, 1.28],
    },
  },
  closed: {
    opacity: 0,
    // scale: 0,
    y: 50,
    transition: {
      duration: 0.3,
      // use cubic bezier curve for more control over the animation
      // ease: [0.6, -0.05, 0.01, 0.99],
      ease: [0.18, 0.89, 0.32, 1.27],
    },
  },
};
