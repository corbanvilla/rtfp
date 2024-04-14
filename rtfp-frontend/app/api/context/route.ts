import type { NextRequest, NextResponse } from 'next/server';

import { getContextForPaper } from '@/db/search';

export async function GET(
    req: NextRequest,
    res: NextResponse,
) { 
    const { searchParams } = new URL(req.url!);
    const paperId = searchParams.get("paperId");
    const pages = searchParams.get("pages");
    const paperTitle = searchParams.get("paperName");

    console.log("got paperid, pages: ", paperId, pages)

    if (!pages)
        return new Response(JSON.stringify({ error: "Missing pages" }), { status: 400 });

    if (!paperId && !paperTitle)
        return new Response(JSON.stringify({ error: "Must provide either paperId or paperTitle" }), { status: 400 });

    let paperIdInt;
    if (paperId) {
        paperIdInt = parseInt(paperId);
        if (isNaN(paperIdInt))
            return new Response(JSON.stringify({ error: "Invalid paperId" }), { status: 400 });
    }

    let pagesJson;
    try {
        pagesJson = JSON.parse(decodeURI(pages));
    } catch (e) {
        return new Response(JSON.stringify({ error: "Invalid pages" }), { status: 400 });
    }

    const context = await getContextForPaper(pagesJson, paperIdInt, paperTitle);
    console.log("returning context", context);

    return new Response(JSON.stringify({ content: context }));
}
