-- Add transaction_fee column to blockchain table
ALTER TABLE public.blockchain 
ADD COLUMN transaction_fee numeric NOT NULL DEFAULT 0.001;

-- Add index for better performance on fee queries
CREATE INDEX idx_blockchain_transaction_fee ON public.blockchain(transaction_fee);