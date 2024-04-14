"use client"

import Image from 'next/image';

import Clipboard from '@/public/clipboard.svg';

export default async function getContext({ paperId, pages, paperTitle }: { paperId?: number, pages: number[], paperTitle?: string }) {

    const getPaperContext = async () => {
        console.log("querying for context paperid, pages, paperTitle: ", paperId, pages, paperTitle)
        const paperContext = await fetch("/api/context?" + new URLSearchParams({
            paperId: paperId ? paperId.toString() : "",
            pages: JSON.stringify(pages),
            paperName: paperTitle ? paperTitle : "",
        }), {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        }).then(res => res.json())
        console.log("copying to clipboard ", paperContext.content);
        // Copy to clipboard
        navigator.clipboard.writeText(paperContext.content.slice(0, 6000));
    }

    return (
        <button onClick={getPaperContext}>
            <Image src={Clipboard} alt="Copy to clipboard" height={16} width={16} />
        </button>
    )

}