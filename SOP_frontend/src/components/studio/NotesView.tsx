import React from 'react';
import { Bookmark, Type } from 'lucide-react';

interface NoteSection {
    heading: string;
    content: string;
    keywords: string[];
}

interface NotesViewProps {
    data: {
        title: string;
        sections: NoteSection[];
    };
}

const NotesView: React.FC<NotesViewProps> = ({ data }) => {
    if (!data) return null;

    return (
        <div className="space-y-10 pb-10">
            <div className="flex items-center gap-3 border-b-4 border-primary/20 pb-6">
                <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                    <Bookmark className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-foreground">{data.title}</h3>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Cornell Study Method</p>
                </div>
            </div>

            <div className="space-y-12">
                {data.sections.map((section, i) => (
                    <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {/* Left Column: Cues/Keywords */}
                        <div className="md:col-span-1 space-y-4">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-primary">
                                <Type className="w-3 h-3" /> Key Terms
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {section.keywords.map((kw, j) => (
                                    <span key={j} className="px-2 py-1 rounded bg-secondary/50 text-[10px] font-bold text-muted-foreground border border-border">
                                        {kw}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Right Column: Notes */}
                        <div className="md:col-span-3 space-y-3 pl-6 border-l-2 border-border/40">
                            <h4 className="text-lg font-bold text-foreground group">
                                {section.heading}
                            </h4>
                            <div className="text-sm text-muted-foreground leading-relaxed prose prose-sm prose-invert max-w-none">
                                <div dangerouslySetInnerHTML={{ __html: section.content.replace(/\n/g, '<br/>') }} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NotesView;
