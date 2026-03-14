import express from "express";
import { ilike, or, and, getTableColumns } from "drizzle-orm";
import { subjects, departments } from "../db/schema";
import { db } from "../db";
import { sql } from "drizzle-orm/sql";
import { eq } from "drizzle-orm";
import { desc } from "drizzle-orm";



const router = express.Router();

// get all subjects with optional search, filtering and pagination 


router.get("/", async (req, res) => {
    try {
        const { search, department, page = 1, limit = 10 } = req.query;
        const currentPage = Math.max(1, +page);
        const limitPage = Math.max(1, +limit);
        const offset = (currentPage - 1) * limitPage;

        const filterConditions = [];

        // If search query exists, filter by subject name OR subject code
        if (search) {
            filterConditions.push(
                or(
                    ilike(subjects.name, `%${search}%`),
                    ilike(subjects.code, `%${search}%`)
                )
            );
        }

        // If department filter exists, add it to the conditions
        if (department) {
            filterConditions.push(
                ilike(departments.name, `%${department}%`)
            )

        }

        // Combine all filters using AND if any exist
        const whereClause = filterConditions.length > 0 ? and(...filterConditions) : undefined;
        const countResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(subjects)
            .leftJoin(departments, eq(subjects.departmentId, departments.id))
            .where(whereClause);


        const totalCount = countResult[0]?.count ?? 0;
        const subjectsList = await db
            .select({
                ...getTableColumns(subjects),
                department: { ...getTableColumns(departments) }
            }).from(subjects)
            .leftJoin(departments, eq(subjects.departmentId, departments.id))
            .where(whereClause)
            .orderBy(desc(subjects.createdAt))
            .limit(limitPage)
            .offset(offset);

        res.status(200).json({
            data: subjectsList,
            pagination: {
                page: currentPage,
                limit: limitPage,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limitPage)
            }
        })




    } catch (e) {
        console.error(`GET /subjects error: ${e}`);
        return res.status(500).json({ error: 'Internal server error' });
    }
})


export default router;
