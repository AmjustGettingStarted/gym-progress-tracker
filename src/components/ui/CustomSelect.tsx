import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  sublabel?: string;
  category?: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSearch?: boolean;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select an option...',
  className = '',
  size = 'md',
  showSearch = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(
    (opt) =>
      opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (opt.sublabel && opt.sublabel.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const paddingClass =
    size === 'sm'
      ? 'px-3 py-1.5 text-xs'
      : size === 'lg'
      ? 'px-4 py-3 text-sm'
      : 'px-3.5 py-2 text-xs font-semibold';

  return (
    <div className={`relative inline-block text-left ${className}`} ref={containerRef}>
      {/* Select Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between space-x-1.5 bg-gray-50 hover:bg-gray-100 dark:bg-zinc-800/90 dark:hover:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white rounded-lg transition-all cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50 ${paddingClass}`}
      >
        <span className="truncate font-semibold">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-500 dark:text-zinc-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Select Dropdown Content */}
      {isOpen && (
        <div className="absolute left-0 mt-1 w-48 sm:w-56 z-50 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl shadow-xl overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-100">
          {showSearch && options.length > 5 && (
            <div className="px-2.5 pb-1.5 pt-1 border-b border-gray-100 dark:border-zinc-800">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-8 pr-2.5 py-1 bg-gray-50 dark:bg-zinc-800 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-hidden border border-gray-200 dark:border-zinc-700"
                  autoFocus
                />
              </div>
            </div>
          )}

          <div className="max-h-56 overflow-y-auto p-1 space-y-0.5">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-xs text-gray-400 italic text-center">
                No matching options
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                        : 'text-gray-700 dark:text-zinc-200 hover:bg-emerald-50 dark:hover:bg-zinc-800/80 font-medium'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="truncate">{opt.label}</div>
                      {opt.sublabel && (
                        <div className={`text-[10px] truncate ${isSelected ? 'text-emerald-100' : 'text-gray-400 dark:text-zinc-400'}`}>
                          {opt.sublabel}
                        </div>
                      )}
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
