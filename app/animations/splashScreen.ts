export const splashScreenVariant = {
    opened: {
        opacity: 1,
        height: "100vh",
        transition: {
            duration: 0.25,
            ease: "easeOut",
        },
    },
    closed: {
        opacity: 0,
        height: "auto",
        transition: {
            duration: 0.25,
            ease: "easeInOut",
        },
    },
}