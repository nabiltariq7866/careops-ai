import type { ReactNode } from "react";
import { X, Sparkles } from "lucide-react";
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
