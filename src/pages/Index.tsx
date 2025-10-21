import { useEffect, useState } from "react";
import { TaskForm } from "@/components/TaskForm";
import { TaskCard } from "@/components/TaskCard";
import { BlockchainVisualizer } from "@/components/BlockchainVisualizer";
import { useToast } from "@/hooks/use-toast";
import { 
  addTask, 
  completeTask, 
  deleteTask, 
  getBlockchain, 
  getLatestTaskState,
  BlockchainBlock 
} from "@/lib/blockchain";
import { supabase } from "@/integrations/supabase/client";
import { Layers, Loader2 } from "lucide-react";

const Index = () => {
  const [blocks, setBlocks] = useState<BlockchainBlock[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadBlockchain();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('blockchain-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'blockchain'
        },
        () => {
          console.log('New block detected, reloading blockchain...');
          loadBlockchain();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadBlockchain = async () => {
    try {
      const data = await getBlockchain();
      setBlocks(data);
    } catch (error) {
      console.error('Error loading blockchain:', error);
      toast({
        title: "Error",
        description: "Failed to load blockchain",
        variant: "destructive",
      });
    }
  };

  const handleAddTask = async (description: string) => {
    setIsLoading(true);
    try {
      await addTask(description);
      toast({
        title: "Block Added",
        description: "New task block created in the chain",
      });
    } catch (error) {
      console.error('Error adding task:', error);
      toast({
        title: "Error",
        description: "Failed to add task block",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteTask = async (taskId: string, description: string) => {
    setIsLoading(true);
    try {
      await completeTask(taskId, description);
      toast({
        title: "Block Added",
        description: "Task completion recorded in blockchain",
      });
    } catch (error) {
      console.error('Error completing task:', error);
      toast({
        title: "Error",
        description: "Failed to complete task",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTask = async (taskId: string, description: string) => {
    setIsLoading(true);
    try {
      await deleteTask(taskId, description);
      toast({
        title: "Block Added",
        description: "Task deletion recorded in blockchain",
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const activeTasks = getLatestTaskState(blocks);
  const totalFees = blocks.reduce((sum, block) => sum + Number(block.transaction_fee), 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8 text-center space-y-3">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Layers className="w-10 h-10 text-primary" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Blockchain Todo
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Every task operation creates an immutable block in the chain. Full transparency and history.
          </p>
        </div>

        {/* Task Form */}
        <div className="mb-8">
          <TaskForm onAddTask={handleAddTask} isLoading={isLoading} />
        </div>

        {/* Blockchain Visualization */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-foreground flex items-center gap-2">
            <Layers className="w-6 h-6 text-primary" />
            Blockchain Chain
          </h2>
          <BlockchainVisualizer blocks={blocks} />
        </div>

        {/* Active Tasks */}
        <div>
          <h2 className="text-2xl font-bold mb-4 text-foreground">
            Active Tasks ({activeTasks.length})
          </h2>
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}
          {!isLoading && activeTasks.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No active tasks. Add a task to create the first block!
            </div>
          )}
          <div className="space-y-4">
            {activeTasks.map((block) => (
              <TaskCard
                key={block.id}
                block={block}
                onComplete={() => handleCompleteTask(block.task_id, block.task_description)}
                onDelete={() => handleDeleteTask(block.task_id, block.task_description)}
                isLoading={isLoading}
              />
            ))}
          </div>
        </div>

        {/* Stats Footer */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-card/50 rounded-lg border border-border">
              <div className="text-3xl font-bold text-primary font-mono">{blocks.length}</div>
              <div className="text-sm text-muted-foreground">Total Blocks</div>
            </div>
            <div className="p-4 bg-card/50 rounded-lg border border-border">
              <div className="text-3xl font-bold text-secondary font-mono">{activeTasks.length}</div>
              <div className="text-sm text-muted-foreground">Active Tasks</div>
            </div>
            <div className="p-4 bg-card/50 rounded-lg border border-border">
              <div className="text-3xl font-bold text-accent font-mono">
                {activeTasks.filter(b => b.status === 'completed').length}
              </div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="p-4 bg-card/50 rounded-lg border border-border">
              <div className="text-3xl font-bold text-primary font-mono">{totalFees.toFixed(4)}</div>
              <div className="text-sm text-muted-foreground">Total Fees (ETH)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;