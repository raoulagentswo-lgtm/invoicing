import './Badge.css';

export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  ...props
}) => {
  const classes = `badge badge--${variant} badge--${size} ${className}`.trim();
  
  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
};

export default Badge;
