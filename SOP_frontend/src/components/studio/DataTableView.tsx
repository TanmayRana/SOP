import React from 'react';
import { Table as TableIcon } from 'lucide-react';

interface DataTableProps {
    data: {
        title: string;
        headers: string[];
        rows: string[][];
    };
}

const DataTableView: React.FC<DataTableProps> = ({ data }) => {
    if (!data) return null;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
                <TableIcon className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg">{data.title}</h3>
            </div>

            <div className="rounded-xl border border-border overflow-hidden bg-background">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="bg-secondary/50 border-b border-border">
                                {data.headers.map((header, i) => (
                                    <th key={i} className="px-4 py-3 font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {data.rows.map((row, i) => (
                                <tr key={i} className="hover:bg-secondary/20 transition-colors">
                                    {row.map((cell, j) => (
                                        <td key={j} className="px-4 py-3 text-foreground whitespace-nowrap max-w-[200px] truncate" title={cell}>
                                            {cell}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DataTableView;
