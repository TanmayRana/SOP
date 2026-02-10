import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
    chatService,
    type ChatMessage,
    type ChatResponse,
    type UploadPdfResponse,
} from "@/store/services/chat.service";

interface ChatSource {
    id: string;
    name: string;
    type: "pdf" | "website" | "text";
    status: "ready" | "processing";
}

interface Chat {
    id: string;
    title: string;
    pdfIds: string[];
    messages: ChatMessage[];
    createdAt: string;
    updatedAt: string;

}

interface ChatState {
    messages: ChatMessage[];
    sources: ChatSource[];
    chats: Chat[];
    allDocuments: any[];
    isLoading: boolean;
    isUploading: boolean;
    error: string | null;
    activeChatId: string | null;

}

const initialState: ChatState = {
    messages: [],
    sources: [],
    chats: [],
    allDocuments: [],
    isLoading: false,
    isUploading: false,
    error: null,
    activeChatId: null,

};

// Async thunks
export const uploadPdfs = createAsyncThunk<
    UploadPdfResponse,
    { files: File[]; chatId: string },
    { rejectValue: string }
>("chat/uploadPdfs", async ({ files, chatId }, { rejectWithValue }) => {
    try {
        const response = await chatService.uploadPdfs(files, chatId);
        return response;
    } catch (error: any) {
        return rejectWithValue(error.message || "Upload failed");
    }
});

export const sendMessage = createAsyncThunk<
    ChatResponse,
    { chatId: string; question: string },
    { rejectValue: string }
>("chat/sendMessage", async ({ chatId, question }, { rejectWithValue }) => {
    try {
        const response = await chatService.sendMessage(chatId, question);
        console.log("response send message=", response);
        return response;
    } catch (error: any) {
        return rejectWithValue(error.message || "Message failed");
    }
});

export const fetchChatPdfs = createAsyncThunk<
    any[],
    string,
    { rejectValue: string }
>("chat/fetchPdfs", async (chatId, { rejectWithValue }) => {
    try {
        const response = await chatService.getPdfs(chatId);
        return response;
    } catch (error: any) {
        return rejectWithValue(error.message || "Failed to fetch PDFs");
    }
});

export const fetchChats = createAsyncThunk<
    any,
    void,
    { rejectValue: string }
>("chat/fetchChats", async (_, { rejectWithValue }) => {
    try {
        const response = await chatService.getChats();
        return response;
    } catch (error: any) {
        return rejectWithValue(error.message || "Failed to fetch chats");
    }
});

export const createNewChat = createAsyncThunk<
    any,
    { chatId: string; title?: string },
    { rejectValue: string }
>("chat/createChat", async ({ chatId, title }, { rejectWithValue }) => {
    try {
        const response = await chatService.createChat(chatId, title);
        return response;
    } catch (error: any) {
        return rejectWithValue(error.message || "Failed to create chat");
    }
});

export const deleteChatThunk = createAsyncThunk<
    string,
    string,
    { rejectValue: string }
>("chat/deleteChat", async (chatId, { rejectWithValue }) => {
    try {
        await chatService.deleteChat(chatId);
        return chatId;
    } catch (error: any) {
        return rejectWithValue(error.message || "Failed to delete chat");
    }
});

export const renameChatThunk = createAsyncThunk<
    any,
    { chatId: string; title: string },
    { rejectValue: string }
>("chat/renameChat", async ({ chatId, title }, { rejectWithValue }) => {
    try {
        const response = await chatService.renameChat(chatId, title);
        return response;
    } catch (error: any) {
        return rejectWithValue(error.message || "Failed to rename chat");
    }
});

export const fetchAllDocuments = createAsyncThunk<
    any[],
    void,
    { rejectValue: string }
>("chat/fetchAllDocuments", async (_, { rejectWithValue }) => {
    try {
        const response = await chatService.getAllPdfs();
        return response;
    } catch (error: any) {
        return rejectWithValue(error.message || "Failed to fetch documents");
    }
});

const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        setChatId: (state, action: PayloadAction<string>) => {
            state.activeChatId = action.payload;
            const chat = state.chats.find(c => c.id === action.payload);
            if (chat) {
                state.messages = chat.messages.map(m => ({
                    ...m,
                    timestamp: m.timestamp ? (typeof m.timestamp === 'string' ? m.timestamp : new Date(m.timestamp).toISOString()) : new Date().toISOString()
                }));
            } else {
                state.messages = [];
            }
        },
        addMessage: (state, action: PayloadAction<ChatMessage>) => {
            state.messages.push(action.payload);
        },
        clearMessages: (state) => {
            state.messages = [];
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Upload PDFs
        builder
            .addCase(uploadPdfs.pending, (state) => {
                state.isUploading = true;
                state.error = null;
            })
            .addCase(uploadPdfs.fulfilled, (state, action: PayloadAction<UploadPdfResponse>) => {
                state.isUploading = false;
                const newSources = action.payload.files.map((file) => ({
                    id: file.id,
                    name: file.name,
                    type: "pdf" as const,
                    status: file.status as "ready" | "processing",
                }));
                state.sources = [...state.sources, ...newSources];
                state.error = null;
            })
            .addCase(uploadPdfs.rejected, (state, action) => {
                state.isUploading = false;
                state.error = action.payload || "Upload failed";
            });

        // Send Message
        builder
            .addCase(sendMessage.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(sendMessage.fulfilled, (state, action: PayloadAction<ChatResponse>) => {
                state.isLoading = false;
                state.messages.push({
                    id: Date.now().toString(),
                    role: "assistant",
                    content: action.payload.answer,
                    citations: action.payload.citations,
                    timestamp: new Date().toISOString(),
                });
                state.error = null;
            })
            .addCase(sendMessage.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to send message";
            });

        // Fetch PDFs
        builder
            .addCase(fetchChatPdfs.fulfilled, (state, action: PayloadAction<any[]>) => {
                state.sources = action.payload.map(pdf => ({
                    id: pdf._id,
                    name: pdf.pdfName,
                    type: "pdf",
                    status: "ready"
                }));
            });

        // Fetch Chats
        builder
            .addCase(fetchChats.fulfilled, (state, action: PayloadAction<any>) => {
                const chats = action.payload;

                state.chats = chats.map((chat: any) => ({
                    id: chat._id,
                    title: chat.title || "New Chat",
                    pdfIds: chat.pdfIds,
                    messages: chat.messages,
                    createdAt: chat.createdAt,
                    updatedAt: chat.updatedAt,

                }));

                // If we have an active chat, sync its messages from the newly fetched list
                if (state.activeChatId) {
                    const activeChat = state.chats.find(c => c.id === state.activeChatId);
                    if (activeChat) {
                        state.messages = activeChat.messages.map(m => ({
                            ...m,
                            timestamp: m.timestamp ? (typeof m.timestamp === 'string' ? m.timestamp : new Date(m.timestamp).toISOString()) : new Date().toISOString()
                        }));
                    }
                }
            });

        // Create Chat
        builder
            .addCase(createNewChat.fulfilled, (state, action: PayloadAction<any>) => {
                const exists = state.chats.some(c => c.id === action.payload._id);
                if (!exists) {
                    state.chats.unshift({
                        id: action.payload._id,
                        title: action.payload.title,
                        pdfIds: [],
                        messages: [],
                        createdAt: action.payload.createdAt,
                        updatedAt: action.payload.updatedAt,
                    });
                }
            });

        // Delete Chat
        builder
            .addCase(deleteChatThunk.fulfilled, (state, action: PayloadAction<string>) => {
                state.chats = state.chats.filter(c => c.id !== action.payload);
                if (state.activeChatId === action.payload) {
                    state.activeChatId = null;
                    state.messages = [];
                    state.sources = [];
                }
            });

        // Rename Chat
        builder
            .addCase(renameChatThunk.fulfilled, (state, action: PayloadAction<any>) => {
                const chat = state.chats.find(c => c.id === action.payload._id);
                if (chat) {
                    chat.title = action.payload.title;
                    chat.updatedAt = action.payload.updatedAt;
                }
            });

        // Fetch All Documents
        builder
            .addCase(fetchAllDocuments.fulfilled, (state, action: PayloadAction<any[]>) => {
                state.allDocuments = action.payload;
            });
    },
});

export const { setChatId, addMessage, clearMessages, clearError } = chatSlice.actions;
export default chatSlice.reducer;
