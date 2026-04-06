import { useState } from 'react';

// ── Validator factories ────────────────────────────────────────────────────────

export const required = (msg = 'This field is required') =>
  (value) => (!value || !String(value).trim() ? msg : '');

export const emailFormat = (msg = 'Enter a valid email address') =>
  (value) => (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '')) ? msg : '');

export const minLength = (min, msg) =>
  (value) =>
    String(value || '').trim().length < min
      ? msg || `Must be at least ${min} characters`
      : '';

export const exactDigits = (digits, msg) =>
  (value) =>
    !/^\d+$/.test(String(value || '')) || String(value || '').length !== digits
      ? msg || `Must be exactly ${digits} digits`
      : '';

export const greaterThan = (min, msg) =>
  (value) => (Number(value) <= min ? msg || `Must be greater than ${min}` : '');

export const minVal = (min, msg) =>
  (value) => (Number(value) < min ? msg || `Must be at least ${min}` : '');

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * useForm — lightweight form state + validation hook.
 *
 * @param {object} initialValues  — initial field values
 * @param {object} rules          — { fieldName: [validator, ...], ... }
 *
 * Validators are functions (value) => errorString | ''.
 *
 * Returns:
 *   values, errors, touched, submitted,
 *   handleChange, handleBlur, validate, reset, setValues, hasErrors
 */
export function useForm(initialValues, rules = {}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const validateField = (name, value) => {
    const fieldRules = rules[name] || [];
    for (const rule of fieldRules) {
      const msg = rule(value);
      if (msg) return msg;
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setValues((prev) => ({ ...prev, [name]: newValue }));
    // Re-validate field once user has already tried submitting or touched it
    if (submitted || touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, newValue) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  /** Run all validators. Returns true if form is valid. */
  const validate = () => {
    setSubmitted(true);
    const newErrors = {};
    Object.keys(rules).forEach((name) => {
      const err = validateField(name, values[name] ?? '');
      if (err) newErrors[name] = err;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setSubmitted(false);
  };

  /** True only after a submit attempt AND there are errors. */
  const hasErrors = submitted && Object.values(errors).some(Boolean);

  return {
    values,
    errors,
    touched,
    submitted,
    handleChange,
    handleBlur,
    validate,
    reset,
    setValues,
    hasErrors,
  };
}
