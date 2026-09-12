import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ success: false, error: 'Invalid messages' }, { status: 400 });
    }

    const lastMessage = messages[messages.length - 1].content.toLowerCase();
    
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    let response = "I am an AI health assistant. I can provide general nutrition and wellness information, but I cannot diagnose medical conditions. Please consult a healthcare professional for specific medical advice.";

    if (lastMessage.includes('headache') || lastMessage.includes('migraine')) {
      response = "Frequent headaches can be caused by dehydration, stress, lack of sleep, or eye strain. Try drinking a large glass of water and resting your eyes. If severe or persistent, please consult a doctor.";
    } else if (lastMessage.includes('sleep') || lastMessage.includes('insomnia')) {
      response = "For better sleep, try to maintain a consistent sleep schedule, reduce screen time before bed, and ensure your room is cool and dark. You might also want to check out our Sleep Cycle Optimizer tool!";
    } else if (lastMessage.includes('diet') || lastMessage.includes('weight') || lastMessage.includes('calories')) {
      response = "Weight management depends on energy balance. A balanced diet with adequate protein, healthy fats, and fiber is key. Consider using our Macro & Calorie Calculator to find your specific targets.";
    } else if (lastMessage.includes('pain') || lastMessage.includes('hurt')) {
      response = "I'm sorry to hear you're experiencing pain. Because pain can be a symptom of many different conditions, I strongly recommend seeing a healthcare provider for a proper evaluation.";
    } else {
      // Generic response with some simulated intelligence
      response = `That's an interesting question about "${lastMessage.length > 30 ? lastMessage.substring(0, 30) + '...' : lastMessage}". While I can't give specific medical advice, generally speaking, maintaining a balanced diet, staying hydrated, and getting enough rest are foundational to good health. Is there a specific wellness topic you'd like to explore further?`;
    }

    return NextResponse.json({ success: true, response });
  } catch (error: any) {
    console.error('Error in AI Assistant:', error);
    return NextResponse.json({ success: false, error: 'Failed to process request' }, { status: 500 });
  }
}
