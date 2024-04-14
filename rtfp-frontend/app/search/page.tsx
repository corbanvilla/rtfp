// export const revalidate = 300;
// export const runtime = 'experimental-edge';
// export const preferredRegion = 'fra1';
// export const dynamic = 'error';

import Link from "next/link";

//@ts-ignore
import { say } from "cowsay2";
//@ts-ignore
import * as fortune from "random-fortune";

import { searchArticles, searchEmbeddings } from "@/db/search";

import Keydown from './keydown';
import GetPaperContext from './copyContext';

import { Suspense } from "react";


const SearchResults = (async({ query }: { query: string }) => {
    if (!query)
        return <></>
    
    const [mysqlPapers, vectorPapers] = await Promise.all(
        [searchArticles(query), searchEmbeddings(query)]
    );


    return (
        <div className="grid grid-cols-2 gap-4">
            {/* Pinecone Results */}
            <div className="col-span-1 flex flex-col gap-6 pt-6">
                <h1 className="font-normal justify-center items-center text-lg text-center">Pinecone</h1>
                <div className="border-b border-black"/>
                {
                    vectorPapers && vectorPapers.map((paper) => {
                        return (
                            <PaperResult key={paper.title} title={paper.title} matchScore={Math.round(paper.matchScore || 0)} pages={paper.pages} />
                        )
                    })
                }
                {
                    vectorPapers.length == 0 && <h1 className="text-center">No results found</h1>
                }
            </div>
            {/* Mysql Results */}
            <div className="col-span-1 flex flex-col gap-6 pt-6">
                <h1 className="font-normal justify-center items-center text-lg text-center">MySQL</h1>
                <div className="border-b border-black"/>
                {
                    mysqlPapers && mysqlPapers.map((paper) => {
                        return (
                            <PaperResult key={paper.title} title={paper.title} matchScore={Math.round(paper.matchScore || 0)} pages={paper.pages} paperId={paper.id} />
                        )
                    })
                }
                {
                    mysqlPapers.length == 0 && <h1 className="text-center">No results found</h1>
                }
            </div>
        </div>

    )
});



const CowsayPlaceholder = () => {
    return (
        <pre>
            <code>
                {say(fortune.fortune())}
            </code>
        </pre>
    )
}


const PaperResult = ({ title, matchScore, pages, paperId }: { title: string, matchScore: number, pages: number[], paperId?: number }) => {
    return (
        <>
            <div className="flex flex-row items-center gap-3">
                <div className="flex flex-col items-center gap-2">
                    <h1 className="text-3xl font-semibold peer min-w-[70px] text-end">{matchScore}%</h1>
                    {/* @ts-ignore */}
                    <GetPaperContext pages={pages} paperId={paperId} paperTitle={title}/>
                </div>
                <div className="flex flex-col gap-2">
                    <Link href={`${process.env.S3_ACCESS_URL}/${encodeURI(title)}`} target="_blank">
                        <h1 className="text-base font-light break-all peer-hover:text-sky-600 hover:text-sky-600">{title}</h1>
                        { pages && pages.length > 0 && <h1 className="text-sm font-medium peer-hover:text-sky-600 hover:text-sky-600">Pages: {pages.join(', ')}</h1> }
                    </Link>
                </div>
            </div>
        </>
    )
}


export default function Page({ searchParams }: { searchParams: URLSearchParams }) {
    //@ts-ignore
    const query = searchParams['q'];

    // decode uri
    const decoded = decodeURI(query);

    return (
        <>
            <Keydown /> 
            <div className="flex items-center justify-center my-10">
                <div className="w-full max-w-[700px]">
                    <div className="flex items-center justify-center">
                        <h1 className="text-2xl font-light">Searching: {query}</h1>
                    </div>
                    <Suspense fallback={CowsayPlaceholder()}>
                        {/* @ts-ignore */}
                        <SearchResults query={decoded} />
                    </Suspense>
                </div>
            </div>
        </>
    )
}