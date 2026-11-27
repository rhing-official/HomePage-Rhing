import CtaCard from "@/components/ui/CtaCard";

const cardClass = "bg-surface-container-lowest/40 backdrop-blur-md border border-glass-edge/80 shadow-elevation-1 rounded-m3-xl";

export function ContractHero({ category, title, tagline, body }: { category: string; title: string; tagline: string; body: string }) {
    return (
        <div className="container mx-auto px-6 pb-20 text-center">
            <p className="text-xs font-bold tracking-widest text-on-surface-subtle mb-3">{category}</p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-widest text-on-surface mb-4">{title}</h1>
            <p className="text-xl md:text-2xl tracking-[0.2em] mb-8 text-tertiary">「{tagline}」</p>
            <p className="text-on-surface-variant leading-relaxed text-pretty max-w-xl mx-auto">{body}</p>
        </div>
    );
}

export function ContractSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section>
            <h2 className="text-2xl font-bold text-on-surface tracking-wider mb-6">{title}</h2>
            {children}
        </section>
    );
}

export function ContractFlow({ steps }: { steps: { title: string; body: string }[] }) {
    return (
        <ContractSection title="ご依頼から納品まで">
            <ol className="space-y-4">
                {steps.map((step, i) => (
                    <li key={step.title} className={`flex gap-4 ${cardClass} !rounded-m3-lg p-6`}>
                        <span className="shrink-0 w-8 h-8 rounded-full bg-primary-container text-on-primary-container font-bold flex items-center justify-center">{i + 1}</span>
                        <div>
                            <h3 className="font-bold text-on-surface">{step.title}</h3>
                            <p className="text-sm text-on-surface-variant leading-relaxed mt-1">{step.body}</p>
                        </div>
                    </li>
                ))}
            </ol>
        </ContractSection>
    );
}

export function ContractNotes({ sections }: { sections: { title: string; items: string[] }[] }) {
    return (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sections.map((section) => (
                <div key={section.title} className={`${cardClass} p-8`}>
                    <h3 className="font-bold text-on-surface tracking-wider mb-3">{section.title}</h3>
                    <ul className="text-sm text-on-surface-variant leading-relaxed space-y-1 list-disc pl-5">
                        {section.items.map((item) => (
                            <li key={item}>{item}</li>
                        ))}
                    </ul>
                </div>
            ))}
        </section>
    );
}

export function ContractFooter({ disclaimer }: { disclaimer: string }) {
    return (
        <>
            <p className="text-xs text-on-surface-subtle leading-relaxed">{disclaimer}</p>
            <div className="flex justify-center">
                <CtaCard href="/contact?type=business" label="CONTACT" title="ご相談・お見積もり" caption="ご依頼の内容を、こちらからお知らせください" />
            </div>
        </>
    );
}

export { cardClass };
