import { CheckCircle2 } from 'lucide-react';

interface Option {
  value: string;
  label: string;
  icon: string;
}

interface OptionGridProps {
  options: Option[];
  selected: string | string[] | null;
  onSelect: (value: string) => void;
  multiSelect?: boolean;
  singleColumn?: boolean;
}

export default function OptionGrid({ options, selected, onSelect, multiSelect, singleColumn }: OptionGridProps) {
  const isSelected = (value: string) => {
    if (Array.isArray(selected)) return selected.includes(value);
    return selected === value;
  };

  return (
    <div className={singleColumn ? 'grid grid-cols-1 gap-3' : 'grid grid-cols-1 md:grid-cols-2 gap-3'}>
      {options.map(option => (
        <button
          key={option.value}
          onClick={() => onSelect(option.value)}
          className={`p-4 rounded-lg border-2 text-left transition-all ${
            isSelected(option.value)
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-neutral-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-2xl mr-3">{option.icon}</span>
              <span className="font-medium text-foreground">{option.label}</span>
            </div>
            {multiSelect && isSelected(option.value) && (
              <CheckCircle2 className="size-5 text-primary" />
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
