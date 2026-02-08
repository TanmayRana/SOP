import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Upload,
  LayoutDashboard,
  FolderOpen,
  MessageSquare,
  Plus,
} from "lucide-react";
import DocumentCard, { Document } from "@/components/admin/DocumentCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
// import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchChats, fetchAllDocuments } from "@/store/slices/chat.slice";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect } from "react";
import { v4 as uuid } from "uuid";
import { useAppDispatch, useAppSelector } from "@/hooks";

// Demo documents removed to use real data from Redux


const Documents = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { chats, allDocuments } = useAppSelector((state) => state.chat);
  const [searchQuery, setSearchQuery] = useState("");
  const chatId = uuid();

  useEffect(() => {
    dispatch(fetchChats());
    dispatch(fetchAllDocuments());
  }, [dispatch]);

  // Map backend PDFs to Document interface
  const documents: Document[] = allDocuments.map(pdf => ({
    id: pdf._id,
    name: pdf.pdfName,
    status: pdf.pdfVectors?.length > 0 ? "ready" : "processing",
    uploadedAt: new Date(pdf.createdAt || Date.now()),
    pages: 0, // Not stored in DB yet
    size: "N/A", // Not stored in DB yet
  }));

  const filteredDocuments = documents.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredChats = chats.filter((chat) =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleDelete = (id: string) => {
    // Backend delete logic can be added later
    toast({
      title: "Document delete requested",
      description: "Note: Backend deletion is pending implementation.",
    });
  };

  const handleReprocess = (id: string) => {
    toast({
      title: "Reprocessing requested",
      description: "Note: Backend reprocessing is pending implementation.",
    });
  };

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Link to="/dashboard">
        <Button variant="ghost" size="sm" className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">
            Document Library
          </h1>
          <p className="text-muted-foreground">
            {documents.length} documents in the knowledge base
          </p>
        </div>
        <Link to={`/chat/${chatId}`}>
          <Button className="btn-gradient">
            <Plus className="w-4 h-4 mr-2" />
            Create SOP
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs defaultValue="documents" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="chats" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Recent Chats
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documents">
          {/* Documents Grid */}
          <div className="grid gap-4">
            {filteredDocuments.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onDelete={handleDelete}
                onReprocess={handleReprocess}
              />
            ))}

            {filteredDocuments.length === 0 && (
              <div className="text-center py-12 bg-card border border-border rounded-xl">
                <p className="text-muted-foreground">No documents found</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="chats">
          {/* Chats Grid */}
          <div className="grid gap-4">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => navigate(`/chat/${chat.id}`)}
                className="flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:bg-secondary/30 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {chat.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      ID: {chat.id.slice(0, 8)}...
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="hidden sm:flex">
                  Open Chat
                </Button>
              </div>
            ))}

            {filteredChats.length === 0 && (
              <div className="text-center py-12 bg-card border border-border rounded-xl">
                <p className="text-muted-foreground">No recent chats found</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default Documents;
