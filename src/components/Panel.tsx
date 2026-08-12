interface PanelProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  borderClassName?: string;
}

export default function Panel({ title, children, className = '', borderClassName = 'border-border' }: PanelProps) {
  return (
    <section className={`rounded-lg border ${borderClassName} bg-surface shadow-sm p-4 flex flex-col gap-4 ${className}`}>
      {title && (
        <h2 className="text-xs font-semibold uppercase tracking-wide text-wood-muted">
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}
