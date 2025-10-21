import { Card } from "@/components/ui/card";
import { BlockchainBlock } from "@/lib/blockchain";
import { ChevronRight, Database } from "lucide-react";

interface BlockchainVisualizerProps {
  blocks: BlockchainBlock[];
}

export function BlockchainVisualizer({ blocks }: BlockchainVisualizerProps) {
  if (blocks.length === 0) {
    return (
      <Card className="p-8 bg-card/50 border-border text-center">
        <Database className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
        <p className="text-muted-foreground">No blocks in the chain yet</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Database className="w-4 h-4" />
        <span className="font-mono">Blockchain: {blocks.length} blocks</span>
      </div>
      
      <div className="relative overflow-x-auto pb-4">
        <div className="flex items-center gap-3 min-w-max">
          {blocks.map((block, index) => (
            <div key={block.id} className="flex items-center">
              <Card className="p-4 bg-gradient-to-br from-card to-card/60 border-primary/30 min-w-[200px] hover:border-primary transition-all duration-300 hover:shadow-[0_0_20px_hsl(var(--primary)/0.3)]">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-primary">
                      Block {block.block_index}
                    </span>
                    <span className={`text-xs font-bold ${
                      block.block_type === 'ADD' ? 'text-primary' :
                      block.block_type === 'COMPLETE' ? 'text-green-400' :
                      'text-destructive'
                    }`}>
                      {block.block_type}
                    </span>
                  </div>
                  <p className="text-xs text-foreground truncate">
                    {block.task_description}
                  </p>
                  <div className="text-[10px] font-mono text-muted-foreground space-y-1">
                    <div className="truncate">
                      Hash: {block.current_hash.substring(0, 12)}...
                    </div>
                    <div className="truncate">
                      Prev: {block.previous_hash.substring(0, 12)}...
                    </div>
                  </div>
                </div>
              </Card>
              
              {index < blocks.length - 1 && (
                <ChevronRight className="w-6 h-6 text-primary mx-1 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}