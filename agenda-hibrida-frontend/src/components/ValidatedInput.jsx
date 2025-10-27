/**
 * ValidatedInput - Campo de formulário com validação em tempo real
 * Feedback visual com ícones e mensagens de erro
 */

import React, { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';

export const ValidatedInput = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  validationFn,
  required = false,
  placeholder = '',
  disabled = false,
  error = '',
  className = ''
}) => {
  const [touched, setTouched] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleBlur = (e) => {
    setTouched(true);

    // Executar validação se fornecida
    if (validationFn && value) {
      const validation = validationFn(value);
      if (!validation.valid) {
        setLocalError(validation.message);
      } else {
        setLocalError('');
      }
    }

    // Callback adicional se fornecido
    if (onBlur) {
      onBlur(e);
    }
  };

  const handleChange = (e) => {
    // Limpar erro ao digitar
    if (localError) {
      setLocalError('');
    }

    onChange(e);
  };

  const showError = touched && (error || localError);
  const showSuccess = touched && value && !error && !localError && validationFn;

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={id} className="text-white">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={type}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            bg-white/10 border-white/20 text-white placeholder:text-white/40
            pr-10
            ${showError ? 'border-red-500 focus:border-red-500' : ''}
            ${showSuccess ? 'border-green-500 focus:border-green-500' : ''}
          `}
        />
        
        {/* Ícone de feedback */}
        {showSuccess && (
          <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400" />
        )}
        {showError && (
          <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-400" />
        )}
      </div>
      
      {/* Mensagem de erro */}
      {showError && (
        <p className="text-sm text-red-400 flex items-center gap-1">
          <XCircle className="w-4 h-4" />
          {error || localError}
        </p>
      )}
    </div>
  );
};

/**
 * ValidatedTextarea - Textarea com validação em tempo real
 */
export const ValidatedTextarea = ({
  id,
  label,
  value,
  onChange,
  onBlur,
  validationFn,
  required = false,
  placeholder = '',
  disabled = false,
  error = '',
  rows = 3,
  className = ''
}) => {
  const [touched, setTouched] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleBlur = (e) => {
    setTouched(true);

    if (validationFn && value) {
      const validation = validationFn(value);
      if (!validation.valid) {
        setLocalError(validation.message);
      } else {
        setLocalError('');
      }
    }

    if (onBlur) {
      onBlur(e);
    }
  };

  const handleChange = (e) => {
    if (localError) {
      setLocalError('');
    }
    onChange(e);
  };

  const showError = touched && (error || localError);
  const showSuccess = touched && value && !error && !localError && validationFn;

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={id} className="text-white">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </Label>
      <div className="relative">
        <textarea
          id={id}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          className={`
            w-full px-3 py-2 rounded-md
            bg-white/10 border border-white/20 text-white placeholder:text-white/40
            focus:outline-none focus:ring-2 focus:ring-purple-500
            ${showError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            ${showSuccess ? 'border-green-500 focus:border-green-500 focus:ring-green-500' : ''}
          `}
        />
      </div>
      
      {showError && (
        <p className="text-sm text-red-400 flex items-center gap-1">
          <XCircle className="w-4 h-4" />
          {error || localError}
        </p>
      )}
    </div>
  );
};

/**
 * ValidatedSelect - Select com validação
 */
export const ValidatedSelect = ({
  id,
  label,
  value,
  onChange,
  onBlur,
  required = false,
  disabled = false,
  error = '',
  options = [],
  placeholder = 'Selecione...',
  className = ''
}) => {
  const [touched, setTouched] = useState(false);

  const handleBlur = (e) => {
    setTouched(true);
    if (onBlur) {
      onBlur(e);
    }
  };

  const showError = touched && error;
  const showSuccess = touched && value && !error;

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={id} className="text-white">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </Label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={onChange}
          onBlur={handleBlur}
          disabled={disabled}
          className={`
            w-full px-3 py-2 rounded-md
            bg-white/10 border border-white/20 text-white
            focus:outline-none focus:ring-2 focus:ring-purple-500
            pr-10
            ${showError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            ${showSuccess ? 'border-green-500 focus:border-green-500 focus:ring-green-500' : ''}
          `}
        >
          <option value="" className="bg-gray-800">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-gray-800">
              {option.label}
            </option>
          ))}
        </select>

        {/* Ícone de feedback */}
        {showSuccess && (
          <CheckCircle className="absolute right-8 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400 pointer-events-none" />
        )}
        {showError && (
          <XCircle className="absolute right-8 top-1/2 -translate-y-1/2 w-5 h-5 text-red-400 pointer-events-none" />
        )}
      </div>
      
      {showError && (
        <p className="text-sm text-red-400 flex items-center gap-1">
          <XCircle className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  );
};

export default ValidatedInput;

