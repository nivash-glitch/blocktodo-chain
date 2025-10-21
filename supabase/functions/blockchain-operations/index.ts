import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Block {
  block_index: number;
  task_id: string;
  task_description: string;
  status: string;
  block_type: string;
  timestamp: string;
  previous_hash: string;
  current_hash: string;
  transaction_fee: number;
}

function calculateTransactionFee(blockType: string): number {
  // Different operations have different fees
  const fees: Record<string, number> = {
    'ADD': 0.001,
    'COMPLETE': 0.0005,
    'DELETE': 0.0003,
  };
  return fees[blockType] || 0.001;
}

async function calculateHash(block: Omit<Block, 'current_hash'>): Promise<string> {
  const data = JSON.stringify({
    block_index: block.block_index,
    task_id: block.task_id,
    task_description: block.task_description,
    status: block.status,
    block_type: block.block_type,
    timestamp: block.timestamp,
    previous_hash: block.previous_hash,
    transaction_fee: block.transaction_fee,
  });
  
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { operation, task_id, task_description } = await req.json();
    console.log('Blockchain operation:', operation, task_id, task_description);

    // Get the latest block to determine next block index and previous hash
    const { data: latestBlock, error: fetchError } = await supabaseClient
      .from('blockchain')
      .select('*')
      .order('block_index', { ascending: false })
      .limit(1)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching latest block:', fetchError);
      throw fetchError;
    }

    const nextBlockIndex = latestBlock ? latestBlock.block_index + 1 : 0;
    const previousHash = latestBlock ? latestBlock.current_hash : '0';

    let newBlock: Omit<Block, 'current_hash'>;
    const timestamp = new Date().toISOString();

    switch (operation) {
      case 'add_task': {
        const fee = calculateTransactionFee('ADD');
        newBlock = {
          block_index: nextBlockIndex,
          task_id,
          task_description,
          status: 'pending',
          block_type: 'ADD',
          timestamp,
          previous_hash: previousHash,
          transaction_fee: fee,
        };
        break;
      }

      case 'complete_task': {
        const fee = calculateTransactionFee('COMPLETE');
        newBlock = {
          block_index: nextBlockIndex,
          task_id,
          task_description,
          status: 'completed',
          block_type: 'COMPLETE',
          timestamp,
          previous_hash: previousHash,
          transaction_fee: fee,
        };
        break;
      }

      case 'delete_task': {
        const fee = calculateTransactionFee('DELETE');
        newBlock = {
          block_index: nextBlockIndex,
          task_id,
          task_description,
          status: 'deleted',
          block_type: 'DELETE',
          timestamp,
          previous_hash: previousHash,
          transaction_fee: fee,
        };
        break;
      }

      default:
        throw new Error('Invalid operation');
    }

    const currentHash = await calculateHash(newBlock);
    const blockToInsert = { ...newBlock, current_hash: currentHash };

    console.log('Creating block:', blockToInsert);

    const { data: insertedBlock, error: insertError } = await supabaseClient
      .from('blockchain')
      .insert(blockToInsert)
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting block:', insertError);
      throw insertError;
    }

    console.log('Block created successfully:', insertedBlock);

    return new Response(JSON.stringify({ success: true, block: insertedBlock }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Blockchain operation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});