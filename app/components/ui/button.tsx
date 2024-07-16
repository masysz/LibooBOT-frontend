import * as React from "react"
import ComponentLoader from "../Loader/ComponentLoader";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    btnIcon?: React.ReactElement;
    minBtn?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, type, btnIcon, minBtn, ...props }, ref) => {
        return (
            <button
                type={type} 
                className={`bg-primary text-white font-medium ${minBtn ? "py-2 px-4 text-xs" : "py-3 px-6 text-base"} rounded-full hover:bg-primary-foreground hover:text:bg-primary ${className}`}
                ref={ref}
                {...props}
            >
                {btnIcon && <span>{btnIcon}</span>}
                {props.disabled && <ComponentLoader />}
                {props.children}
            </button>
        );
    }
);

Button.displayName = "Button";

export default Button;
