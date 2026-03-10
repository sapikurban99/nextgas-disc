import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: "File tidak ditemukan." },
                { status: 400 }
            );
        }

        const webhookUrl = process.env.NEXT_PUBLIC_N8N_CV_WEBHOOK;

        if (!webhookUrl) {
            return NextResponse.json(
                { error: "Webhook URL untuk CV Analyzer belum dikonfigurasi di server." },
                { status: 500 }
            );
        }

        // Teruskan FormData langsung ke n8n webhook
        const n8nFormData = new FormData();
        n8nFormData.append('file', file);

        const res = await fetch(webhookUrl, {
            method: 'POST',
            body: n8nFormData
        });

        if (!res.ok) {
            throw new Error(`External API merespons dengan status: ${res.status}`);
        }

        const data = await res.json();
        return NextResponse.json(data);

    } catch (error: unknown) {
        console.error("API Route Error (CV Analysis):", error);
        const errorMessage = error instanceof Error ? error.message : "Gagal menghubungi AI Engine untuk analisis CV.";
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
