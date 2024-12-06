import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessagesSquare, Plus, Trash2, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function ChatSidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
}) {
  const SidebarContent = () => (
    <>
      <div className="p-4 border-b">
        <Button onClick={onNew} className="w-full" variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle discussion
        </Button>
      </div>
      <ScrollArea className="h-[calc(100vh-5rem)]">
        <div className="p-2 space-y-2">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`group flex items-center justify-between p-2 rounded-lg hover:bg-accent cursor-pointer ${
                activeId === conv.id ? "bg-accent" : ""
              }`}
              onClick={() => onSelect(conv.id)}
            >
              <div className="flex items-center gap-2">
                <MessagesSquare className="h-4 w-4" />
                <span className="text-sm truncate">
                  {conv.title || "Nouvelle discussion"}
                </span>
              </div>
              {activeId === conv.id && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(conv.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </>
  );

  return (
    <>
      {/* Bouton Menu Mobile */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden fixed left-4 top-4 z-50"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-72">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Sidebar Desktop */}
      <div className="hidden md:block w-72 border-r border-border h-screen bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <SidebarContent />
      </div>
    </>
  );
}
