import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/db";
import CheckUser from "@/utils/CheckUser";
import { Numeric, VarChar } from "mssql";

type TagPutParams = {
  transId: number;
  tags: Array<Tag>;
};

export async function GET(req: NextRequest) {
  const userId = await CheckUser(req);
  if (!userId) return NextResponse.json("", { status: 401 });

  const sqlReq = (await connectToDatabase()).request();

  sqlReq.input("userid", userId);
  const result = await sqlReq.query(
    "SELECT tag_id, tag_name from dbo.bm_tags where user_id = @userid and deleted is null"
  );
  return NextResponse.json(result.recordset, { status: 200 });
}

export async function PUT(req: NextRequest) {
  const userId = await CheckUser(req);
  if (!userId) return NextResponse.json("", { status: 401 });

  const params: TagPutParams = await req.json();
  if (!params?.transId)
    return NextResponse.json("Missing transaction ID!", { status: 500 });
  if (!params?.tags || params?.tags.length === 0)
    return NextResponse.json("Missing tags!", { status: 500 });

  const pool = await connectToDatabase();
  const sqlReq = pool.request();
  const trans = await pool.transaction().begin();

  sqlReq.input("transId", params.transId);
  sqlReq.input("userId", userId);

  const result = await sqlReq.query(
    "SELECT 1 from dbo.bm_transaction where trans_id = @transId and userid = @userid and deleted is null"
  );

  if (result.recordset.length === 0)
    return NextResponse.json("Incorrect transaction!", { status: 403 });

  try {
    const newTags = params.tags.filter((i) => !i.tag_id);

    sqlReq.input("tagName", VarChar, "");
    sqlReq.input("tagId", Numeric, 0);

    for (const newTag of newTags) {
      console.debug(newTag, newTag.tag_name);
      sqlReq.replaceInput("tagName", VarChar, newTag.tag_name);
      const newTagId: number = (
        await sqlReq.query(
          "INSERT INTO dbo.bm_tags(user_id, tag_name) output inserted.tag_id VALUES(@userId, @tagName);"
        )
      ).recordset[0]["tag_id"];

      newTag.tag_id = newTagId;
    }

    for (const tag of params.tags) {
      sqlReq.replaceInput("tagId", Numeric, tag.tag_id);
      await sqlReq.query(
        "INSERT INTO dbo.bm_tag_trans(transaction_id, tag_id) VALUES(@transId, @tagId);"
      );
    }
    trans.commit();
    return NextResponse.json("OK", { status: 200 });
  } catch (e) {
    trans.rollback();
    return NextResponse.json(e, { status: 200 });
  }
}

export async function DELETE(req: NextRequest) {
  const userId = await CheckUser(req);
  if (!userId) return NextResponse.json("", { status: 401 });

  const params: TagPutParams = await req.json();
  if (!params?.transId)
    return NextResponse.json("Missing transaction ID!", { status: 500 });
  if (!params?.tags || params?.tags.length === 0)
    return NextResponse.json("Missing tags!", { status: 500 });

  const pool = await connectToDatabase();
  const sqlReq = pool.request();
  const trans = await pool.transaction().begin();

  sqlReq.input("transId", params.transId);
  sqlReq.input("userId", userId);
  sqlReq.input("tagId", params.tags[0].tag_id);

  const result = await sqlReq.query(
    "SELECT 1 from dbo.bm_transaction where trans_id = @transId and userid = @userid and deleted is null"
  );

  if (result.recordset.length === 0)
    return NextResponse.json("Incorrect transaction!", { status: 403 });

  try {
    await sqlReq.query(
      "UPDATE bm_tag_trans SET deleted = 'Y' where transaction_id = @transId and tag_id = @tagId;"
    );
    trans.commit();
    return NextResponse.json("OK", { status: 200 });
  } catch (e) {
    trans.rollback();
    return NextResponse.json(e, { status: 200 });
  }
}
