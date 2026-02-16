import './Button.css';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button',
  className = '',
  onClick,
  ...props
}) => {
  const classes = `btn btn--${variant} btn--${size} ${className}`.trim();
  
  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
