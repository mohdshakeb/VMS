interface FormFieldProps {
  label: string
  required?: boolean
  hint?: string
  error?: string
  children: React.ReactNode
}

export default function FormField({ label, required, hint, error, children }: FormFieldProps) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-text-primary">
        {label}
        {required && <span className="text-rejected ml-0.5">*</span>}
      </span>
      <div className="mt-1.5">{children}</div>
      {error && (
        <p className="text-xs text-rejected mt-1 flex items-center gap-1">
          <i className="ri-error-warning-line" />
          {error}
        </p>
      )}
      {!error && hint && <p className="text-xs text-text-tertiary mt-1">{hint}</p>}
    </label>
  )
}
