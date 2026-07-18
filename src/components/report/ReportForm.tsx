import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Category, NewReportInput, ReportType, Severity } from '../../types/report';
import { CATEGORY_LABELS, CATEGORY_ORDER, SEVERITY_LABELS } from '../../utils/visual';

interface ReportFormProps {
  lat: number;
  lng: number;
  onSubmit: (input: NewReportInput) => void;
  onCancel: () => void;
}

const TYPE_OPTIONS: { value: ReportType; label: string; hint: string }[] = [
  { value: 'crossing', label: 'Crossing sighting', hint: 'Animal(s) seen crossing, no collision' },
  { value: 'collision', label: 'Vehicle collision', hint: 'A vehicle struck an animal' },
];

const SEVERITY_OPTIONS: Severity[] = [1, 2, 3];

function fieldsetLabelClasses(isActive: boolean): string {
  const base = 'flex-1 cursor-pointer rounded-md border px-3 py-2 text-left text-sm transition-colors';
  return isActive
    ? `${base} border-brand-500 bg-brand-50 text-brand-700`
    : `${base} border-line text-ink-secondary hover:border-line-strong`;
}

export function ReportForm({ lat, lng, onSubmit, onCancel }: ReportFormProps) {
  const [type, setType] = useState<ReportType>('crossing');
  const [category, setCategory] = useState<Category>('mammal');
  const [severity, setSeverity] = useState<Severity>(1);
  const [note, setNote] = useState('');

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit({
      lat,
      lng,
      type,
      category,
      severity,
      note: note.trim() || undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <p className="text-xs text-ink-muted">
        Location: {lat.toFixed(5)}, {lng.toFixed(5)}
      </p>

      <fieldset>
        <legend className="mb-1.5 text-sm font-medium text-ink-primary">What happened?</legend>
        <div className="flex gap-2">
          {TYPE_OPTIONS.map((option) => (
            <label key={option.value} className={fieldsetLabelClasses(type === option.value)}>
              <input
                type="radio"
                name="type"
                value={option.value}
                checked={type === option.value}
                onChange={() => setType(option.value)}
                className="sr-only"
              />
              <span className="block font-medium">{option.label}</span>
              <span className="block text-xs text-ink-muted">{option.hint}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-1.5 text-sm font-medium text-ink-primary">Category</legend>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_ORDER.map((value) => (
            <label key={value} className={fieldsetLabelClasses(category === value)}>
              <input
                type="radio"
                name="category"
                value={value}
                checked={category === value}
                onChange={() => setCategory(value)}
                className="sr-only"
              />
              {CATEGORY_LABELS[value]}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-1.5 text-sm font-medium text-ink-primary">Severity</legend>
        <div className="flex flex-col gap-2">
          {SEVERITY_OPTIONS.map((value) => (
            <label key={value} className={fieldsetLabelClasses(severity === value)}>
              <input
                type="radio"
                name="severity"
                value={value}
                checked={severity === value}
                onChange={() => setSeverity(value)}
                className="sr-only"
              />
              {SEVERITY_LABELS[value]}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-ink-primary">Note (optional)</span>
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={3}
          maxLength={280}
          placeholder="Time of day, road conditions, anything else useful"
          className="rounded-md border border-line px-3 py-2 text-sm text-ink-primary placeholder:text-ink-muted focus:border-brand-500 focus:outline-none"
        />
      </label>

      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md px-3 py-2 text-sm font-medium text-ink-secondary hover:bg-surface-sunken"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
        >
          Submit report
        </button>
      </div>
    </form>
  );
}
