import React from 'react';
import { Presentation, Layout } from 'lucide-react';

interface Slide {
    slide_number: number;
    slide_title: string;
    bullet_points: string[];
    visual_cue: string;
}

interface SlidesViewProps {
    data: {
        title: string;
        slides: Slide[];
    };
}

const SlidesView: React.FC<SlidesViewProps> = ({ data }) => {
    if (!data) return null;

    return (
        <div className="space-y-12">
            <div className="flex items-center gap-3 border-b border-border pb-6">
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                    <Presentation className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-xl font-black text-foreground">{data.title}</h3>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Deck Structure • {data.slides.length} Slides</p>
                </div>
            </div>

            <div className="grid gap-10">
                {data.slides.map((slide, i) => (
                    <div key={i} className="relative group">
                        <div className="absolute -left-4 top-0 bottom-0 w-1 bg-primary/20 group-hover:bg-primary transition-colors rounded-full" />
                        <div className="space-y-4">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black text-primary uppercase">Slide {slide.slide_number}</span>
                                    <h4 className="text-lg font-bold text-foreground">{slide.slide_title}</h4>
                                </div>
                            </div>

                            <ul className="grid gap-3 pl-2">
                                {slide.bullet_points.map((point, j) => (
                                    <li key={j} className="flex items-start gap-3 text-sm text-muted-foreground leading-relaxed">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                                        {point}
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-4 p-4 rounded-xl bg-secondary/30 border border-dashed border-border/60">
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground mb-2">
                                    <Layout className="w-3 h-3" /> Visual Guidance
                                </div>
                                <p className="text-[11px] italic text-muted-foreground/80 leading-relaxed">
                                    {slide.visual_cue}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SlidesView;
