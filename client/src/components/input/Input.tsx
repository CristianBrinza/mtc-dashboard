import { FC } from 'react';
import Icon, { icons } from '../Icon';
import styles from './Input.module.css';

interface InputProps {
  placeholder?: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;  // Updated type
  icon?: keyof typeof icons;
  name?: string;
  required?: boolean;
  className?: string;
  type?: string;
  min?: string;
  max?: string;
    readOnly?: boolean;
    disabled?: boolean;
    maxWidth?: string;
    minWidth?: string;
    iconcolor?: string;
}

const Input: FC<InputProps> = ({
                                 placeholder,
                                 value,
                                 onChange,
                                 icon,
                                 name,
                                 required = false,
                                 className = '',
                                 type = 'text',
                                 min,
                                 max,
                                   readOnly = false,
                                   disabled = false,
                                   maxWidth="auto",
                                   minWidth="auto",
                                   iconcolor="#D9DFFF"
                               }) => {
  return (
      <div className={`${styles.costume_input_block} ${className}`}>
        <input
            type={type}
            name={name}
            value={value}
            placeholder={placeholder}
            required={required}
            className={styles.costume_input}
            onChange={onChange}  // Pass the event directly
            min={min}
            max={max}
            readOnly={readOnly}
            disabled={disabled}
            style={{ maxWidth, minWidth }}
        />
        {icon && (
            <Icon
                className={styles.costume_input_svg}
                type={icon}
                color={iconcolor}
            />
        )}
      </div>
  );
};

export default Input;
