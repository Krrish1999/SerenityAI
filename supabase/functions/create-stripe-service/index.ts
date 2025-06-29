import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.40.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    // Get the current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    // Parse request body
    const { 
      service_id,
      name, 
      description, 
      price_amount, 
      type, 
      billing_interval,
      stripe_account_id 
    } = await req.json()

    // Validate required fields
    if (!name || !price_amount || !type || !stripe_account_id) {
      throw new Error('Missing required fields')
    }

    // Get Stripe secret key
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeSecretKey) {
      throw new Error('Stripe secret key not configured')
    }

    // Create or update Stripe product
    let productId: string
    
    if (service_id) {
      // For updates, we might need to get existing product ID
      const { data: existingService } = await supabaseClient
        .from('therapist_services')
        .select('stripe_product_id')
        .eq('id', service_id)
        .single()
      
      productId = existingService?.stripe_product_id
      
      if (productId) {
        // Update existing product
        const productResponse = await fetch(`https://api.stripe.com/v1/products/${productId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${stripeSecretKey}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Stripe-Account': stripe_account_id,
          },
          body: new URLSearchParams({
            name: name,
            description: description || '',
          }),
        })

        if (!productResponse.ok) {
          const errorText = await productResponse.text()
          throw new Error(`Failed to update Stripe product: ${errorText}`)
        }
      }
    }
    
    if (!productId) {
      // Create new product
      const productResponse = await fetch('https://api.stripe.com/v1/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${stripeSecretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Stripe-Account': stripe_account_id,
        },
        body: new URLSearchParams({
          name: name,
          description: description || '',
          type: 'service',
        }),
      })

      if (!productResponse.ok) {
        const errorText = await productResponse.text()
        throw new Error(`Failed to create Stripe product: ${errorText}`)
      }

      const productData = await productResponse.json()
      productId = productData.id
    }

    // Create Stripe price
    const priceParams = new URLSearchParams({
      product: productId,
      unit_amount: price_amount.toString(),
      currency: 'usd',
    })

    if (type === 'subscription' && billing_interval) {
      priceParams.append('recurring[interval]', billing_interval)
    }

    const priceResponse = await fetch('https://api.stripe.com/v1/prices', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Stripe-Account': stripe_account_id,
      },
      body: priceParams,
    })

    if (!priceResponse.ok) {
      const errorText = await priceResponse.text()
      throw new Error(`Failed to create Stripe price: ${errorText}`)
    }

    const priceData = await priceResponse.json()

    return new Response(
      JSON.stringify({
        success: true,
        product_id: productId,
        price_id: priceData.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in create-stripe-service:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to create Stripe service'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})