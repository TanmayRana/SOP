import { Trash2, MessageSquare, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";

interface Chat {
    id: string;
    title: string;
}

interface ChatHistoryProps {
    chats: Chat[];
    activeChatId: string | null;
    onDeleteChat: (chatId: string) => void;
    onNewChat: () => void;
    className?: string;
}

const ChatHistory = ({ chats, activeChatId, onDeleteChat, onNewChat, className = "" }: ChatHistoryProps) => {
    const navigate = useNavigate();

    return (
        <div className={`flex flex-col h-full ${className}`}>

            <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                    {chats.map((chat) => (
                        <div
                            key={chat.id}
                            className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${chat.id === activeChatId
                                ? "bg-secondary text-secondary-foreground"
                                : "hover:bg-secondary/50 text-muted-foreground hover:text-foreground"
                                }`}
                            onClick={() => navigate(`/chat/${chat.id}`)}
                        >
                            <div className="flex items-center gap-2 min-w-0">
                                <MessageSquare className="w-4 h-4 flex-shrink-0" />
                                <span className="text-sm truncate font-medium">
                                    {chat.title || "Untitled Chat"}
                                </span>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteChat(chat.id);
                                }}
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    ))}
                    {chats.length === 0 && (
                        <div className="py-8 text-center px-4">
                            <p className="text-sm text-muted-foreground">No chat history yet</p>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
};

export default ChatHistory;
