"use client";
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Send,
  Bot,
  User,
  Loader2,
  MessagesSquare,
  CircleUser,
  Copy,
  Check,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ChatSidebar } from "@/components/chat-sidebar";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { v4 as uuidv4 } from "uuid";
import Image from "next/image";
import { RouLogo } from "@/components/rou-logo";
import { SplashScreen } from "@/components/splash-screen";

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoadingMessage, setIsLoadingMessage] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [conversations, setConversations] = useLocalStorage(
    "conversations",
    []
  );
  const [activeConversation, setActiveConversation] = useLocalStorage(
    "activeConversation",
    null
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoadingMessage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage;
    const newMessages = [...messages, { role: "user", content: userMessage }];

    setMessages(newMessages);
    setInputMessage("");
    setIsLoadingMessage(true);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: userMessage,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("API Response:", data);

      let aiResponse = "Désolé, je n'ai pas pu générer une réponse.";

      if (data.candidates && data.candidates.length > 0) {
        const candidate = data.candidates[0];
        if (
          candidate.content &&
          candidate.content.parts &&
          candidate.content.parts.length > 0
        ) {
          aiResponse = candidate.content.parts[0].text || aiResponse;
        }
      }

      const aiMessage = { role: "assistant", content: aiResponse };
      const updatedMessages = [...newMessages, aiMessage];
      setMessages(updatedMessages);

      if (activeConversation) {
        setConversations(
          conversations.map((conv) => {
            if (conv.id === activeConversation) {
              return {
                ...conv,
                messages: updatedMessages,
                title:
                  conv.title === "Nouvelle discussion"
                    ? userMessage.slice(0, 30)
                    : conv.title,
              };
            }
            return conv;
          })
        );
      }
    } catch (error) {
      console.error("Error details:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Une erreur s'est produite: ${error.message}`,
        },
      ]);
    } finally {
      setIsLoadingMessage(false);
    }
  };

  const handleCopy = async (text, messageId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000); // Reset après 2 secondes
    } catch (err) {
      console.error("Erreur lors de la copie:", err);
    }
  };

  const LoadingSkeleton = () => (
    <Card className="mr-auto min-w-[200px] w-full max-w-full p-4 border-none shadow-none bg-gradient-to-r from-white/40 to-blue-50/40 dark:from-neutral-900/40 dark:to-blue-950/40 backdrop-blur-sm">
      <div className="flex gap-3">
        <Skeleton className="h-8 w-8 rounded-full shrink-0 animate-pulse bg-gradient-to-br from-blue-200/60 to-purple-200/60 dark:from-blue-800/60 dark:to-purple-800/60" />
        <div className="space-y-3 w-full">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-[60%] animate-pulse bg-gradient-to-r from-blue-100/80 to-purple-100/80 dark:from-blue-900/80 dark:to-purple-900/80" />
            <Skeleton className="h-4 w-[30%] animate-pulse bg-gradient-to-r from-blue-100/60 to-purple-100/60 dark:from-blue-900/60 dark:to-purple-900/60" />
          </div>
          <Skeleton className="h-4 w-[90%] animate-pulse bg-gradient-to-r from-blue-100/70 to-purple-100/70 dark:from-blue-900/70 dark:to-purple-900/70" />
          <Skeleton className="h-4 w-[75%] animate-pulse bg-gradient-to-r from-blue-100/50 to-purple-100/50 dark:from-blue-900/50 dark:to-purple-900/50" />
          <div className="space-y-2">
            <Skeleton className="h-20 w-full rounded-lg animate-pulse bg-gradient-to-br from-blue-100/40 to-purple-100/40 dark:from-blue-900/40 dark:to-purple-900/40" />
          </div>
        </div>
      </div>
    </Card>
  );

  const handleNewConversation = () => {
    const newConv = {
      id: uuidv4(),
      title: "Nouvelle discussion",
      messages: [],
    };
    setConversations([...conversations, newConv]);
    setActiveConversation(newConv.id);
    setMessages([]);
  };

  const handleDeleteConversation = (id) => {
    setConversations(conversations.filter((conv) => conv.id !== id));
    if (activeConversation === id) {
      const remaining = conversations.filter((conv) => conv.id !== id);
      setActiveConversation(remaining[0]?.id || null);
      setMessages(remaining[0]?.messages || []);
    }
  };

  const handleSelectConversation = (id) => {
    setActiveConversation(id);
    const conv = conversations.find((c) => c.id === id);
    setMessages(conv?.messages || []);
  };

  return (
    <>
      {isInitialLoading && (
        <SplashScreen finishLoading={() => setIsInitialLoading(false)} />
      )}

      <div className="flex h-screen relative animate-fadeIn">
        <ChatSidebar
          conversations={conversations}
          activeId={activeConversation}
          onSelect={handleSelectConversation}
          onNew={handleNewConversation}
          onDelete={handleDeleteConversation}
        />
        <div className="flex-1 flex flex-col">
          <div className="container mx-auto max-w-4xl min-h-screen p-4">
            <div className="flex items-center justify-between mb-4 md:pl-0 pl-12">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <RouLogo />
                </Avatar>
                <div>
                  <h1 className="text-xl font-bold">Rou Assistant</h1>
                  <p className="text-sm text-muted-foreground">
                    Développé par{" "}
                    <a
                      href="https://daoud-djaffar.web.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline text-blue-500"
                    >
                      Daoud Djaffar
                    </a>
                  </p>
                </div>
              </div>
              <ThemeToggle />
            </div>

            <Card className="min-h-[80vh] flex flex-col h-[calc(100vh-7rem)] border-none shadow-none bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
              <CardContent
                className="flex-1 flex flex-col gap-4 p-4 overflow-y-auto"
                style={{
                  height: "calc(100% - 80px)",
                  scrollbarGutter: "stable",
                }}
              >
                {messages.map((message, index) => (
                  <Card
                    key={index}
                    className={`flex gap-3 p-4 relative group ${
                      message.role === "user" ? "ml-auto" : "mr-auto"
                    } min-w-[200px] max-w-[80%] sm:max-w-[80%] md:max-w-[80%] xs:max-w-full border-none shadow-none transition-all duration-300 hover:bg-gradient-to-r ${
                      message.role === "user"
                        ? "hover:from-green-50/50 hover:to-emerald-50/50 dark:hover:from-green-950/50 dark:hover:to-emerald-950/50"
                        : "hover:from-blue-50/50 hover:to-purple-50/50 dark:hover:from-blue-950/50 dark:hover:to-purple-950/50"
                    } backdrop-blur-sm`}
                  >
                    <button
                      onClick={() => handleCopy(message.content, index)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                      title="Copier le message"
                    >
                      {copiedMessageId === index ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-500" />
                      )}
                    </button>
                    {message.role === "user" ? (
                      <Avatar className="h-8 w-8 bg-gradient-to-br from-green-400 to-emerald-600">
                        <AvatarFallback className="">
                          <CircleUser className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <Avatar className="h-8 w-8 bg-gradient-to-br from-blue-400 to-purple-600">
                        <RouLogo />
                      </Avatar>
                    )}
                    <div className="prose prose-sm dark:prose-invert">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          // Style personnalisé pour les listes
                          ul: ({ node, ...props }) => (
                            <ul className="list-disc ml-4 mt-2" {...props} />
                          ),
                          // Style personnalisé pour les titres en bleu
                          h1: ({ node, ...props }) => (
                            <h1
                              className="text-xl font-bold mt-4 mb-2 text-blue-700"
                              {...props}
                            />
                          ),
                          h2: ({ node, ...props }) => (
                            <h2
                              className="text-lg font-bold mt-3 mb-2 text-blue-600"
                              {...props}
                            />
                          ),
                          h3: ({ node, ...props }) => (
                            <h3
                              className="text-md font-bold mt-2 mb-1 text-blue-500"
                              {...props}
                            />
                          ),
                          // Style personnalisé pour les liens
                          a: ({ node, ...props }) => (
                            <a
                              className="text-blue-600 hover:underline"
                              {...props}
                            />
                          ),
                          // Style personnalisé pour le texte en gras
                          strong: ({ node, ...props }) => (
                            <strong
                              className="font-bold text-blue-700"
                              {...props}
                            />
                          ),
                          // Style personnalisé pour les paragraphes
                          p: ({ node, ...props }) => (
                            <p className="mb-2" {...props} />
                          ),
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  </Card>
                ))}

                {isLoadingMessage && <LoadingSkeleton />}

                <div ref={messagesEndRef} />
              </CardContent>

              <div className="p-4 border-t mt-auto bg-gradient-to-r from-white/80 to-blue-50/80 dark:from-neutral-950/80 dark:to-blue-950/80 backdrop-blur-sm dark:border-neutral-800">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Écrivez votre message..."
                    className="flex-1 min-h-[44px] max-h-32 resize-none dark:bg-neutral-900 dark:border-neutral-800 transition-all duration-300 focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50 hover:border-blue-300 dark:hover:border-blue-700"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                  />
                  <Button
                    type="submit"
                    disabled={isLoadingMessage}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  >
                    {isLoadingMessage ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span className="ml-2 hidden sm:inline">Envoyer</span>
                  </Button>
                </form>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
