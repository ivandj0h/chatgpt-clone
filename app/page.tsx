"use client";

import type React from "react";

import { useChat } from "ai/react";
import { useState, useRef, useEffect } from "react";
import {
  Send,
  Paperclip,
  Plus,
  Menu,
  Settings,
  User,
  Bot,
  ImageIcon,
  X,
  Zap,
  Trash2,
  Copy,
  Check,
} from "lucide-react";
import Image from "next/image";

const models = [
  {
    id: "gpt-4o",
    name: "GPT-4o",
    description: "Most capable model",
    icon: "🧠",
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o mini",
    description: "Faster and cheaper",
    icon: "⚡",
  },
  {
    id: "gpt-4-turbo",
    name: "GPT-4 Turbo",
    description: "Previous generation",
    icon: "🔥",
  },
  {
    id: "gpt-3.5-turbo",
    name: "GPT-3.5 Turbo",
    description: "Fast and efficient",
    icon: "💨",
  },
];

interface Conversation {
  id: string;
  title: string;
  timestamp: Date;
  messages: any[];
}

interface TextContent {
  type: "text";
  text: string;
}

interface ImageContent {
  type: "image_url";
  image_url: {
    url: string;
  };
}

type MessageContent = TextContent | ImageContent;

// Code Block Component
const CodeBlock = ({ code, language }: { code: string; language: string }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative bg-gray-900 border border-gray-700 rounded-lg overflow-hidden my-3">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <span className="text-sm text-gray-300 font-medium">{language}</span>
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded transition-colors"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm">
        <code className="text-gray-100">{code}</code>
      </pre>
    </div>
  );
};

// Message Parser Component
const MessageParser = ({ content }: { content: string }) => {
  const parseMessage = (text: string) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        const textBefore = text.slice(lastIndex, match.index);
        if (textBefore.trim()) {
          parts.push({ type: "text", content: textBefore });
        }
      }

      // Add code block with default language if not specified
      const language = match[1] || "text";
      const code = match[2];
      parts.push({ type: "code", language, content: code });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      const remainingText = text.slice(lastIndex);
      if (remainingText.trim()) {
        parts.push({ type: "text", content: remainingText });
      }
    }

    return parts.length > 0 ? parts : [{ type: "text", content: text }];
  };

  const parts = parseMessage(content);

  return (
    <div>
      {parts.map((part, index) => (
        <div key={index}>
          {part.type === "text" ? (
            <div className="whitespace-pre-wrap leading-relaxed">
              {part.content}
            </div>
          ) : (
            <CodeBlock code={part.content} language={part.language || "text"} />
          )}
        </div>
      ))}
    </div>
  );
};

export default function ChatGPTClone() {
  const [selectedModel, setSelectedModel] = useState("gpt-4o");
  const [files, setFiles] = useState<File[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([
    { id: "1", title: "New Chat", timestamp: new Date(), messages: [] },
  ]);
  const [currentConversation, setCurrentConversation] = useState("1");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setMessages,
    error,
  } = useChat({
    api: "/api/chat",
    body: {
      model: selectedModel,
    },
    onFinish: (message) => {
      // Update conversation title based on first user message
      const currentConv = conversations.find(
        (c) => c.id === currentConversation
      );
      if (currentConv && messages.length <= 2) {
        const firstUserMessage = messages.find((m) => m.role === "user");
        if (firstUserMessage) {
          const title =
            firstUserMessage.content.slice(0, 50) +
            (firstUserMessage.content.length > 50 ? "..." : "");
          setConversations((prev) =>
            prev.map((conv) =>
              conv.id === currentConversation
                ? { ...conv, title, messages: [...messages, message] }
                : conv
            )
          );
        }
      }
    },
    onError: (error) => {
      console.error("Chat error:", error);
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [input]);

  // Save current conversation messages
  useEffect(() => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === currentConversation ? { ...conv, messages } : conv
      )
    );
  }, [messages, currentConversation]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const convertFilesToBase64 = async (files: File[]): Promise<string[]> => {
    const promises = files.map((file) => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });
    return Promise.all(promises);
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!input.trim() && files.length === 0) return;

    try {
      const messageContent = input;

      // Handle image files
      if (files.length > 0) {
        const base64Images = await convertFilesToBase64(files);

        // Create message with images
        const imageMessages = base64Images.map((base64) => ({
          type: "image_url" as const,
          image_url: { url: base64 },
        }));

        // Add text if present
        const content = messageContent
          ? [{ type: "text" as const, text: messageContent }, ...imageMessages]
          : imageMessages;

        handleSubmit(event, {
          data: { content },
        });
      } else {
        handleSubmit(event);
      }

      // Clear files after sending
      setFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const startNewChat = () => {
    const newId = Date.now().toString();
    const newConversation: Conversation = {
      id: newId,
      title: "New Chat",
      timestamp: new Date(),
      messages: [],
    };
    setConversations((prev) => [newConversation, ...prev]);
    setCurrentConversation(newId);
    setMessages([]);
  };

  const switchConversation = (convId: string) => {
    const conv = conversations.find((c) => c.id === convId);
    if (conv) {
      setCurrentConversation(convId);
      setMessages(conv.messages);
    }
  };

  const deleteConversation = (convId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setConversations((prev) => prev.filter((c) => c.id !== convId));

    if (currentConversation === convId) {
      const remaining = conversations.filter((c) => c.id !== convId);
      if (remaining.length > 0) {
        switchConversation(remaining[0].id);
      } else {
        startNewChat();
      }
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } transition-all duration-300 bg-gray-950 border-r border-gray-700 flex flex-col overflow-hidden`}
      >
        <div className="p-3">
          <button
            onClick={startNewChat}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-gray-600 hover:bg-gray-800 transition-all duration-200 hover:border-gray-500 group"
          >
            <Plus
              size={16}
              className="group-hover:rotate-90 transition-transform duration-200"
            />
            <span className="font-medium">New chat</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`relative group rounded-lg transition-all duration-200 hover:bg-gray-800 ${
                currentConversation === conv.id
                  ? "bg-gray-800 border border-gray-600"
                  : "hover:border hover:border-gray-700"
              }`}
            >
              <button
                onClick={() => switchConversation(conv.id)}
                className="w-full text-left px-3 py-2.5 rounded-lg"
              >
                <div className="truncate text-sm font-medium mb-1 pr-6">
                  {conv.title}
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{formatTime(conv.timestamp)}</span>
                  <span>{conv.messages.length} msgs</span>
                </div>
              </button>

              {conversations.length > 1 && (
                <button
                  onClick={(e) => deleteConversation(conv.id, e)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-gray-700 transition-all"
                >
                  <Trash2
                    size={12}
                    className="text-gray-400 hover:text-red-400"
                  />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-gray-700">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-800 cursor-pointer transition-colors">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User size={14} />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">User</div>
              <div className="text-xs text-gray-400">Free Plan</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Menu size={20} />
            </button>

            <div className="relative">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer hover:bg-gray-750 transition-colors"
              >
                {models.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.icon} {model.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            <div className="flex items-center gap-1 px-2 py-1 bg-green-900/20 border border-green-700/30 rounded-full text-xs text-green-400">
              <Zap size={12} />
              <span>Turbopack</span>
            </div>
          </div>

          <button className="p-2 rounded-lg hover:bg-gray-800 transition-colors">
            <Settings size={20} />
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-900/20 border border-red-700/30 rounded-lg text-red-400 text-sm">
            <strong>Error:</strong> {error.message}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Bot size={32} />
                </div>
                <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  How can I help you today?
                </h2>
                <p className="text-gray-400 mb-6">
                  Start a conversation with ChatGPT
                </p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gray-600 cursor-pointer transition-colors">
                    <div className="font-medium mb-1">💡 Creative Writing</div>
                    <div className="text-gray-400 text-xs">
                      Help with stories and content
                    </div>
                  </div>
                  <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gray-600 cursor-pointer transition-colors">
                    <div className="font-medium mb-1">🔍 Analysis</div>
                    <div className="text-gray-400 text-xs">
                      Analyze data and images
                    </div>
                  </div>
                  <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gray-600 cursor-pointer transition-colors">
                    <div className="font-medium mb-1">💻 Coding</div>
                    <div className="text-gray-400 text-xs">
                      Programming help
                    </div>
                  </div>
                  <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gray-600 cursor-pointer transition-colors">
                    <div className="font-medium mb-1">🎓 Learning</div>
                    <div className="text-gray-400 text-xs">
                      Explain complex topics
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
              {messages.map((message, index) => (
                <div key={message.id} className="group">
                  {message.role === "user" ? (
                    // User Message - Right Side (Blue)
                    <div className="flex justify-end">
                      <div className="flex items-start gap-3 max-w-[80%]">
                        <div className="flex flex-col items-end">
                          <div className="bg-blue-600 text-white rounded-2xl rounded-tr-md px-4 py-3 shadow-lg">
                            {typeof message.content === "string" ? (
                              <div className="whitespace-pre-wrap leading-relaxed">
                                {message.content}
                              </div>
                            ) : Array.isArray(message.content) ? (
                              <div className="space-y-2">
                                {(message.content as MessageContent[]).map(
                                  (content, contentIndex) => (
                                    <div key={contentIndex}>
                                      {content.type === "text" && (
                                        <div className="whitespace-pre-wrap leading-relaxed">
                                          {content.text}
                                        </div>
                                      )}
                                      {content.type === "image_url" && (
                                        <div className="mt-2">
                                          <Image
                                            src={
                                              content.image_url.url ||
                                              "/placeholder.svg"
                                            }
                                            alt="Uploaded image"
                                            width={300}
                                            height={200}
                                            className="rounded-lg"
                                          />
                                        </div>
                                      )}
                                    </div>
                                  )
                                )}
                              </div>
                            ) : null}
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                            <span>You</span>
                          </div>
                        </div>
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <User size={16} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Assistant Message - Left Side (Green)
                    <div className="flex justify-start">
                      <div className="flex items-start gap-3 max-w-[80%]">
                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <Bot size={16} />
                        </div>
                        <div className="flex flex-col">
                          <div className="bg-green-600 text-white rounded-2xl rounded-tl-md px-4 py-3 shadow-lg">
                            {typeof message.content === "string" ? (
                              <MessageParser content={message.content} />
                            ) : Array.isArray(message.content) ? (
                              <div className="space-y-2">
                                {(message.content as MessageContent[]).map(
                                  (content, contentIndex) => (
                                    <div key={contentIndex}>
                                      {content.type === "text" && (
                                        <MessageParser content={content.text} />
                                      )}
                                      {content.type === "image_url" && (
                                        <div className="mt-2">
                                          <Image
                                            src={
                                              content.image_url.url ||
                                              "/placeholder.svg"
                                            }
                                            alt="Response image"
                                            width={300}
                                            height={200}
                                            className="rounded-lg"
                                          />
                                        </div>
                                      )}
                                    </div>
                                  )
                                )}
                              </div>
                            ) : null}
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                            <span>ChatGPT</span>
                            <span className="bg-gray-800 px-2 py-0.5 rounded-full">
                              {models.find((m) => m.id === selectedModel)?.name}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-3 max-w-[80%]">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot size={16} />
                    </div>
                    <div className="flex flex-col">
                      <div className="bg-green-600 text-white rounded-2xl rounded-tl-md px-4 py-3 shadow-lg">
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-white rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-white rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                        <span>ChatGPT</span>
                        <span className="bg-gray-800 px-2 py-0.5 rounded-full">
                          {models.find((m) => m.id === selectedModel)?.name}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-700 bg-gray-900/50 backdrop-blur-sm p-4">
          <div className="max-w-4xl mx-auto">
            {files.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2 text-sm border border-gray-600"
                  >
                    <ImageIcon size={16} className="text-blue-400" />
                    <span className="truncate max-w-32">{file.name}</span>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={onSubmit} className="relative">
              <div className="flex items-end gap-2 bg-gray-800 rounded-2xl border border-gray-600 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 text-gray-400 hover:text-white transition-colors hover:bg-gray-700 rounded-l-2xl"
                >
                  <Paperclip size={20} />
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  multiple
                />

                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Message ChatGPT..."
                  className="flex-1 bg-transparent border-none outline-none resize-none py-3 px-1 text-white placeholder-gray-400 min-h-[24px] max-h-32 leading-6"
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      onSubmit(e);
                    }
                  }}
                />

                <button
                  type="submit"
                  disabled={(!input.trim() && files.length === 0) || isLoading}
                  className="p-3 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:bg-gray-700 rounded-r-2xl disabled:hover:bg-transparent"
                >
                  <Send size={20} />
                </button>
              </div>
            </form>

            <p className="text-xs text-gray-500 text-center mt-3">
              ChatGPT can make mistakes. Check important info.
              <span className="ml-2 text-green-400">
                ⚡ Powered by ivandjoh &copy; {new Date().getFullYear()}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
