import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Upload,
  Settings2,
  MoreVertical,
  ArrowRight,
  Menu,
  PanelLeft,
  PanelRight,
  LayoutDashboard,
  FolderOpen,
  MessageSquare,
  History,
  X,
  Plus,
} from "lucide-react";
import ChatMessage from "@/components/chat/ChatMessage";
import {
  type ChatMessage as Message,
  type Citation,
} from "@/store/services/chat.service";
import SourcesPanel from "@/components/chat/SourcesPanel";
import StudioPanel from "@/components/chat/StudioPanel";
import ChatHistory from "@/components/chat/ChatHistory";
import PDFPreviewModal from "@/components/chat/PDFPreviewModal";
import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import UploadZone from "@/components/admin/UploadZone";
import { useToast } from "@/hooks/use-toast";
import { useAppDispatch, useAppSelector } from "@/hooks";
import {
  sendMessage,
  uploadPdfs,
  setChatId,
  addMessage,
  fetchChatPdfs,
  fetchChats,
  createNewChat,
  deleteChatThunk,
} from "@/store/slices/chat.slice";
import axios from "axios";

// Demo data - Removed unused demo data

const Chat = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const { chatId } = useParams();
  const { messages, sources, chats, isLoading, isUploading, activeChatId } =
    useAppSelector((state) => state.chat);

  const [input, setInput] = useState("");
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(
    null,
  );
  const [showSourcesPanel, setShowSourcesPanel] = useState(true);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [showStudioPanel, setShowStudioPanel] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState<
    "sources" | "studio" | "history" | null
  >(null);

  // console.log("showhistory", showHistoryPanel);
  // console.log("showstudio", showStudioPanel);
  // console.log("showsources", showSourcesPanel);

  console.log("showmobilemenu=", showMobileMenu);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Initial load
  useEffect(() => {
    dispatch(fetchChats());
  }, [dispatch]);

  // Handle chatId from URL or generate new one
  useEffect(() => {
    const initializeChat = async () => {
      if (chatId) {
        if (chatId !== activeChatId) {
          dispatch(setChatId(chatId));
          dispatch(fetchChatPdfs(chatId));

          // Wait for chats to load before checking existence to reduce race conditions
          // but we still try to create if it's not found, as the backend is now idempotent
          const chatExists = chats.some((c) => c.id === chatId);
          if (!chatExists) {
            try {
              await dispatch(
                createNewChat({ chatId, title: "New Chat" }),
              ).unwrap();
            } catch (e) {
              // Duplicate key errors are now handled by backend (returns 200 with existing chat)
              // Only log real failures
              if (axios.isAxiosError(e) && e.response?.status !== 409) {
                console.error("Failed to ensure chat existence:", e);
              }
            }
          }
        }
      } else {
        const newId = crypto.randomUUID();
        navigate(`/chat/${newId}`, { replace: true });
      }
    };

    initializeChat();
  }, [chatId, activeChatId, dispatch, navigate, chats.length]); // Depend on chats.length to trigger when list updates

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  // Get all citations from messages
  const allCitations = messages
    .filter((m) => m.role === "assistant" && m.citations)
    .flatMap((m) => m.citations || []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading || !activeChatId) return;

    const content = input.trim();
    setInput("");

    // Add user message to state
    dispatch(
      addMessage({
        id: Date.now().toString(),
        role: "user",
        content,
        timestamp: new Date().toISOString(),
      }),
    );

    try {
      await dispatch(
        sendMessage({ chatId: activeChatId, question: content }),
      ).unwrap();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error || "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCitationClick = (citation: Citation) => {
    setSelectedCitation(citation);
    setShowMobileMenu(null);
  };

  const handleNewChat = () => {
    const newId = crypto.randomUUID();
    navigate(`/chat/${newId}`);
    setShowHistoryPanel(false);
    setShowMobileMenu(null);
  };

  const handleDeleteChat = async (id: string) => {
    try {
      await dispatch(deleteChatThunk(id)).unwrap();
      toast({
        title: "Chat deleted",
        description: "The conversation was removed successfully.",
      });
      if (id === activeChatId) {
        navigate("/chat"); // This will trigger the "new chat" effect
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error || "Failed to delete chat",
        variant: "destructive",
      });
    }
  };

  const handleAddSource = () => {
    // Navigate to upload or open upload modal
    // navigate("/admin/upload");
    setIsDialogOpen(true);
  };

  const handleUpload = async (files: File[]) => {
    if (!activeChatId) return;

    try {
      await dispatch(uploadPdfs({ files, chatId: activeChatId })).unwrap();

      toast({
        title: "Upload successful!",
        description: `${files.length} file(s) are being processed and will be available shortly.`,
      });

      // Optionally refresh after a delay to show 'ready' status
      setTimeout(() => {
        dispatch(fetchChatPdfs(activeChatId));
      }, 5000);
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error || "Failed to upload PDFs",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-card/95 backdrop-blur-md sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className={`h-10 w-10 rounded-full transition-colors ${showHistoryPanel ? "bg-primary/10 text-primary" : ""}`}
            onClick={() => {
              setShowHistoryPanel(true);
              setShowMobileMenu(null);
            }}
          >
            <History className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`h-10 w-10 rounded-full transition-colors ${showMobileMenu === "sources" ? "bg-primary/10 text-primary" : ""}`}
            onClick={() =>
              setShowMobileMenu(showMobileMenu === "sources" ? null : "sources")
            }
          >
            <PanelLeft className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/60 leading-none mb-0.5">
            SOP Genius
          </span>
          <h1 className="font-bold text-foreground text-sm tracking-tight">
            Chat Assistant
          </h1>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className={`h-10 w-10 rounded-full transition-colors ${showMobileMenu === "studio" ? "bg-primary/10 text-primary" : ""}`}
          onClick={() =>
            setShowMobileMenu(showMobileMenu === "studio" ? null : "studio")
          }
        >
          <PanelRight className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Sources Panel - Desktop */}
        <div
          className={`hidden md:flex flex-shrink-0 transition-all duration-300 ${showSourcesPanel ? "w-72 lg:w-80" : "w-14"}`}
        >
          <SourcesPanel
            sources={sources}
            citations={allCitations}
            onAddSource={handleAddSource}
            onCitationClick={handleCitationClick}
            className="w-full"
            showHistoryPanel={showHistoryPanel}
            setShowHistoryPanel={setShowHistoryPanel}
            showSourcesPanel={showSourcesPanel}
            setShowSourcesPanel={setShowSourcesPanel}
          />
        </div>

        {/* Sources Panel - Mobile Overlay */}
        {showMobileMenu === "sources" && (
          <div className="md:hidden fixed inset-0 z-[100] flex animate-in fade-in duration-200">
            <div className="w-[85%] max-w-[320px] bg-card h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
              <div className="flex items-center justify-between p-4 border-b border-border bg-card/50 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <PanelLeft className="w-4 h-4 text-primary" />
                  </div>
                  <h2 className="font-bold text-foreground">Sources</h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
                  onClick={() => setShowMobileMenu(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <SourcesPanel
                sources={sources}
                citations={allCitations}
                onAddSource={handleAddSource}
                onCitationClick={handleCitationClick}
                onClose={() => setShowMobileMenu(null)}
                className="flex-1 overflow-hidden"
                showHistoryPanel={showHistoryPanel}
                setShowHistoryPanel={setShowHistoryPanel}
                showSourcesPanel={true}
                setShowSourcesPanel={setShowSourcesPanel}
              />
            </div>
            <div
              className="flex-1 bg-black/40 backdrop-blur-[2px]"
              onClick={() => setShowMobileMenu(null)}
            />
          </div>
        )}

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 border-x border-border bg-background">
          {/* Chat Header - Desktop Only */}
          <div className="hidden md:flex items-center justify-between p-3 lg:p-4 border-b border-border bg-card/50">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 ${showHistoryPanel ? "text-primary bg-secondary" : ""}`}
                onClick={() => setShowHistoryPanel(!showHistoryPanel)}
              >
                <History className="w-4 h-4" />
              </Button>
              {/* <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 ${showSourcesPanel ? "text-primary bg-secondary" : ""}`}
                onClick={() => setShowSourcesPanel(!showSourcesPanel)}
              >
                <PanelLeft className="w-4 h-4" />
              </Button> */}
              <h1 className="font-semibold text-foreground">Chat</h1>
            </div>
            {/* <div className="flex items-center gap-1">
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
            </div> */}
          </div>

          {/* Messages Area - Responsive Padding */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 bg-gradient-to-b from-background to-muted/20">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-4 animate-fade-in">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center mb-4 sm:mb-6 shadow-lg border border-primary/10">
                  <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                </div>
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-3">
                  Start a conversation
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-md leading-relaxed">
                  Upload documents or ask questions about your SOPs and policies
                  to get started.
                </p>
                <Button
                  onClick={handleAddSource}
                  variant="outline"
                  className="mt-2 sm:mt-4 hover:bg-primary/5 hover:border-primary/30 transition-all duration-200 shadow-sm"
                  size="sm"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload a source
                </Button>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
                {messages.map((message, index) => (
                  <div
                    key={message.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <ChatMessage
                      message={message}
                      onCitationClick={handleCitationClick}
                    />
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start animate-fade-in">
                    <div className="chat-bubble-assistant px-4 py-3 shadow-sm border border-border/50">
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                          <span
                            className="w-2 h-2 bg-primary rounded-full animate-bounce"
                            style={{ animationDelay: "150ms" }}
                          ></span>
                          <span
                            className="w-2 h-2 bg-primary rounded-full animate-bounce"
                            style={{ animationDelay: "150ms" }}
                          ></span>

                          <span
                            className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                            style={{ animationDelay: "300ms" }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground ml-2">
                          Thinking...
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Chat Input - Enhanced Mobile */}
          <div className="p-3 sm:p-4 border-t border-border bg-card/50 backdrop-blur-sm">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-end gap-2 sm:gap-3 bg-secondary/50 rounded-xl sm:rounded-2xl border border-border p-2 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  rows={1}
                  className="flex-1 resize-none bg-transparent border-0 outline-none text-sm sm:text-base px-2 py-2 placeholder:text-muted-foreground min-h-[40px] max-h-[120px]"
                  style={{ height: "auto" }}
                />
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 pr-1 pb-1">
                  <span className="text-xs text-muted-foreground whitespace-nowrap hidden sm:block">
                    {sources.length} sources
                  </span>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isLoading}
                    size="icon"
                    className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-primary hover:bg-primary/90 disabled:opacity-50 transition-all hover:scale-105 flex-shrink-0"
                  >
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </div>
              </div>
              {/* Mobile source count */}
              <div className="flex justify-center mt-2 sm:hidden">
                <span className="text-xs text-muted-foreground">
                  {sources.length} sources available
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Studio Panel - Desktop */}
        <div
          className={`hidden md:flex flex-shrink-0 transition-all duration-300 ${showStudioPanel ? "w-72 lg:w-80" : "w-14"}`}
        >
          <StudioPanel
            className="w-full"
            showStudioPanel={showStudioPanel}
            setShowStudioPanel={setShowStudioPanel}
          />
        </div>

        {/* Studio Panel - Mobile Overlay */}
        {showMobileMenu === "studio" && (
          <div className="md:hidden fixed inset-0 z-[100] flex justify-end animate-in fade-in duration-200">
            <div
              className="flex-1 bg-black/40 backdrop-blur-[2px]"
              onClick={() => setShowMobileMenu(null)}
            />
            <div className="w-[85%] max-w-[320px] bg-card h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
              <div className="flex items-center justify-between p-4 border-b border-border bg-card/50 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <PanelRight className="w-4 h-4 text-primary" />
                  </div>
                  <h2 className="font-bold text-foreground">Studio</h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
                  onClick={() => setShowMobileMenu(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <StudioPanel
                onClose={() => setShowMobileMenu(null)}
                className="flex-1 overflow-hidden"
                showStudioPanel={true}
                setShowStudioPanel={setShowStudioPanel}
              />
            </div>
          </div>
        )}
      </div>

      {/* PDF Preview Modal */}
      <PDFPreviewModal
        citation={selectedCitation}
        isOpen={!!selectedCitation}
        onClose={() => setSelectedCitation(null)}
      />

      {/* History Dialog */}
      <Dialog open={showHistoryPanel} onOpenChange={setShowHistoryPanel}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-card flex flex-col h-[70vh]">
            {/* Premium Header - "Butter" Layout */}
            {/* p-5 border-b border-border/50 flex items-center justify-center gap-8 bg-gradient-to-b from-secondary/30 to-background/50 backdrop-blur-md */}
            <div className="p-4 border-b border-border flex items-center gap-4 bg-card/50 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <History className="w-4 h-4 text-primary" />
                </div>
                <DialogTitle className="font-semibold">
                  Chat History
                </DialogTitle>
              </div>

              <div className="h-8 w-[1px] bg-border/60 mx-1" />

              <Button
                variant="outline"
                onClick={handleNewChat}
                className="h-8 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-all shadow-md gap-2 border-none px-5 group"
              >
                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                <span className="text-sm font-semibold">New Chat</span>
              </Button>
            </div>
            <DialogDescription className="sr-only">
              Browse and manage your past chat sessions.
            </DialogDescription>
            <ChatHistory
              chats={chats}
              activeChatId={activeChatId}
              onDeleteChat={handleDeleteChat}
              onNewChat={() => {
                handleNewChat();
                setShowHistoryPanel(false);
              }}
              className="flex-1 overflow-hidden"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload Dialog - Responsive & Premium */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] gap-0 p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-gradient-to-br from-primary/5 via-background to-secondary/30">
            <DialogHeader className="p-6 pb-0">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <DialogTitle className="text-2xl font-bold tracking-tight">
                Upload Knowledge Base
              </DialogTitle>
              <DialogDescription className="text-base text-muted-foreground mt-2">
                Add PDF documents to train your AI assistant. Files are
                encrypted and processed securely.
              </DialogDescription>
            </DialogHeader>

            <div className="p-6 space-y-6">
              {/* Upload Zone */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-card/50 backdrop-blur-sm border-2 border-dashed border-border group-hover:border-primary/50 rounded-xl transition-all duration-300">
                  <UploadZone onUpload={handleUpload} />
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <Button
                  variant="outline"
                  className="h-11 sm:h-12 flex items-center justify-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors text-sm sm:text-base"
                  onClick={() => {
                    toast({
                      title: "Coming soon!",
                      description:
                        "Bulk upload feature will be available in the next update.",
                    });
                  }}
                >
                  <FolderOpen className="w-4 h-4" />
                  Browse Files
                </Button>
                <Button
                  variant="outline"
                  className="h-11 sm:h-12 flex items-center justify-center gap-2 hover:bg-purple-50 dark:hover:bg-purple-950 transition-colors text-sm sm:text-base"
                  onClick={() => {
                    toast({
                      title: "Coming soon!",
                      description:
                        "URL upload feature will be available in the next update.",
                    });
                  }}
                >
                  <MessageSquare className="w-4 h-4" />
                  Add from URL
                </Button>
              </div>

              {/* Enhanced Tips - Compact & Responsive */}
              <div className="bg-muted/50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-border">
                <h3 className="font-semibold text-sm sm:text-base text-foreground mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Quick Tips
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-green-600 dark:text-green-400 text-xs font-bold">
                        ✓
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm">
                      <p className="font-medium text-foreground">
                        PDF files only
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Max 50MB each
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 dark:text-blue-400 text-xs font-bold">
                        📝
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm">
                      <p className="font-medium text-foreground">
                        Clear headings
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Better AI responses
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900 rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-purple-600 dark:text-purple-400 text-xs font-bold">
                        ⚡
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm">
                      <p className="font-medium text-foreground">
                        Fast processing
                      </p>
                      <p className="text-xs text-muted-foreground">
                        1-5 minutes
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-orange-100 dark:bg-orange-900 rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-orange-600 dark:text-orange-400 text-xs font-bold">
                        🔒
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm">
                      <p className="font-medium text-foreground">
                        Secure & private
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Encrypted storage
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Chat;
