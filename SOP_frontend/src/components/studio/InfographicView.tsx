import React from 'react';
import * as Icons from 'lucide-react';

interface InfoPoint {
    label: string;
    value: string;
    icon_key: string;
    significance: string;
}

interface InfographicViewProps {
    data: {
        title: string;
        points: InfoPoint[];
    };
}

const InfographicView: React.FC<InfographicViewProps> = ({ data }) => {
    if (!data) return null;

    return (
        <div className="space-y-10">
            <div className="text-center space-y-2">
                <h3 className="text-2xl font-black text-foreground tracking-tight">{data.title}</h3>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Data Insights Grid</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {data.points.map((point, i) => {
                    // Dynamic icon resolution
                    const IconComponent = (Icons as any)[point.icon_key] || Icons.Circle;

                    return (
                        <div key={i} className="flex gap-6 items-start p-6 rounded-3xl bg-card border border-border shadow-sm group hover:border-primary/50 transition-all">
                            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:scale-110 transition-transform">
                                <IconComponent className="w-7 h-7" />
                            </div>
                            <div className="space-y-1 py-1">
                                <span className="text-sm font-bold text-primary mb-1 block uppercase tracking-wider">{point.label}</span>
                                <div className="text-3xl font-black text-foreground mb-3">{point.value}</div>
                                <p className="text-xs text-muted-foreground leading-relaxed italic">
                                    "{point.significance}"
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default InfographicView;
