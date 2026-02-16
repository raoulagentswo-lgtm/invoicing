import './Card.css';

export const Card = ({
  children,
  title,
  subtitle,
  variant = 'default',
  className = '',
  ...props
}) => {
  return (
    <div className={`card card--${variant} ${className}`.trim()} {...props}>
      {title && <h3 className="card-title">{title}</h3>}
      {subtitle && <p className="card-subtitle">{subtitle}</p>}
      <div className="card-content">
        {children}
      </div>
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`card-header ${className}`.trim()}>{children}</div>
);

export const CardBody = ({ children, className = '' }) => (
  <div className={`card-body ${className}`.trim()}>{children}</div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`card-footer ${className}`.trim()}>{children}</div>
);

export default Card;
