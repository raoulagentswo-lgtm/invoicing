import './Form.css';

export const Form = ({ children, onSubmit, className = '', ...props }) => {
  return (
    <form className={`form ${className}`.trim()} onSubmit={onSubmit} {...props}>
      {children}
    </form>
  );
};

export const FormGroup = ({ children, className = '', ...props }) => (
  <div className={`form-group ${className}`.trim()} {...props}>
    {children}
  </div>
);

export const FormRow = ({ children, className = '', columns = 2 }) => (
  <div className={`form-row form-row--cols-${columns} ${className}`.trim()}>
    {children}
  </div>
);

export const FormFieldset = ({ children, legend, className = '', ...props }) => (
  <fieldset className={`form-fieldset ${className}`.trim()} {...props}>
    {legend && <legend className="form-legend">{legend}</legend>}
    {children}
  </fieldset>
);

export const FormLabel = ({ children, htmlFor, required, className = '', ...props }) => (
  <label htmlFor={htmlFor} className={`input-label ${className}`.trim()} {...props}>
    {children}
    {required && <span className="required-indicator">*</span>}
  </label>
);

export const FormInput = ({
  type = 'text',
  id,
  name,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  required,
  disabled,
  className = '',
  ...props
}) => {
  const inputClass = `input ${error ? 'input--error' : ''} ${className}`.trim();
  
  return (
    <input
      type={type}
      id={id}
      name={name}
      className={inputClass}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      required={required}
      disabled={disabled}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : undefined}
      {...props}
    />
  );
};

export const FormTextarea = ({
  id,
  name,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  rows = 4,
  required,
  disabled,
  className = '',
  ...props
}) => {
  const textareaClass = `input input--textarea ${error ? 'input--error' : ''} ${className}`.trim();
  
  return (
    <textarea
      id={id}
      name={name}
      className={textareaClass}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      rows={rows}
      required={required}
      disabled={disabled}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : undefined}
      {...props}
    />
  );
};

export const FormSelect = ({
  id,
  name,
  value,
  onChange,
  options,
  error,
  required,
  disabled,
  placeholder,
  className = '',
  ...props
}) => {
  const selectClass = `input input--select ${error ? 'input--error' : ''} ${className}`.trim();
  
  return (
    <select
      id={id}
      name={name}
      className={selectClass}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : undefined}
      {...props}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};

export const FormError = ({ message, id }) => (
  message && <span id={id} className="input-error">{message}</span>
);

export const FormHelp = ({ text, id }) => (
  text && <span id={id} className="input-help">{text}</span>
);

export const FormActions = ({ children, className = '', ...props }) => (
  <div className={`form-actions ${className}`.trim()} {...props}>
    {children}
  </div>
);

export default Form;
