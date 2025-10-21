import { Check, Trash2, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BlockchainBlock } from "@/lib/blockchain";

interface TaskCardProps {
  block: BlockchainBlock;
  onComplete: () => void;
  onDelete: () => void;
  isLoading: boolean;
}

export function TaskCard({ block, onComplete, onDelete, isLoading }: TaskCardProps) {
  const isCompleted = block.status === "completed";
  const blockTypeColor = {
    ADD: "text-primary",
    COMPLETE: "text-green-400",
    DELETE: "text-destructive",
  }[block.block_type] || "text-primary";

  return (
    <Card className="p-5 bg-gradient-to-br from-card to-card/80 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_20px_hsl(var(--primary)/0.2)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <span className={`text-xs font-mono font-bold ${blockTypeColor}`}>
              {block.block_type}
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              Block #{block.block_index}
            </span>
          </div>
          
          <p className={`text-base ${isCompleted ? "line-through text-muted-foreground" : "text-foreground"}`}>
            {block.task_description}
          </p>
          
          <div className="space-y-2 text-xs font-mono">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Link2 className="w-3 h-3" />
              <span className="truncate">Hash: {block.current_hash.substring(0, 16)}...</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Link2 className="w-3 h-3" />
              <span className="truncate">Prev: {block.previous_hash.substring(0, 16)}...</span>
            </div>
            <div className="text-muted-foreground">
              {new Date(block.timestamp).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {!isCompleted && (
            <Button
              size="sm"
              onClick={onComplete}
              disabled={isLoading}
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
            >
              <Check className="w-4 h-4" />
            </Button>
          )}
          <Button
            size="sm"
            variant="destructive"
            onClick={onDelete}
            disabled={isLoading}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}