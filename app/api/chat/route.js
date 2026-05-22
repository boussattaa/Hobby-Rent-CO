import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@/utils/supabase/server';
import { sendEmail } from '@/utils/resend';

export async function POST(req) {
  try {
    const { messages } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      console.warn('GearBuddy: Missing OPENAI_API_KEY, responding with warning fallback');
      return NextResponse.json({
        message: {
          role: 'assistant',
          content: `⚠️ **GearBuddy Configuration Warning**:\n\nThe \`OPENAI_API_KEY\` environment variable is not configured in your \`.env.local\` file. Please add it to unlock my full AI capabilities.\n\nIn the meantime, here is some information about **HobbyRent**:\n- **What is HobbyRent?** It's a peer-to-peer rental marketplace for outdoor gear, trailers, offroad vehicles, and watersports equipment.\n- **How does earning work?** Owners can list their gear and set daily rates. For trailers, the average rate is **$80/day**, offroad is **$180/day**, watersports is **$220/day**, and tools is **$90/day**.\n- **Verification**: Renters and owners are verified using their phone numbers and IDs to ensure a safe rental experience.`
        }
      });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const systemPrompt = {
      role: 'system',
      content: `You are GearBuddy, the friendly and helpful AI Assistant for hobbyrent.com, a peer-to-peer gear rental marketplace.
Your goals:
1. Help renters find the perfect gear listings. Suggest calling search_listings when they ask for trailers, offroad vehicles, boats, tools, or specify location/price.
2. Help owners estimate their potential earnings for listing gear. If they ask how much they can earn, call calculate_earnings.
3. Capture potential leads for high-value items or general inquiries. If a user is interested in renting something specific, offers their gear, or wants to get in touch, offer to capture their lead by calling capture_lead.

Be enthusiastic, professional, and matching the adventurous spirit of HobbyRent. Keep your responses concise. Highlight specific listings with markdown links if found. Use the layout /item/[id] to link directly to item detail pages.`
    };

    const apiMessages = [systemPrompt, ...messages];

    // Define tools
    const tools = [
      {
        type: 'function',
        function: {
          name: 'search_listings',
          description: 'Search for active rental listings on hobbyrent.com matching query, category, and price range.',
          parameters: {
            type: 'object',
            properties: {
              query: { type: 'string', description: 'Keyword query to search names and descriptions, e.g., "car hauler", "dumpster", "jet ski".' },
              category: { type: 'string', enum: ['offroad', 'water', 'trailers', 'housing'], description: 'The item category.' },
              maxPrice: { type: 'number', description: 'The maximum daily rental price.' }
            }
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'calculate_earnings',
          description: 'Calculate potential earnings for a gear category at a given daily rate.',
          parameters: {
            type: 'object',
            properties: {
              category: { type: 'string', enum: ['offroad', 'water', 'trailers', 'housing'], description: 'The gear category.' },
              rate: { type: 'number', description: 'The daily rate in USD. If not specified, default to category average (trailers: 80, offroad: 180, water: 220, tools/housing: 90).' }
            },
            required: ['category']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'capture_lead',
          description: 'Capture a potential lead (renter/owner contact) and send email notification.',
          parameters: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Full name of the lead.' },
              email: { type: 'string', description: 'Email address of the lead.' },
              phone: { type: 'string', description: 'Optional phone number.' },
              message: { type: 'string', description: 'Brief description of the request or interest.' }
            },
            required: ['name', 'email', 'message']
          }
        }
      }
    ];

    let currentMessages = [...apiMessages];

    // We do a loop for tool calling (up to 3 iterations)
    for (let i = 0; i < 3; i++) {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: currentMessages,
        tools,
        tool_choice: 'auto',
      });

      const responseMessage = completion.choices[0].message;
      currentMessages.push(responseMessage);

      if (!responseMessage.tool_calls || responseMessage.tool_calls.length === 0) {
        break;
      }

      // Process tool calls in parallel or sequence
      for (const toolCall of responseMessage.tool_calls) {
        const { name: functionName, arguments: fnArgsStr } = toolCall.function;
        let fnArgs = {};
        try {
          fnArgs = JSON.parse(fnArgsStr);
        } catch (e) {
          console.error(`Failed to parse arguments for tool ${functionName}:`, fnArgsStr);
        }
        
        let toolResult;

        if (functionName === 'search_listings') {
          toolResult = await searchListingsTool(fnArgs.query, fnArgs.category, fnArgs.maxPrice);
        } else if (functionName === 'calculate_earnings') {
          toolResult = calculateEarningsTool(fnArgs.category, fnArgs.rate);
        } else if (functionName === 'capture_lead') {
          toolResult = await captureLeadTool(fnArgs.name, fnArgs.email, fnArgs.phone, fnArgs.message);
        } else {
          toolResult = { error: `Tool ${functionName} not found.` };
        }

        currentMessages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          name: functionName,
          content: JSON.stringify(toolResult),
        });
      }
    }

    return NextResponse.json({ message: currentMessages[currentMessages.length - 1] });

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Tool Implementation Helper Functions
async function searchListingsTool(query, category, maxPrice) {
  try {
    const supabase = await createClient();
    let qb = supabase.from('items').select('id, name, price, location, category, subcategory, description, image_url');
    if (query) {
      qb = qb.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
    }
    if (category) {
      qb = qb.eq('category', category.toLowerCase());
    }
    if (maxPrice) {
      qb = qb.lte('price', Number(maxPrice));
    }
    const { data, error } = await qb.limit(5);
    if (error) {
      console.error('Supabase query error inside tool:', error);
      return { error: error.message };
    }
    return { listings: data };
  } catch (err) {
    console.error('Exception in searchListingsTool:', err);
    return { error: err.message };
  }
}

function calculateEarningsTool(category, rate) {
  const averages = {
    trailers: 80,
    offroad: 180,
    water: 220,
    housing: 90
  };

  const selectedRate = rate || averages[category] || 100;
  
  // Utilization scenarios: low, medium, high
  const lowDays = 4;
  const midDays = 8;
  const highDays = 12;

  const lowMonthly = selectedRate * lowDays;
  const midMonthly = selectedRate * midDays;
  const highMonthly = selectedRate * highDays;

  return {
    category,
    selectedRate,
    lowUtilization: { days: lowDays, monthly: lowMonthly, yearly: lowMonthly * 12 },
    mediumUtilization: { days: midDays, monthly: midMonthly, yearly: midMonthly * 12 },
    highUtilization: { days: highDays, monthly: highMonthly, yearly: highMonthly * 12 }
  };
}

async function captureLeadTool(name, email, phone, message) {
  try {
    const supabase = await createClient();
    
    // 1. Attempt to save in public.leads table (if exists)
    const { error: dbError } = await supabase
      .from('leads')
      .insert([{ name, email, phone, message }]);

    if (dbError) {
      console.warn('Database save skipped or failed (leads table might need creation):', dbError.message);
    }

    // 2. Trigger email notification via Resend
    const recipient = process.env.ADMIN_EMAIL || 'boussattaa@gmail.com';
    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; background: #ffffff; color: #1e293b;">
        <h2 style="color: #3b82f6; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-top: 0;">New Lead Captured 🎯</h2>
        <p style="font-size: 1rem; line-height: 1.5;">A user submitted their contact info via GearBuddy Chat:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 10px 0; font-weight: bold; width: 120px; border-bottom: 1px solid #f1f5f9;">Name:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; font-weight: bold; border-bottom: 1px solid #f1f5f9;">Email:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;"><a href="mailto:${email}" style="color: #3b82f6; text-decoration: none;">${email}</a></td>
          </tr>
          <tr>
            <td style="padding: 10px 0; font-weight: bold; border-bottom: 1px solid #f1f5f9;">Phone:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">${phone || 'Not provided'}</td>
          </tr>
          <tr style="vertical-align: top;">
            <td style="padding: 10px 0; font-weight: bold; padding-top: 15px;">Message:</td>
            <td style="padding: 10px 0; padding-top: 15px;">
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; white-space: pre-wrap; margin: 0; font-family: inherit; font-size: 0.95rem; color: #334155;">${message}</div>
            </td>
          </tr>
        </table>
        <p style="font-size: 0.8rem; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; margin-bottom: 0; text-align: center;">
          This lead was automatically captured and processed by GearBuddy on HobbyRent.
        </p>
      </div>
    `;

    const { success, error } = await sendEmail({
      to: recipient,
      subject: `[GearBuddy Lead] ${name} is interested!`,
      html: emailHtml
    });

    return {
      success: true,
      databaseSaved: !dbError,
      emailSent: success,
      emailError: error ? error.message : null
    };

  } catch (err) {
    console.error('Exception in captureLeadTool:', err);
    return { success: false, error: err.message };
  }
}
