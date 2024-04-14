// export const revalidate = 300;
// export const runtime = 'experimental-edge';
// export const preferredRegion = 'fra1';
// export const dynamic = 'error';

import { sql, inArray, eq, and } from 'drizzle-orm';
import { db, openai, getPineconeIndex } from './common';
import { 
    researchPapers as ResearchPapers,
    researchPapersPages as ResearchPapersPages,
} from './schema';

export async function searchArticles(query: string) {
    const researchPapers = await db.select({
        id: ResearchPapers.id,
        key: ResearchPapers.key,
        matchScore: sql<number>`MATCH (content) AGAINST (${query} IN NATURAL LANGUAGE MODE) AS relevance`,
    })
        .from(ResearchPapers)
        .where(sql`MATCH (content) AGAINST (${query} IN NATURAL LANGUAGE MODE)`)
        .orderBy(sql`relevance DESC`);

    // Return early if no results
    if (researchPapers.length === 0)
        return [];

    const relevantPages = await db.select({
        paperId: ResearchPapersPages.paperId,
        pageNumber: ResearchPapersPages.pageNumber,
        matchScore: sql<number>`MATCH (content) AGAINST (${query} IN NATURAL LANGUAGE MODE) AS relevance`,
    })
        .from(ResearchPapersPages)
        .where(and(
            inArray(ResearchPapersPages.paperId, researchPapers.map((paper) => paper.id)), 
            sql`MATCH (content) AGAINST (${query} IN NATURAL LANGUAGE MODE)`))
        .orderBy(sql`relevance DESC`);

    const researchPapersWithScores = new Map<number, { id: number, title: string, matchScore: number, pages: number[] }>();
    researchPapers.map((paper) => {
        researchPapersWithScores.set(paper.id, { id: paper.id, title: paper.key, matchScore: paper.matchScore, pages: [] });
    });

    relevantPages.map((page) => {
        const paper = researchPapersWithScores.get(page.paperId);
        if (!paper) {
            console.log("Paper not found for paper: " + page.paperId + " and page " + page.pageNumber);
            return;
        }
        paper.pages.push(page.pageNumber);
    });

    return Array.from(researchPapersWithScores.values());
}

export async function searchEmbeddings(query: string) {
    let embedding;
    try {
        const embeddingResponse = await openai.createEmbedding({
            model: 'text-embedding-ada-002',
            input: query,
        });
        embedding = embeddingResponse.data.data[0].embedding;
    } catch (e) {
        console.error("Unable to connect to OpenAI:", e);
        return [];
    }

    const index = await getPineconeIndex();

    const queryRequest = {
        vector: embedding,
        topK: 10,
        includeValues: false,
        includeMetadata: true,
        namespace: "papers",
    };

    const pagesReqeust = {
        vector: embedding,
        topK: 100,
        includeValues: false,
        includeMetadata: true,
        namespace: "pages",
    }
    
    let idCounter = 0;
    const researchPapersWithScores = new Map<string, { id: number, title: string, matchScore: number, pages: number[] }>();

    const queryResponse = await index.query({ queryRequest });
    queryResponse.matches?.map((match) => {
        const id = idCounter++;
        researchPapersWithScores.set(match.id, { id, title: match.id, matchScore: match.score ? match.score * 100: -1, pages: [] });
    });

    const pagesResponse = await index.query({ queryRequest: pagesReqeust });
    pagesResponse.matches?.map((match) => {
        const paper = researchPapersWithScores.get((match?.metadata as { paper: string }).paper);
        const page = (match?.metadata as { page_idx: number }).page_idx || 0;
        if (!paper) {
            console.log("Paper not found for page: " + match.id);
            return;
        }

        paper.pages.push(page);
    });

    return Array.from(researchPapersWithScores.values());
}

export async function getContextForPaper(pages: number[], paperId?: number, paperTitle?: string | null) {
    if (pages.length === 0)
        return "";

    if (!paperId && !paperTitle)
        throw new Error("Must provide either paperId or paperTitle");

    if (!paperId && paperTitle) 
        paperId = (await db.select({
            id: ResearchPapers.id,
        })
            .from(ResearchPapers)
            .where(eq(ResearchPapers.key, paperTitle))
            .limit(1))[0].id
    
    if (!paperId)
        throw new Error("Paper not found");

    const content = await db.select({
        content: ResearchPapersPages.content,
    })
        .from(ResearchPapersPages)
        .where(and(
            inArray(ResearchPapersPages.pageNumber, pages),
            eq(ResearchPapersPages.paperId, paperId)))
        .limit(5);

    return content.map((page) => page.content).join("\n");
}

