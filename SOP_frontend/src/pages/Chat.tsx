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
} from "lucide-react";
import ChatMessage, { Message, Citation } from "@/components/chat/ChatMessage";
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
  deleteChatThunk
} from "@/store/slices/chat.slice";
import axios from "axios";

// Demo data
const demoResponses: Record<
  string,
  { content: string; citations: Citation[] }
> = {
  refund: {
    content:
      "To process a customer refund, follow these steps:\n\n1. Verify the original purchase in the Order Management System\n2. Confirm the return is within the 30-day policy window\n3. Open the Returns Portal and select 'Process Refund'\n4. Enter the order number and reason code\n5. Approve the refund - it will process within 3-5 business days",
    citations: [
      {
        id: "1",
        documentName: "Returns Policy.pdf",
        pageNumber: 12,
        sectionTitle: "Refund Processing Steps",
      },
      {
        id: "2",
        documentName: "Customer Service Manual.pdf",
        pageNumber: 45,
        sectionTitle: "Order System Access",
      },
    ],
  },
  password: {
    content:
      "To reset your corporate password:\n\n1. Go to the IT Self-Service Portal at help.company.com\n2. Click 'Forgot Password'\n3. Enter your employee ID\n4. Complete the verification via your registered mobile\n5. Create a new password (minimum 12 characters, 1 uppercase, 1 number, 1 symbol)\n\nNote: You must change your password every 90 days.",
    citations: [
      {
        id: "3",
        documentName: "IT Security Policy.pdf",
        pageNumber: 8,
        sectionTitle: "Password Requirements",
      },
    ],
  },
  default: {
    content:
      "I don't know. This information does not exist in the uploaded SOPs. Please contact your manager or the relevant department for assistance with this question.",
    citations: [],
  },
};

const Chat = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const { chatId } = useParams();
  const { messages, sources, chats, isLoading, isUploading, activeChatId } = useAppSelector((state) => state.chat);

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
          // If chat doesn't exist in our list, try to create/fetch it
          if (!chats.find(c => c.id === chatId)) {
            try {
              await dispatch(createNewChat({ chatId, title: "New Chat" })).unwrap();
            } catch (e) {
              // Chat might already exist but not in current fetch list, or it's just being created
              console.log("Chat existence handled by backend or failed creation", e);
            }
          }
        }
      } else {
        const newId = crypto.randomUUID();
        navigate(`/chat/${newId}`, { replace: true });
      }
    };

    initializeChat();
  }, [chatId, activeChatId, dispatch, navigate, chats]);

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
    dispatch(addMessage({
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    }));

    try {
      await dispatch(sendMessage({ chatId: activeChatId, question: content })).unwrap();
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
        variant: "destructive"
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



  // Render logic continues below...


  return (
    // <DashboardProvider links={chatLinks}>
    <div className="h-screen flex flex-col bg-background">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-3 border-b border-border bg-card">
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              setShowMobileMenu(showMobileMenu === "history" ? null : "history")
            }
          >
            <History className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              setShowMobileMenu(showMobileMenu === "sources" ? null : "sources")
            }
          >
            <PanelLeft className="w-5 h-5" />
          </Button>
        </div>
        <h1 className="font-semibold text-foreground">Chat</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            setShowMobileMenu(showMobileMenu === "studio" ? null : "studio")
          }
        >
          <PanelRight className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* History Panel - Desktop */}
        <div
          className={`hidden md:flex w-64 flex-shrink-0 transition-all duration-300 ${showHistoryPanel ? "" : "-ml-64"}`}
        >
          <ChatHistory
            chats={chats}
            activeChatId={activeChatId}
            onDeleteChat={handleDeleteChat}
            onNewChat={handleNewChat}
            className="w-full"
          />
        </div>

        {/* History Panel - Mobile Overlay */}
        {showMobileMenu === "history" && (
          <div className="md:hidden absolute inset-0 z-40 flex">
            <div className="w-64 max-w-[85vw]">
              <ChatHistory
                chats={chats}
                activeChatId={activeChatId}
                onDeleteChat={handleDeleteChat}
                onNewChat={handleNewChat}
                className="w-full h-full"
              />
            </div>
            <div
              className="flex-1 bg-foreground/20 backdrop-blur-sm"
              onClick={() => setShowMobileMenu(null)}
            />
          </div>
        )}

        {/* Sources Panel - Desktop */}
        <div
          className={`hidden md:flex w-80 flex-shrink-0 transition-all duration-300 ${showSourcesPanel ? "" : "-ml-80"}`}
        >
          <SourcesPanel
            sources={sources}
            citations={allCitations}
            onAddSource={handleAddSource}
            onCitationClick={handleCitationClick}
            className="w-full"
          />
        </div>

        {/* Sources Panel - Mobile Overlay */}
        {showMobileMenu === "sources" && (
          <div className="md:hidden absolute inset-0 z-40 flex">
            <div className="w-80 max-w-[85vw]">
              <SourcesPanel
                sources={sources}
                citations={allCitations}
                onAddSource={handleAddSource}
                onCitationClick={handleCitationClick}
                onClose={() => setShowMobileMenu(null)}
                className="w-full h-full"
              />
            </div>
            <div
              className="flex-1 bg-foreground/20 backdrop-blur-sm"
              onClick={() => setShowMobileMenu(null)}
            />
          </div>
        )}

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 border-x border-border bg-background">
          {/* Chat Header - Desktop */}
          <div className="hidden md:flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 ${showHistoryPanel ? "text-primary bg-secondary" : ""}`}
                onClick={() => setShowHistoryPanel(!showHistoryPanel)}
              >
                <History className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 ${showSourcesPanel ? "text-primary bg-secondary" : ""}`}
                onClick={() => setShowSourcesPanel(!showSourcesPanel)}
              >
                <PanelLeft className="w-4 h-4" />
              </Button>
              <h1 className="font-semibold text-foreground">Chat</h1>
            </div>
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
                className="h-8 w-8"
                onClick={() => setShowStudioPanel(!showStudioPanel)}
              >
                <PanelRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-4">
                <div className="w-14 h-14 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Start a conversation
                </h2>
                <p className="text-muted-foreground mb-4 max-w-md">
                  Upload documents or ask questions about your SOPs and
                  policies.
                </p>
                <Button
                  onClick={handleAddSource}
                  variant="outline"
                  className="mt-4"
                >
                  Upload a source
                </Button>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto space-y-4">
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    onCitationClick={handleCitationClick}
                  />
                ))}
                {isLoading && (
                  <div className="flex justify-start animate-fade-in">
                    <div className="chat-bubble-assistant px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <span
                            className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                            style={{ animationDelay: "0ms" }}
                          />
                          <span
                            className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                            style={{ animationDelay: "150ms" }}
                          />
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

          {/* Chat Input */}
          <div className="p-4 border-t border-border bg-card/50">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center gap-3 bg-secondary/50 rounded-xl border border-border p-2 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message here..."
                  rows={1}
                  className="flex-1 resize-none bg-transparent border-0 outline-none text-sm px-2 py-2 placeholder:text-muted-foreground min-h-[40px] max-h-[120px]"
                  style={{ height: "auto" }}
                />
                <div className="flex items-center gap-2 pr-2">
                  <span className="text-xs text-muted-foreground">
                    {sources.length} sources
                  </span>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isLoading}
                    size="icon"
                    className="h-8 w-8 rounded-full bg-primary hover:bg-primary/90 disabled:opacity-50 transition-all hover:scale-105"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Studio Panel - Desktop */}
        <div
          className={`hidden md:flex w-80 flex-shrink-0 transition-all duration-300 ${showStudioPanel ? "" : "-mr-80"}`}
        >
          <StudioPanel className="w-full" />
        </div>

        {/* Studio Panel - Mobile Overlay */}
        {showMobileMenu === "studio" && (
          <div className="md:hidden absolute inset-0 z-40 flex justify-end">
            <div
              className="flex-1 bg-foreground/20 backdrop-blur-sm"
              onClick={() => setShowMobileMenu(null)}
            />
            <div className="w-80 max-w-[85vw]">
              <StudioPanel
                onClose={() => setShowMobileMenu(null)}
                className="w-full h-full"
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="text-center pb-4 sticky top-0 bg-background z-10">
            <DialogTitle className="text-2xl font-bold text-foreground">
              Upload SOP Documents
            </DialogTitle>
            <DialogDescription className="text-muted-foreground mt-2 max-w-md">
              Upload PDF documents to add them to the knowledge base. Documents
              will be processed and indexed automatically.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 pb-6">
            {/* Upload Zone */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-2 border-dashed border-blue-200 dark:border-blue-800 rounded-xl p-8 transition-all hover:border-blue-400 dark:hover:border-blue-600">
              <UploadZone onUpload={handleUpload} />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-12 flex items-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
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
                className="h-12 flex items-center gap-2 hover:bg-purple-50 dark:hover:bg-purple-950 transition-colors"
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

            {/* Enhanced Tips - Compact Version */}
            <div className="bg-muted/50 rounded-xl p-4 border border-border">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Quick Tips
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 dark:text-green-400 text-xs font-bold">
                      ✓
                    </span>
                  </div>
                  <div className="text-sm">
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
                  <div className="text-sm">
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
                  <div className="text-sm">
                    <p className="font-medium text-foreground">
                      Fast processing
                    </p>
                    <p className="text-xs text-muted-foreground">1-5 minutes</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-orange-100 dark:bg-orange-900 rounded flex items-center justify-center flex-shrink-0">
                    <span className="text-orange-600 dark:text-orange-400 text-xs font-bold">
                      🔒
                    </span>
                  </div>
                  <div className="text-sm">
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
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Chat;
