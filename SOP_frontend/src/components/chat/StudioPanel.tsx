import {
  Headphones,
  Video,
  Network,
  FileBarChart,
  CreditCard,
  HelpCircle,
  BarChart3,
  Presentation,
  Table2,
  PanelLeftClose,
  StickyNote,
  Settings2,
  MoreVertical,
  PanelRight,
  PanelLeft,
  Loader2,
  Check,
  FileJson,
  ArrowLeft,
  ChevronRight,
  Maximize2,
  Pencil,
  ThumbsUp,
  ThumbsDown,
  Clock,
  LayoutGrid,
  Trash,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { fetchWithRefresh, deleteWithRefresh } from "@/utils/apiInterceptor";
import QuizView from "../studio/QuizView";
import MindMapView from "../studio/MindMapView";
import FlashcardView from "../studio/FlashcardView";
import ReportView from "../studio/ReportView";
import AudioVideoView from "../studio/AudioVideoView";
import DataTableView from "../studio/DataTableView";
import SlidesView from "../studio/SlidesView";
import InfographicView from "../studio/InfographicView";
import NotesView from "../studio/NotesView";
import { ScrollArea } from "@/components/ui/scroll-area";

interface StudioPanelProps {
  onClose?: () => void;
  className?: string;
  showStudioPanel: boolean;
  setShowStudioPanel: (show: boolean) => void;
}

const studioTools = [
  { id: "audio", icon: Headphones, label: "Audio Overview" },
  { id: "video", icon: Video, label: "Video Overview" },
  { id: "mindmap", icon: Network, label: "Mind Map" },
  { id: "reports", icon: FileBarChart, label: "Reports" },
  { id: "flashcards", icon: CreditCard, label: "Flashcards" },
  { id: "quiz", icon: HelpCircle, label: "Quiz" },
  { id: "infographic", icon: BarChart3, label: "Infographic" },
  { id: "slides", icon: Presentation, label: "Slide deck" },
  { id: "datatable", icon: Table2, label: "Data table" },
  { id: "notes", icon: StickyNote, label: "Add Note" },
];

const StudioPanel = ({
  onClose,
  className = "",
  showStudioPanel,
  setShowStudioPanel,
}: StudioPanelProps) => {
  const { chatId } = useParams();
  const { toast } = useToast();
  const [generatingToolId, setGeneratingToolId] = useState<string | null>(null);
  const [toolOutputs, setToolOutputs] = useState<Record<string, any>>({});
  const [selectedToolId, setSelectedToolId] = useState<string | null>(null);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (chatId) {
      const fetchStudioContent = async () => {
        try {
          const response = await fetchWithRefresh(
            `${import.meta.env.VITE_API_URL}/api/studio/${chatId}`,
            {
              headers: {
                "Content-Type": "application/json",
              },
            },
          );

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          const outputs: Record<string, any> = {};
          data.forEach((item: any) => {
            outputs[item.toolId] = item.content;
          });
          setToolOutputs(outputs);
        } catch (error: any) {
          console.error("Failed to fetch studio content:", error);
          if (error.message === "Session expired") {
            toast({
              title: "Session Expired",
              description: "Please login again to continue.",
              variant: "destructive",
            });
          }
        }
      };
      fetchStudioContent();
    }
  }, [chatId, toast]);

  const handleToolClick = async (toolId: string) => {
    if (!chatId) return;

    // If it's already generated, open dialog
    if (toolOutputs[toolId]) {
      setSelectedToolId(toolId);
      setIsDialogOpen(true);
      setCurrentQuizIndex(0);
      return;
    }

    setGeneratingToolId(toolId);
    try {
      const response = await fetchWithRefresh(
        `${import.meta.env.VITE_API_URL}/api/studio/generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chatId,
            toolId,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Generation started",
          description: `Wait a moment while we prepare your ${toolId}.`,
        });

        // Polling logic to wait for the background job to finish
        let attempts = 0;
        const maxAttempts = 30; // 60 seconds max
        const pollInterval = setInterval(async () => {
          attempts++;
          try {
            const checkResponse = await fetchWithRefresh(
              `${import.meta.env.VITE_API_URL}/api/studio/${chatId}`,
              {
                headers: {
                  "Content-Type": "application/json",
                },
              },
            );

            if (!checkResponse.ok) {
              throw new Error(`HTTP error! status: ${checkResponse.status}`);
            }

            const data = await checkResponse.json();
            const item = data.find((i: any) => i.toolId === toolId);
            if (item) {
              setToolOutputs((prev) => ({
                ...prev,
                [toolId]: item.content,
              }));
              setSelectedToolId(toolId);
              setIsDialogOpen(true);
              setCurrentQuizIndex(0);
              setGeneratingToolId(null);
              clearInterval(pollInterval);
              toast({
                title: "Success",
                description: `${toolId} is now ready!`,
              });
            }
          } catch (e: any) {
            console.error("Polling error:", e);
            if (e.message === "Session expired") {
              setGeneratingToolId(null);
              clearInterval(pollInterval);
              toast({
                title: "Session Expired",
                description: "Please login again to continue.",
                variant: "destructive",
              });
            }
          }

          if (attempts >= maxAttempts) {
            setGeneratingToolId(null);
            clearInterval(pollInterval);
            toast({
              title: "Timeout",
              description:
                "Generation is taking longer than expected. Please check back in a moment.",
              variant: "destructive",
            });
          }
        }, 2000);
      }
    } catch (error: any) {
      toast({
        title: "Generation failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
      setGeneratingToolId(null);
    }
  };

  const handleDeleteContent = async (toolId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!chatId) return;

    try {
      const response = await deleteWithRefresh(
        `${import.meta.env.VITE_API_URL}/api/studio/${chatId}/${toolId}`,
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Remove from local state
      setToolOutputs((prev) => {
        const newOutputs = { ...prev };
        delete newOutputs[toolId];
        return newOutputs;
      });

      // Close dialog if this content is currently selected
      if (selectedToolId === toolId) {
        setIsDialogOpen(false);
        setSelectedToolId(null);
      }

      toast({
        title: "Content Deleted",
        description: "Studio content has been deleted successfully.",
      });
    } catch (error: any) {
      console.error("Failed to delete studio content:", error);
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete content",
        variant: "destructive",
      });
    }
  };

  const renderDetailContent = () => {
    if (!selectedToolId || !toolOutputs[selectedToolId]) return null;
    const content = toolOutputs[selectedToolId];

    switch (selectedToolId) {
      case "quiz":
        return (
          <QuizView
            questions={content.questions || []}
            currentIndex={currentQuizIndex}
            onNext={() => setCurrentQuizIndex((prev) => prev + 1)}
            onPrev={() => setCurrentQuizIndex((prev) => prev - 1)}
          />
        );
      case "mindmap":
        return <MindMapView data={content} />;
      case "flashcards":
        return <FlashcardView flashcards={content.flashcards || []} />;
      case "reports":
        return <ReportView data={content} />;
      case "audio":
      case "video":
        return <AudioVideoView data={content} type={selectedToolId} />;
      case "datatable":
        return <DataTableView data={content} />;
      case "slides":
        return <SlidesView data={content} />;
      case "infographic":
        return <InfographicView data={content} />;
      case "notes":
        return <NotesView data={content} />;
      default:
        return (
          <div className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {typeof content === "string"
              ? content
              : JSON.stringify(content, null, 2)}
          </div>
        );
    }
  };

  if (!showStudioPanel) {
    return (
      <div
        className={`hidden md:flex bg-card border-l border-border flex-col items-center py-4 w-14 h-full shrink-0 ${className}`}
      >
        {/* Toggle Icon */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 mb-6 text-muted-foreground hover:text-primary hover:bg-secondary transition-colors"
          onClick={() => setShowStudioPanel(true)}
        >
          <PanelLeft className="w-5 h-5 rotate-180" />
        </Button>

        <div className="flex-1 flex flex-col items-center gap-4">
          {studioTools.map((tool) => (
            <Button
              key={tool.id}
              variant="ghost"
              size="icon"
              className={`h-9 w-9 text-muted-foreground hover:text-primary hover:bg-secondary transition-colors ${selectedToolId === tool.id ? "text-primary bg-secondary" : ""}`}
              title={tool.label}
              onClick={() => handleToolClick(tool.id)}
            >
              <tool.icon className="w-5 h-5" />
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-card border-l border-border flex flex-col h-full ${className}`}
    >
      {/* Header */}
      <div className="hidden md:flex p-4 items-center justify-between border-b border-border">
        <h2 className="font-semibold text-foreground">Studio</h2>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onClose}
          >
            <PanelLeftClose className="w-4 h-4" />
          </Button>
        )}

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Settings2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 ${showStudioPanel ? "text-primary bg-secondary" : ""}`}
            onClick={() => setShowStudioPanel(!showStudioPanel)}
          >
            <PanelRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="flex-1 flex flex-col min-h-0">
        <div className="p-4 overflow-y-auto flex-1 scrollbar-thin">
          {/* Grid of tools (NotebookLM Style Gadgets) */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            {studioTools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => handleToolClick(tool.id)}
                disabled={generatingToolId === tool.id}
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-secondary/30 hover:bg-secondary/60 transition-all border border-transparent hover:border-border group"
              >
                <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  {generatingToolId === tool.id ? (
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  ) : (
                    <tool.icon className="w-5 h-5 text-primary" />
                  )}
                </div>
                <span className="text-[10px] text-foreground font-bold uppercase tracking-wider">
                  {tool.label}
                </span>
              </button>
            ))}
          </div>

          {/* Saved Content List (1st Image Style) */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">
              Saved Content
            </h3>
            <div className="space-y-2">
              {Object.keys(toolOutputs).length === 0 ? (
                <div className="text-center py-8">
                  <Presentation className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">
                    No content generated yet.
                  </p>
                </div>
              ) : (
                Object.entries(toolOutputs).map(
                  ([id, content]: [string, any]) => {
                    const tool = studioTools.find((t) => t.id === id);
                    if (!tool) return null;
                    return (
                      <div
                        key={id}
                        className="flex items-start gap-3 p-3 rounded-xl hover:bg-secondary/40 cursor-pointer transition-colors group"
                        onClick={() => {
                          setSelectedToolId(id);
                          setIsDialogOpen(true);
                        }}
                      >
                        <div className="w-10 h-10 rounded-lg bg-secondary/80 flex items-center justify-center shrink-0">
                          <tool.icon className="w-5 h-5 text-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <h4 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                              {content.title || tool.label}
                            </h4>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 hover:text-destructive"
                                onClick={(e) => handleDeleteContent(id, e)}
                                title="Delete content"
                              >
                                <Trash className="w-4 h-4" />
                              </Button>
                              {/* <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                              >
                                <MoreVertical className="w-4 h-4 text-muted-foreground" />
                              </Button> */}
                            </div>
                          </div>
                          <p className="text-[10px] text-muted-foreground flex items-center gap-2">
                            <span>3 sources</span>
                            <span className="w-1 h-1 rounded-full bg-muted-foreground/30"></span>
                            <span>1m ago</span>
                          </p>
                        </div>
                      </div>
                    );
                  },
                )
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedToolId &&
                (toolOutputs[selectedToolId]?.title ||
                  studioTools.find((t) => t.id === selectedToolId)?.label)}
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4">{renderDetailContent()}</div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudioPanel;
