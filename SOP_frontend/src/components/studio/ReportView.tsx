import React from 'react';
import { FileText, CheckCircle2 } from 'lucide-react';

interface ReportData {
    title: string;
    summary: string;
    key_findings: string[];
    action_items: string[];
    conclusion: string;
}

interface ReportViewProps {
    data: ReportData;
}

const ReportView: React.FC<ReportViewProps> = ({ data }) => {
    if (!data) return null;

    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            <div className="border-b border-border pb-6">
                <div className="flex items-center gap-2 text-primary mb-2">
                    <FileText className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Executive Report</span>
                </div>
                <h3 className="text-2xl font-bold text-foreground leading-tight">{data.title}</h3>
            </div>

            <section className="space-y-3">
                <h4 className="text-sm font-bold uppercase tracking-wider text-primary/80">Summary</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    {data.summary}
                </p>
            </section>

            <section className="space-y-3">
                <h4 className="text-sm font-bold uppercase tracking-wider text-primary/80">Key Findings</h4>
                <div className="grid gap-2">
                    {data.key_findings.map((item, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 text-xs text-foreground leading-relaxed">
                            <span className="font-bold text-primary">{i + 1}.</span>
                            {item}
                        </div>
                    ))}
                </div>
            </section>

            <section className="space-y-3">
                <h4 className="text-sm font-bold uppercase tracking-wider text-primary/80">Action Items</h4>
                <ul className="space-y-2">
                    {data.action_items.map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <CheckCircle2 className="w-3 h-3 text-primary/60" />
                            {item}
                        </li>
                    ))}
                </ul>
            </section>

            <section className="pt-6 border-t border-border">
                <p className="text-sm italic text-muted-foreground leading-relaxed">
                    <span className="font-bold not-italic text-foreground">Conclusion: </span>
                    {data.conclusion}
                </p>
            </section>
        </div>
    );
};

export default ReportView;
