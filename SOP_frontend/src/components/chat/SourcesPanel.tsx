import { useState } from "react";
import {
  Plus,
  Search,
  FileText,
  Globe,
  Sparkles,
  ChevronDown,
  PanelRightClose,
  History,
  PanelLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Citation } from "@/store/services/chat.service";

interface Source {
  id: string;
  name: string;
  type: "pdf" | "website" | "text";
  status: "ready" | "processing";
}

interface SourcesPanelProps {
  sources: Source[];
  citations: Citation[];
  onAddSource: () => void;
  onCitationClick: (citation: Citation) => void;
  onClose?: () => void;
  className?: string;
  showHistoryPanel: boolean;
  setShowHistoryPanel: (show: boolean) => void;
  showSourcesPanel: boolean;
  setShowSourcesPanel: (show: boolean) => void;
}

const SourcesPanel = ({
  sources,
  citations,
  onAddSource,
  onCitationClick,
  onClose,
  className = "",
  showHistoryPanel,
  setShowHistoryPanel,
  showSourcesPanel,
  setShowSourcesPanel,
}: SourcesPanelProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Group citations by document
  const groupedCitations = citations.reduce(
    (acc, citation) => {
      if (!acc[citation.documentName]) {
        acc[citation.documentName] = [];
      }
      acc[citation.documentName].push(citation);
      return acc;
    },
    {} as Record<string, Citation[]>,
  );

  // if sources panel is closed
  if (!showSourcesPanel) {
    return (
      <div
        className={`hidden md:flex bg-card border-r border-border flex flex-col items-center py-4 w-14 h-full shrink-0 ${className}`}
      >
        {/* Toggle Icon */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 mb-6 text-muted-foreground hover:text-primary hover:bg-secondary transition-colors"
          onClick={() => setShowSourcesPanel(true)}
        >
          <PanelLeft className="w-5 h-5" />
        </Button>

        <div className="flex-1 flex flex-col items-center gap-4">
          {/* Add Source Icon */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-secondary transition-colors"
            onClick={onAddSource}
          >
            <Plus className="w-5 h-5" />
          </Button>

          {/* Source Type Icons */}
          <div className="flex flex-col gap-3">
            {sources.slice(0, 5).map((source) => (
              <div
                key={source.id}
                className="w-8 h-8 rounded-md bg-secondary/50 flex flex-col items-center justify-center border border-border/50 group cursor-pointer hover:bg-secondary transition-colors"
                title={source.name}
              >
                <div className="text-[8px] font-bold text-destructive leading-none mb-0.5">
                  PDF
                </div>
                <FileText className="w-3.5 h-3.5 text-destructive" />
              </div>
            ))}
            {Object.keys(groupedCitations).length > 0 && (
              <div className="w-8 h-8 rounded-md bg-secondary/50 flex flex-col items-center justify-center border border-border/50">
                <div className="text-[8px] font-bold text-primary leading-none mb-0.5">
                  CIT
                </div>
                <Sparkles className="w-3.5 h-3.5 text-primary" />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-card border-r border-border flex flex-col h-full ${className}`}
    >
      {/* Header */}
      <div className="hidden md:block  md:flex p-4 flex items-center justify-between border-b border-border">
        <h2 className="font-semibold text-foreground">Sources</h2>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onClose}
          >
            <PanelRightClose className="w-4 h-4" />
          </Button>
        )}

        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 ${showSourcesPanel ? "text-primary bg-secondary" : ""}`}
          onClick={() => setShowSourcesPanel(!showSourcesPanel)}
        >
          <PanelLeft className="w-4 h-4" />
        </Button>
      </div>

      {/* Add Sources Button */}
      <div className="p-4 pb-2">
        <Button
          onClick={onAddSource}
          className="w-full justify-center gap-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground"
          variant="secondary"
        >
          <Plus className="w-4 h-4" />
          Add sources
        </Button>
      </div>

      {/* Search */}
      <div className="px-4 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search the web for new sources"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-secondary/50 border-border"
          />
        </div>
      </div>

      {/* Sources List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {sources.length > 0 || Object.keys(groupedCitations).length > 0 ? (
          <div className="space-y-3">
            {/* Show uploaded sources */}
            {sources.map((source) => (
              <div
                key={source.id}
                className="flex items-center gap-3 p-2 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
              >
                <FileText className="w-4 h-4 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {source.name}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {source.type}
                  </p>
                </div>
              </div>
            ))}

            {/* Show citations from chat */}
            {(Object.entries(groupedCitations) as [string, Citation[]][]).map(
              ([docName, docCitations]) => (
                <div key={docName} className="space-y-1">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30">
                    <FileText className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground truncate">
                      {docName}
                    </span>
                  </div>
                  <div className="pl-6 space-y-1">
                    {docCitations.map((citation) => (
                      <button
                        key={citation.id}
                        onClick={() => onCitationClick(citation)}
                        className="w-full text-left p-2 rounded-lg hover:bg-secondary/50 transition-colors text-xs text-muted-foreground"
                      >
                        Page {citation.pageNumber}{" "}
                        {citation.sectionTitle && `• ${citation.sectionTitle}`}
                      </button>
                    ))}
                  </div>
                </div>
              ),
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileText className="w-10 h-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">
              Saved sources will appear here
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1 px-4">
              Click Add source above to add PDFs, websites, text, videos or
              audio files. Or import a file directly from Google Drive.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SourcesPanel;
