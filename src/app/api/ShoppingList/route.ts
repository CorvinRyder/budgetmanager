import { connectToDatabase } from "@/db";
// import { NextRequest, NextResponse } from "next/server";
import { NextResponse } from "next/server";

// // Define the type for a shopping list item, matching the frontend
// interface ShoppingItem {
//   item_id: number;
//   item_name: string;
//   brand: string;
//   store_name: string;
//   quantity: number;
//   status: "U" | "C" | "D"; // U: Unchecked, C: Checked, D: Deleted
// }

export async function GET() {
  const pool = await connectToDatabase();
  const trans = pool.transaction();
  await trans.begin();
  const sqlReq = trans.request();
  const result = await sqlReq.query(
    "select shoppinglist_id as item_id, food_name as item_name, brand, store_name, quantity, status from dbo.bm_shoppinglist where status <> 'D'"
  );
  pool.close();
  return NextResponse.json(result.recordset);
}

// The main API handler function
// export default function handler(req: NextApiRequest, res: NextApiResponse) {
//   switch (req.method) {
//     // GET request to retrieve all active items
//     case "GET": {
//       const activeItems = shoppingList.filter((item) => item.status !== "D");
//       res.status(200).json(activeItems);
//       break;
//     }

//     // PUT request to toggle the status of an item
//     case "PUT": {
//       const id = parseInt(req.query.id as string);
//       if (isNaN(id)) {
//         res.status(400).send("Invalid item ID");
//         return;
//       }

//       const item = shoppingList.find((i) => i.item_id === id);

//       if (item) {
//         item.status = item.status === "U" ? "C" : "U";
//         res.status(200).json(item);
//       } else {
//         res.status(404).send("Item not found");
//       }
//       break;
//     }

//     // DELETE request to remove a single item or all items
//     case "DELETE": {
//       const id = req.query.id ? parseInt(req.query.id as string) : null;

//       if (id) {
//         // Delete a single item
//         const item = shoppingList.find((i) => i.item_id === id);
//         if (item) {
//           item.status = "D";
//           res.status(204).send(""); // No content response
//         } else {
//           res.status(404).send("Item not found");
//         }
//       } else {
//         // Delete all items
//         shoppingList.forEach((item) => {
//           item.status = "D";
//         });
//         res.status(204).send(""); // No content response
//       }
//       break;
//     }

//     // Handle unsupported HTTP methods
//     default: {
//       res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
//       res.status(405).end(`Method ${req.method} Not Allowed`);
//     }
//   }
// }
