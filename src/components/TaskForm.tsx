import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

interface TaskFormProps {
  onAddTask: (description: string) => void;
  isLoading: boolean;
}

export function TaskForm({ onAddTask, isLoading }: TaskFormProps) {
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim()) {
      onAddTask(description.trim());
      setDescription("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <Input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Enter task description..."
        disabled={isLoading}
        className="flex-1 bg-input border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
      />
      <Button 
        type="submit" 
        disabled={isLoading || !description.trim()}
        className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all hover:shadow-[0_0_20px_hsl(var(--primary)/0.5)]"
      >
        <Plus className="w-5 h-5 mr-2" />
        Add Block
      </Button>
    </form>
  );
}