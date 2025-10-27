/**
 * ValidatedInput - Campo de formulário com validação em tempo real
 * Feedback visual com ícones, mensagens de erro e animações suaves
 * VERSÃO APRIMORADA com cores vibrantes e transições
 */

import React, { useState } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
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
      <Label htmlFor={id} className="text-white font-medium">
        {label}
        {required && <span className="text-red-400 ml-1 font-bold">*</span>}
      </Label>
      <div className="relative group">
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
            pr-10 transition-all duration-300 ease-in-out
            hover:bg-white/15 hover:border-white/30
            focus:ring-2 focus:ring-offset-0
            disabled:opacity-50 disabled:cursor-not-allowed
            ${showError ? 'border-red-500 bg-red-500/10 focus:border-red-500 focus:ring-red-500/50 animate-shake' : ''}
            ${showSuccess ? 'border-green-500 bg-green-500/10 focus:border-green-500 focus:ring-green-500/50' : ''}
            ${!showError && !showSuccess ? 'focus:ring-purple-500/50' : ''}
          `}
        />
        
        {/* Ícone de feedback com animação */}
        {showSuccess && (
          <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400 
                                   animate-in fade-in zoom-in duration-300" />
        )}
        {showError && (
          <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-400 
                               animate-in fade-in zoom-in duration-300" />
        )}
      </div>
      
      {/* Mensagem de erro com animação */}
      {showError && (
        <div className="animate-in slide-in-from-top-2 duration-300">
          <p className="text-sm text-red-400 flex items-center gap-1.5 bg-red-500/10 
                         border border-red-500/30 rounded-md px-3 py-2">
            <XCircle className="w-4 h-4 flex-shrink-0" />
            <span className="font-medium">{error || localError}</span>
          </p>
        </div>
      )}
      
      {/* Mensagem de sucesso (opcional) */}
      {showSuccess && !showError && (
        <div className="animate-in slide-in-from-top-2 duration-300">
          <p className="text-sm text-green-400 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4" />
            <span>✓ Campo válido</span>
          </p>
        </div>
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

/**
 * ValidatedButton - Botão que desabilita automaticamente se form inválido
 * Mostra loading durante operações assíncronas
 */
export const ValidatedButton = ({
  children,
  onClick,
  disabled = false,
  isLoading = false,
  loadingText = 'Processando...',
  type = 'button',
  variant = 'default', // default | destructive | outline | ghost
  size = 'default', // default | sm | lg
  className = '',
  icon: Icon = null,
  ...props
}) => {
  const baseStyles = `
    inline-flex items-center justify-center gap-2 rounded-md font-medium
    transition-all duration-200 ease-in-out
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
    disabled:pointer-events-none disabled:opacity-50
  `;

  const variantStyles = {
    default: `
      bg-gradient-to-r from-purple-600 to-blue-600 text-white
      hover:from-purple-700 hover:to-blue-700
      active:scale-95
      focus-visible:ring-purple-500
      disabled:from-gray-600 disabled:to-gray-600
    `,
    destructive: `
      bg-gradient-to-r from-red-600 to-red-700 text-white
      hover:from-red-700 hover:to-red-800
      active:scale-95
      focus-visible:ring-red-500
      disabled:from-gray-600 disabled:to-gray-600
    `,
    outline: `
      border-2 border-white/30 bg-transparent text-white
      hover:bg-white/10 hover:border-white/50
      active:scale-95
      focus-visible:ring-purple-500
      disabled:border-gray-600 disabled:text-gray-600
    `,
    ghost: `
      bg-transparent text-white
      hover:bg-white/10
      active:scale-95
      focus-visible:ring-purple-500
      disabled:text-gray-600
    `
  };

  const sizeStyles = {
    sm: 'h-9 px-3 text-sm',
    default: 'h-11 px-5 text-base',
    lg: 'h-12 px-8 text-lg'
  };

  const isDisabled = disabled || isLoading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{loadingText}</span>
        </>
      ) : (
        <>
          {Icon && <Icon className="w-4 h-4" />}
          {children}
        </>
      )}
    </button>
  );
};

export default ValidatedInput;

