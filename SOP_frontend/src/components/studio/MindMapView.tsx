import React from 'react';
import { ChevronRight, Network } from 'lucide-react';

interface MindMapNode {
    title: string;
    children?: MindMapNode[];
}

interface MindMapViewProps {
    data: MindMapNode;
}

const MindMapNode: React.FC<{ node: MindMapNode; level: number }> = ({ node, level }) => {
    return (
        <div className={`ml-${level * 4} border-l border-border/50 pl-4 py-1`}>
            <div className="flex items-center gap-2 group cursor-default">
                <div className={`w-2 h-2 rounded-full ${level === 0 ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                <span className={`text-sm ${level === 0 ? 'font-bold' : 'text-muted-foreground'} group-hover:text-foreground transition-colors`}>
                    {node.title}
                </span>
            </div>
            {node.children && node.children.map((child, i) => (
                <MindMapNode key={i} node={child} level={level + 1} />
            ))}
        </div>
    );
};

const MindMapView: React.FC<MindMapViewProps> = ({ data }) => {
    if (!data) return null;

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary mb-6">
                <Network className="w-5 h-5" />
                <h3 className="font-bold text-lg">{data.title}</h3>
            </div>
            <div className="overflow-x-auto">
                <MindMapNode node={data} level={0} />
            </div>
        </div>
    );
};

export default MindMapView;
