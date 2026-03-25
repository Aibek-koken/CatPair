import { useState, useRef, useEffect, useMemo } from 'react';

const OTHER_VALUE = '__OTHER__';

/**
 * Searchable breed selector with an "Other" (Другое) option.
 *
 * Props:
 *  - breeds        : Array<{ id, name }> from API
 *  - value         : selected breed id | OTHER_VALUE | '' (empty = nothing selected)
 *  - customValue   : string typed when "Other" is active
 *  - onChange       : (value: string) => void
 *  - onCustomChange: (text: string)  => void
 *  - placeholder    : string (optional)
 *  - label          : string (optional)
 *  - allowEmpty     : boolean – show a "Все породы" reset option (for filters)
 */
export default function BreedSelect({
  breeds = [],
  value = '',
  customValue = '',
  onChange,
  onCustomChange,
  placeholder = 'Поиск породы…',
  label,
  allowEmpty = false,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return breeds;
    const q = search.trim().toLowerCase();
    return breeds.filter((b) => b.name.toLowerCase().includes(q));
  }, [breeds, search]);

  const selectedLabel = useMemo(() => {
    if (value === OTHER_VALUE) return 'Другое';
    if (!value) return '';
    const found = breeds.find((b) => String(b.id) === String(value));
    return found ? found.name : '';
  }, [value, breeds]);

  const handleSelect = (val) => {
    onChange(val);
    setSearch('');
    setOpen(false);
    if (val !== OTHER_VALUE && onCustomChange) {
      onCustomChange('');
    }
  };

  const isOther = value === OTHER_VALUE;

  return (
    <div className="flex flex-col gap-2 text-sm" ref={wrapperRef}>
      {label && <span className="font-semibold text-ink">{label}</span>}

      {/* Trigger / search input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          className="w-full rounded-2xl border border-border bg-white px-3 py-2 pr-8 text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          placeholder={selectedLabel || placeholder}
          value={open ? search : selectedLabel}
          onFocus={() => {
            setOpen(true);
            setSearch('');
          }}
          onChange={(e) => setSearch(e.target.value)}
          autoComplete="off"
        />
        {/* chevron */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted transition ${open ? 'rotate-180' : ''}`}
        >
          <path
            fillRule="evenodd"
            d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
            clipRule="evenodd"
          />
        </svg>

        {/* Dropdown */}
        {open && (
          <ul className="absolute z-30 mt-1 max-h-56 w-full overflow-y-auto rounded-2xl border border-border bg-white py-1 shadow-card">
            {allowEmpty && (
              <li>
                <button
                  type="button"
                  className={`w-full px-3 py-2 text-left hover:bg-accent/5 ${
                    !value ? 'font-semibold text-accent' : 'text-muted'
                  }`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect('')}
                >
                  Все породы
                </button>
              </li>
            )}

            {/* "Other" option pinned at top */}
            <li>
              <button
                type="button"
                className={`w-full px-3 py-2 text-left hover:bg-accent/5 ${
                  isOther ? 'font-semibold text-accent' : 'text-ink'
                }`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(OTHER_VALUE)}
              >
                Другое (ввести вручную)
              </button>
            </li>

            {allowEmpty || filtered.length > 0 ? (
              <li>
                <hr className="my-1 border-border" />
              </li>
            ) : null}

            {filtered.length === 0 && (
              <li className="px-3 py-2 text-muted">Ничего не найдено</li>
            )}

            {filtered.map((breed) => (
              <li key={breed.id}>
                <button
                  type="button"
                  className={`w-full px-3 py-2 text-left hover:bg-accent/5 ${
                    String(value) === String(breed.id) ? 'font-semibold text-accent' : 'text-ink'
                  }`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(String(breed.id))}
                >
                  {breed.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Custom breed input (shown when "Other" is selected) */}
      {isOther && (
        <input
          type="text"
          className="w-full rounded-2xl border border-border bg-white/80 px-4 py-3 text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          placeholder="Введите породу вручную"
          value={customValue}
          onChange={(e) => onCustomChange?.(e.target.value)}
          autoFocus
        />
      )}
    </div>
  );
}

export { OTHER_VALUE };
