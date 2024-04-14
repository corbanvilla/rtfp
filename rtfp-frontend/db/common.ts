import { drizzle } from 'drizzle-orm/planetscale-serverless';
import { connect } from '@planetscale/database';

import { PineconeClient } from "@pinecone-database/pinecone";

import { Configuration, OpenAIApi } from "openai";

//@ts-ignore
// import fetchAdapter from '@vespaiach/axios-fetch-adapter';


// Utility type
export type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

const connection = connect({
    host: process.env.DATABASE_HOST,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
});

export const db = drizzle(connection);

export async function getPineconeIndex() {
    const pinecone = new PineconeClient();
    await pinecone.init({
        environment: process.env.PINECONE_REGION!,
        apiKey: process.env.PINECONE_API_KEY!,
    });

    const index = pinecone.Index(process.env.PINECONE_INDEX!);

    return index;
}

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
    // baseOptions: {
    //     adapter: fetchAdapter,
    // }
});
export const openai = new OpenAIApi(configuration);  

// TODO - commonjs

