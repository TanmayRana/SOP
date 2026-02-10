import {
  FileText,
  ExternalLink,
  CheckCircle2,
  Lightbulb,
  HelpCircle,
  BookOpen,
  AlertCircle,
  Code2
} from "lucide-react";
import { type StructuredAnswer, type Citation, type ContentBlock } from "@/store/services/chat.service";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string | StructuredAnswer;
  citations?: Citation[];
  timestamp: string;
}

interface ChatMessageProps {
  message: Message;
  onCitationClick?: (citation: Citation) => void;
}

/* ----------------------------------
   BLOCK SUB-COMPONENTS
---------------------------------- */

const AnswerBox = ({ text, title }: { text: string; title?: string }) => (
  <section className="bg-primary/5 p-4 rounded-xl border border-primary/10">
    {title && <h4 className="text-primary font-bold mb-1">{title}</h4>}
    <p className="text-sm font-medium leading-relaxed">{text}</p>
  </section>
);

const StepsList = ({ items, title }: { items: { step: number; text: string }[]; title?: string }) => (
  <section>
    <h4 className="flex items-center gap-2 text-foreground font-bold mb-3">
      <CheckCircle2 className="w-4 h-4 text-green-500" />
      {title || "Steps"}
    </h4>
    <div className="space-y-3 ml-1">
      {items.map((step, i) => (
        <div key={i} className="flex gap-3">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold">
            {step.step || i + 1}
          </span>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {step.text}
          </p>
        </div>
      ))}
    </div>
  </section>
);

const KeyTakeaways = ({ items, title }: { items: string[]; title?: string }) => (
  <section>
    <h4 className="flex items-center gap-2 text-foreground font-bold mb-2">
      <Lightbulb className="w-4 h-4 text-amber-500" />
      {title || "Key Takeaways"}
    </h4>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
      {items.map((point, i) => (
        <div key={i} className="flex items-start gap-2 bg-secondary/30 p-2 rounded-lg border border-border/50">
          <span className="text-primary mt-1 text-xs">•</span>
          <p className="text-xs text-muted-foreground">{point}</p>
        </div>
      ))}
    </div>
  </section>
);

const CodeBlock = ({ code, title }: { code: string; title?: string }) => (
  <section className="bg-zinc-950 text-zinc-50 p-4 rounded-xl overflow-x-auto border border-zinc-800">
    {title && <h4 className="text-xs font-bold text-zinc-400 mb-2 uppercase tracking-widest">{title}</h4>}
    <code className="text-xs font-mono whitespace-pre-wrap">{code}</code>
  </section>
);

const ExampleBox = ({ text, title }: { text: string; title?: string }) => (
  <section className="bg-secondary/40 rounded-xl p-4 border border-border/50">
    <h4 className="flex items-center gap-2 text-foreground font-bold mb-2">
      <Code2 className="w-4 h-4 text-purple-500" />
      {title || "Practical Example"}
    </h4>
    <p className="text-sm text-muted-foreground">{text}</p>
  </section>
);

const WarningBox = ({ text, title, type }: { text: string; title?: string; type: "warning" | "limitations" }) => (
  <section className="bg-destructive/5 p-3 rounded-lg border border-destructive/10 flex gap-3">
    <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
    <div className="space-y-1">
      <h4 className="text-xs font-bold text-destructive uppercase tracking-wider">{title || (type === "warning" ? "Warning" : "Limitations")}</h4>
      <p className="text-xs text-muted-foreground italic leading-relaxed">{text}</p>
    </div>
  </section>
);

const FollowUpList = ({ items }: { items: string[] }) => (
  <section className="pt-2 border-t border-border/50">
    <div className="flex flex-wrap gap-2">
      <HelpCircle className="w-3 h-3 text-muted-foreground mt-1" />
      {items.map((q, i) => (
        <span key={i} className="text-[10px] text-primary bg-primary/5 px-2 py-1 rounded-full border border-primary/20">
          {q}
        </span>
      ))}
    </div>
  </section>
);

const ExplanationBox = ({ text, title }: { text: string; title?: string }) => (
  <section>
    <h4 className="flex items-center gap-2 text-foreground font-bold mb-2">
      <BookOpen className="w-4 h-4 text-blue-500" />
      {title || "Explanation"}
    </h4>
    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
      {text}
    </p>
  </section>
);

const RenderBlock = ({ block }: { block: ContentBlock }) => {
  switch (block.type) {
    case "answer":
      return <AnswerBox text={block.text || ""} title={block.title} />;
    case "explanation":
      return <ExplanationBox text={block.text || ""} title={block.title} />;
    case "steps":
      return <StepsList items={block.steps || []} title={block.title} />;
    case "key_points":
      return <KeyTakeaways items={block.list || []} title={block.title} />;
    case "code":
      return <CodeBlock code={block.text || ""} title={block.title} />;
    case "example":
      return <ExampleBox text={block.text || ""} title={block.title} />;
    case "warning":
    case "limitations":
      return <WarningBox text={block.text || ""} title={block.title} type={block.type} />;
    case "follow_up":
      return <FollowUpList items={block.list || []} />;
    default:
      return null;
  }
};

const StructuredContent = ({ data }: { data: StructuredAnswer }) => {
  return (
    <div className="space-y-6 text-foreground">
      {data.blocks.map((block, i) => (
        <RenderBlock key={i} block={block} />
      ))}
    </div>
  );
};

const ChatMessage = ({ message, onCitationClick }: ChatMessageProps) => {
  const isUser = message.role === "user";

  // Try to parse content if it's a string that looks like JSON
  let displayContent = message.content;
  if (typeof message.content === "string" && message.content.trim().startsWith("{")) {
    try {
      displayContent = JSON.parse(message.content);
    } catch (e) {
      // Not valid JSON, keep as string
    }
  }

  const isStructured = typeof displayContent === "object" && displayContent !== null && 'blocks' in displayContent;

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} animate-fade-in`}
    >
      <div
        className={`${isUser ? "max-w-[85%] md:max-w-[70%]" : "w-full lg:max-w-[85%] xl:max-w-[75%]"
          } ${isUser ? "chat-bubble-user" : "chat-bubble-assistant"} px-4 py-3`}
      >
        {/* Message Content */}
        {isStructured ? (
          <StructuredContent data={displayContent as StructuredAnswer} />
        ) : (
          <p className={`text-sm leading-relaxed ${isUser ? "text-primary-foreground" : "text-foreground"}`}>
            {displayContent as string}
          </p>
        )}

        {/* Citations */}
        {message.citations && message.citations.length > 0 && (
          <div className="mt-6 pt-4 border-t border-border/30">
            <p className="text-xs font-medium text-muted-foreground mb-2">Sources:</p>
            <div className="flex flex-wrap gap-2">
              {message.citations.map((citation) => (
                <button
                  key={citation.id}
                  onClick={() => onCitationClick?.(citation)}
                  className="citation-badge cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <FileText className="w-3 h-3" />
                  <span>{citation.documentName}</span>
                  <span className="text-muted-foreground">p.{citation.pageNumber}</span>
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Timestamp */}
        <p
          className={`text-[10px] mt-4 ${isUser ? "text-primary-foreground/60" : "text-muted-foreground"
            }`}
        >
          {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );
};

export default ChatMessage;
