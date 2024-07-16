

export const metrics = (taps: number) => {
    if (taps < 1000) {
        return {
            pointSuffix: <></>,
            status: "Noob",
        };
    } else if (taps >= 1000 && taps < 10000) {
        return {
            pointSuffix: "",
            status: "Beginner",
        };
    } else if (taps >= 10000 && taps < 100000) {
        return {
            pointSuffix: "",
            status: "Intermediate",
        };
    } else if (taps >= 100000 && taps < 1000000) {
        return {
            pointSuffix: "",
            status: "Pro",
        };
    } else if (taps >= 1000000 && taps < 10000000) {
        return {
            pointSuffix: "",
            status: "Master",
        };
    } else if (taps >= 10000000) {
        return {
            pointSuffix: "",
            status: "Legend",
        };
    }
};
