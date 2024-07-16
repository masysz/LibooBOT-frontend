import React from "react";

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
    text: React.JSX.Element
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, htmlFor, text, ...props }, ref) => {
    return (
      <label
        htmlFor={htmlFor}
        className={`block text-xs font-medium text-gray-700 ${className}`}
        {...props}
        {...ref}
      >
        {text}
      </label>
    );
  }
);

Label.displayName = "Label";

export default Label;
