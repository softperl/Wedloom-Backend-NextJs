import prisma from "@/src/lib/prisma";
import fs from "fs";
import path from "path";
import searchDB from "./lib/meili-search";

// (async () => {
//   const jsonFilePath = path.join(__dirname, "bangladesh.json");
//   const fileContent = fs.readFileSync(jsonFilePath, "utf-8");
//   const jsonData = JSON.parse(fileContent);
//   const formatedData = jsonData.map((item: any) => ({
//     name: item.name,
//     url: item.website,
//     logo: item.logo,
//     description: item.description,
//     banner: item.banner,
//     userId: "clwkj6j2s0000itfnjy049ggv",
//   }));
//   await prisma.company.createMany({
//     data: formatedData,
//     skipDuplicates: true,
//   });
// })();

(async () => {
  const companies = await prisma.company.findMany();
  console.log(companies[0]);
  const res = await searchDB
    .index("companies")
    .addDocuments(companies, { primaryKey: "url" });
})();

// (async () => {
//   searchDB.index("movies").search("American ninja");
// })();
