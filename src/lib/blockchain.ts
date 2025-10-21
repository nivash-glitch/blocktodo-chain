import { supabase } from "@/integrations/supabase/client";

export interface BlockchainBlock {
  id: string;
  block_index: number;
  task_id: string;
  task_description: string;
  status: string;
  block_type: string;
  timestamp: string;
  previous_hash: string;
  current_hash: string;
  created_at: string;
}

export async function addTask(taskDescription: string) {
  const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const { data, error } = await supabase.functions.invoke('blockchain-operations', {
    body: {
      operation: 'add_task',
      task_id: taskId,
      task_description: taskDescription,
    },
  });

  if (error) throw error;
  return data;
}

export async function completeTask(taskId: string, taskDescription: string) {
  const { data, error } = await supabase.functions.invoke('blockchain-operations', {
    body: {
      operation: 'complete_task',
      task_id: taskId,
      task_description: taskDescription,
    },
  });

  if (error) throw error;
  return data;
}

export async function deleteTask(taskId: string, taskDescription: string) {
  const { data, error } = await supabase.functions.invoke('blockchain-operations', {
    body: {
      operation: 'delete_task',
      task_id: taskId,
      task_description: taskDescription,
    },
  });

  if (error) throw error;
  return data;
}

export async function getBlockchain(): Promise<BlockchainBlock[]> {
  const { data, error } = await supabase
    .from('blockchain')
    .select('*')
    .order('block_index', { ascending: true });

  if (error) throw error;
  return data || [];
}

export function getLatestTaskState(blocks: BlockchainBlock[]) {
  const taskMap = new Map<string, BlockchainBlock>();
  
  // Process blocks in order to get the latest state of each task
  blocks.forEach(block => {
    taskMap.set(block.task_id, block);
  });

  // Filter out deleted tasks and return only pending/completed tasks
  return Array.from(taskMap.values()).filter(
    block => block.status !== 'deleted'
  );
}