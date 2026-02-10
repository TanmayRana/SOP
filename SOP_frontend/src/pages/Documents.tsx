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
  EllipsisVertical,
  Pencil,
  Trash,
} from "lucide-react";
import DocumentCard, { Document } from "@/components/admin/DocumentCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
// import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchChats, fetchAllDocuments, deleteChatThunk, renameChatThunk } from "@/store/slices/chat.slice";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect } from "react";
import { v4 as uuid } from "uuid";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { format } from "date-fns";


import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


const Documents = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { chats, allDocuments } = useAppSelector((state) => state.chat);
  const [searchQuery, setSearchQuery] = useState("");
  const [chatId] = useState(() => uuid());

  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [chatToRename, setChatToRename] = useState<{ id: string, title: string } | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [chatToDeleteId, setChatToDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);



  console.log("allDocuments", allDocuments);
  console.log("chats", chats);


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
    pages: parseInt(pdf.pdfPages) || 0,
    size: pdf.pdfSize || "N/A",
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

  const handleRenameClick = (chat: any) => {
    setChatToRename({ id: chat.id, title: chat.title });
    setNewTitle(chat.title);
    setRenameDialogOpen(true);
  };

  const handleRenameSave = async () => {
    if (!chatToRename || !newTitle.trim()) return;

    setIsRenaming(true);
    try {
      await dispatch(renameChatThunk({ chatId: chatToRename.id, title: newTitle.trim() })).unwrap();
      toast({ title: "Success", description: "Chat renamed successfully" });
      setRenameDialogOpen(false);
    } catch (error: any) {
      toast({ title: "Error", description: error || "Failed to rename chat", variant: "destructive" });
    } finally {
      setIsRenaming(false);
    }
  };

  const confirmDeleteChat = async () => {
    if (!chatToDeleteId) return;

    setIsDeleting(true);
    try {
      await dispatch(deleteChatThunk(chatToDeleteId)).unwrap();
      toast({ title: "Success", description: "Chat and associated documents deleted" });
      setDeleteDialogOpen(false);
    } catch (error: any) {
      toast({ title: "Error", description: error || "Failed to delete chat", variant: "destructive" });
    } finally {
      setIsDeleting(false);
      setChatToDeleteId(null);
    }
  };

  const handleDeleteChatClick = (id: string) => {
    setChatToDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <main className="px-2 sm:px-4 lg:px-6 py-2">
      {/* Back Button */}
      {/* <Link to="/dashboard">
        <Button variant="ghost" size="sm" className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </Link> */}

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
                className="flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:bg-secondary/30 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3"
                  onClick={() => navigate(`/chat/${chat.id}`)}
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {chat.title}
                    </h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      {chat.updatedAt && (
                        <>
                          <span>{format(new Date(chat.updatedAt), "d MMM yyyy")}</span>
                          <span>•</span>
                        </>
                      )}
                      {chat.pdfIds.length === 0
                        ? "No sources"
                        : `${chat.pdfIds.length} ${chat.pdfIds.length > 1 ? "sources" : "source"}`
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <EllipsisVertical className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleRenameClick(chat)}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteChatClick(chat.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
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


      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Chat</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="title" className="mb-2 block">New Title</Label>
            <Input
              id="title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Enter new title..."
              onKeyDown={(e) => e.key === 'Enter' && handleRenameSave()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleRenameSave}
              disabled={isRenaming || !newTitle.trim()}
              className="btn-gradient"
            >
              {isRenaming ? "Renaming..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the chat
              and all its associated PDF documents and vector data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDeleteChat();
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete Chat"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
};

export default Documents;
