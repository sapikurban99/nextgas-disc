import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const payload = await request.json();
        const webhookUrl = process.env.NEXT_PUBLIC_N8N_LINKEDIN_WEBHOOK;

        if (!webhookUrl) {
            return NextResponse.json(
                { error: "Webhook URL untuk LinkedIn Analyzer belum dikonfigurasi di server." },
                { status: 500 }
            );
        }

        const res = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
            // Note: We removed the AbortSignal timeout to let Next.js handle it naturally
            // Next.js API routes on Vercel typically have a 10s-60s timeout depending on the plan.
        });

        if (!res.ok) {
            const errorText = await res.text().catch(() => "Unknown error");
            throw new Error(`External API merespons dengan status: ${res.status} - ${errorText}`);
        }

        const data = await res.json();
        return NextResponse.json(data);

    } catch (error: unknown) {
        console.error("API Route Error (LinkedIn Analysis):", error);

        let errorMessage = "Gagal menghubungi AI Engine untuk analisis LinkedIn.";
        if (error instanceof Error) {
            errorMessage = error.name === 'AbortError' ? "Waktu koneksi habis (Timeout)." : error.message;
        }

        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
