-- Create blockchain table to store all blocks
CREATE TABLE IF NOT EXISTS public.blockchain (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  block_index INTEGER NOT NULL,
  task_id TEXT NOT NULL,
  task_description TEXT NOT NULL,
  status TEXT NOT NULL,
  block_type TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  previous_hash TEXT NOT NULL,
  current_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.blockchain ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read blockchain (public ledger concept)
CREATE POLICY "Anyone can view blockchain"
  ON public.blockchain
  FOR SELECT
  USING (true);

-- Create policy to allow insertions (blocks can only be added, never modified)
CREATE POLICY "Anyone can add blocks"
  ON public.blockchain
  FOR INSERT
  WITH CHECK (true);

-- Create index on block_index for faster queries
CREATE INDEX idx_blockchain_block_index ON public.blockchain(block_index DESC);

-- Create index on task_id for faster task lookups
CREATE INDEX idx_blockchain_task_id ON public.blockchain(task_id);

-- Enable realtime for blockchain table
ALTER TABLE public.blockchain REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.blockchain;