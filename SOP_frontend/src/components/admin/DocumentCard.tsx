import { FileText, Trash2, RefreshCw, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface Document {
  id: string;
  name: string;
  status: "processing" | "ready" | "error";
  uploadedAt: Date;
  pages?: number;
  size?: string;
}

interface DocumentCardProps {
  document: Document;
  onDelete?: (id: string) => void;
  onReprocess?: (id: string) => void;
}

const DocumentCard = ({ document, onDelete, onReprocess }: DocumentCardProps) => {
  const statusConfig = {
    processing: {
      icon: Clock,
      label: "Processing",
      className: "text-amber-600 bg-amber-50",
    },
    ready: {
      icon: CheckCircle,
      label: "Ready",
      className: "text-emerald-600 bg-emerald-50",
    },
    error: {
      icon: AlertCircle,
      label: "Error",
      className: "text-destructive bg-destructive/10",
    },
  };

  const status = statusConfig[document.status];
  const StatusIcon = status.icon;

  return (
    <div className="bg-card border border-border rounded-xl p-3 sm:p-4 card-hover">
      <div className="flex items-center sm:items-start gap-3 sm:gap-4">
        {/* Icon */}
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h4
                title={document.name}
                className="
                  font-medium
                  text-sm sm:text-base
                  text-foreground
                  line-clamp-1
                  sm:line-clamp-2
                  break-words
                "
              >
                {document.name}
              </h4>


              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] sm:text-xs font-medium rounded-full ${status.className}`}>
                  <StatusIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  {status.label}
                </span>
                <div className="text-xs text-muted-foreground flex items-center gap-1.5">

                  {document.pages && (
                    <span className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">{document.pages} pages</span>
                  )}
                  <span>•</span>
                  {document.size && (
                    <span className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">{document.size}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-2 sm:mt-3">
            <span className="text-[10px] sm:text-xs text-muted-foreground">
              Uploaded {document.uploadedAt.toLocaleDateString()}
            </span>
            <div className="flex items-center gap-1">
              {document.status === "error" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onReprocess?.(document.id)}
                  className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-muted-foreground hover:text-foreground"
                >
                  <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </Button>
              )}
              {/* <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete?.(document.id)}
                className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Button> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentCard;
