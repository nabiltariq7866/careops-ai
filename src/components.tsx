import {
  Children,
  isValidElement,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { Check, ChevronDown, X, Sparkles } from "lucide-react";
export const Button = ({
  children,
  variant = "",
  ...p
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string }) => (
  <button className={`btn ${variant}`} {...p}>
    {children}
  </button>
);
export const Card = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => <section className={`card ${className}`}>{children}</section>;
export const Badge = ({
  children,
  tone = "",
}: {
  children: ReactNode;
  tone?: string;
}) => <span className={`badge ${tone}`}>{children}</span>;
export const Modal = ({
  title,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) => (
  <div
    className="overlay"
    onMouseDown={(e) => e.target === e.currentTarget && onClose()}
  >
    <div className={`modal ${wide ? "wide" : ""}`} role="dialog" aria-modal>
      <header>
        <h2>{title}</h2>
        <button className="iconbtn" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>
      </header>
      {children}
    </div>
  </div>
);
export const AIBox = ({
  title = "AI-assisted recommendation",
  children,
}: {
  title?: string;
  children: ReactNode;
}) => (
  <div className="aibox">
    <div className="aititle">
      <Sparkles size={16} />
      {title}
    </div>
    {children}
    <small>AI-generated insight · Requires human review</small>
  </div>
);
export const Empty = ({ text }: { text: string }) => (
  <div className="empty">{text}</div>
);
export const Field = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => (
  <label className="field">
    <span>{label}</span>
    {children}
  </label>
);

type SelectOption = {
  value: string;
  label: ReactNode;
  disabled: boolean;
};

type SelectProps = Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  "children" | "onChange"
> & {
  children: ReactNode;
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
};

/** Accessible custom listbox with native-form-compatible value submission. */
export const Select = ({
  children,
  value,
  defaultValue,
  onChange,
  name,
  disabled,
  required,
  className = "",
  "aria-label": ariaLabel,
}: SelectProps) => {
  const options: SelectOption[] = Children.toArray(children)
    .filter(isValidElement)
    .map((child) => {
      const option = child as ReactElement<
        React.OptionHTMLAttributes<HTMLOptionElement>
      >;
      return {
        value: String(option.props.value ?? option.props.children ?? ""),
        label: option.props.children,
        disabled: Boolean(option.props.disabled),
      };
    });
  const controlled = value !== undefined;
  const initial = String(defaultValue ?? options[0]?.value ?? "");
  const [internalValue, setInternalValue] = useState(initial);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const listId = useId();
  const currentValue = controlled ? String(value) : internalValue;
  const selected = options.find((option) => option.value === currentValue);

  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  const choose = (nextValue: string) => {
    if (!controlled) setInternalValue(nextValue);
    onChange?.({
      target: { value: nextValue },
    } as React.ChangeEvent<HTMLSelectElement>);
    setOpen(false);
  };
  const move = (direction: number) => {
    if (!options.length) return;
    let next = activeIndex;
    do next = (next + direction + options.length) % options.length;
    while (options[next].disabled && next !== activeIndex);
    setActiveIndex(next);
  };

  return (
    <div ref={root} className={`custom-select ${className}`}>
      {name && <input type="hidden" name={name} value={currentValue} />}
      <button
        type="button"
        className="custom-select-trigger"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => {
          const index = options.findIndex(
            (option) => option.value === currentValue,
          );
          setActiveIndex(Math.max(0, index));
          setOpen((shown) => !shown);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
          if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
            event.preventDefault();
            if (!open) setOpen(true);
            if (event.key === "ArrowDown") move(1);
            if (event.key === "ArrowUp") move(-1);
            if (event.key === "Home") setActiveIndex(0);
            if (event.key === "End") setActiveIndex(options.length - 1);
          }
          if ((event.key === "Enter" || event.key === " ") && open) {
            event.preventDefault();
            if (!options[activeIndex]?.disabled)
              choose(options[activeIndex].value);
          }
        }}
      >
        <span>{selected?.label ?? "Select an option"}</span>
        <ChevronDown size={16} aria-hidden />
      </button>
      {required && !currentValue && (
        <input
          className="select-required"
          required
          value=""
          onChange={() => undefined}
          tabIndex={-1}
        />
      )}
      {open && (
        <div id={listId} className="custom-select-menu" role="listbox">
          {options.map((option, index) => (
            <button
              type="button"
              role="option"
              aria-selected={option.value === currentValue}
              disabled={option.disabled}
              className={index === activeIndex ? "active" : ""}
              key={`${option.value}-${index}`}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => choose(option.value)}
            >
              <span>{option.label}</span>
              {option.value === currentValue && <Check size={16} aria-hidden />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
export const Page = ({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle: string;
  action?: ReactNode;
  children: ReactNode;
}) => (
  <>
    <div className="pagehead">
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {action}
    </div>
    {children}
  </>
);
export const initials = (a: string, b: string) => a[0] + b[0];
