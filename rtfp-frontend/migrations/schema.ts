import { mysqlTable, mysqlSchema, AnyMySqlColumn, index, uniqueIndex, int, varchar, longtext } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"


export const researchPapers = mysqlTable("research_papers", {
	id: int("id").autoincrement().primaryKey().notNull(),
	key: varchar("key", { length: 300 }).notNull(),
	content: longtext("content"),
},
(table) => {
	return {
		content: index("content").on(table.content),
		key: uniqueIndex("key").on(table.key),
	}
});

export const researchPapersPages = mysqlTable("research_papers_pages", {
	id: int("id").autoincrement().primaryKey().notNull(),
	paperId: int("paper_id").notNull(),
	pageNumber: int("page_number").notNull(),
	content: longtext("content"),
},
(table) => {
	return {
		content: index("content").on(table.content),
		uniquePaperPage: uniqueIndex("unique_paper_page").on(table.paperId, table.pageNumber),
	}
});