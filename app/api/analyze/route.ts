import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const payload = await request.json();
        const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK || process.env.N8N_WEBHOOK_URL;

        if (!webhookUrl) {
            return NextResponse.json(
                { error: "Webhook URL not configured on server" },
                { status: 500 }
            );
        }

        const res = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            throw new Error(`External API responded with status: ${res.status}`);
        }

        const data = await res.json();
        return NextResponse.json(data);

    } catch (error: unknown) {
        console.error("API Route Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to fetch from external AI Engine";
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
