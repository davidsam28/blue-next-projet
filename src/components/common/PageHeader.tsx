interface PageHeaderProps {
  title: string
  subtitle?: string
  accent?: string
}

export function PageHeader({ title, subtitle, accent }: PageHeaderProps) {
  return (
    <section className="brand-gradient py-20 md:py-28 relative overflow-hidden" aria-label="Page header">
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
        aria-hidden="true"
      />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {accent && (
          <span className="text-xs font-semibold text-blue-200 uppercase tracking-widest mb-4 block">
            {accent}
          </span>
        )}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-5">{title}</h1>
        {subtitle && (
          <p className="text-xl text-blue-100/90 max-w-2xl mx-auto leading-relaxed">{subtitle}</p>
        )}
      </div>
    </section>
  )
}
