import { pool } from "@/config/mySql";
import { NextResponse } from "next/server";

async function ensureTableExists() {
  const createTableQuery = `
        CREATE TABLE IF NOT EXISTS sponsors (
          id INT PRIMARY KEY AUTO_INCREMENT,
          name VARCHAR(255),
          availableDoses INT,
          avatarUrl VARCHAR(255)
        );
      `;
  await pool.query(createTableQuery);
}

// creat sponsors
export async function POST(req) {
  if (req.method === "POST") {
    try {
      // Ensure the table exists
      await ensureTableExists();
      const data = await req.json();
      const { id, name, availableDoses, avatarUrl } = data;
      console.log(data);
      // SQL query to insert data into the sponsors table
      const query = `
            INSERT INTO sponsors (id, name, availableDoses, avatarUrl)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
              name = VALUES(name),
              availableDoses = VALUES(availableDoses),
              avatarUrl = VALUES(avatarUrl);
          `;
      // Execute the query
      const [result] = await pool.query(query, [
        id,
        name,
        availableDoses,
        avatarUrl,
      ]);
      // Send a success response
      return NextResponse.json({
        success: true,
        message: "Data inserted successfully",
        result: result,
        data,
      });
    } catch (error) {
      // Handle any errors
      console.error("Database operation error:", error);
      return NextResponse.json({
        success: false,
        message: "Database operation failed",
        error: error.message,
      });
    }
  } else {
    // If not POST method, send 405 - Method Not Allowed
    return NextResponse.json({ success: false, message: "Method not allowed" });
  }
}

//get sponsors

export async function GET() {
  try {
    // SQL query to select all sponsors
    const query = `SELECT * FROM sponsors;`;

    // Execute the query
    const [sponsors] = await pool.query(query);

    // Check if sponsors exist
    if (sponsors.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No sponsors found",
          sponsors: [],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Send a success response with the fetched data
    return new Response(
      JSON.stringify({
        success: true,
        message: "Sponsors retrieved successfully",
        sponsors: sponsors,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    // Handle any errors
    console.error("Database read operation error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Database read operation failed",
        error: error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// update Sponsors
export async function PUT(req) {
  try {
    const { id, name, availableDoses, avatarUrl, quantity } = await req.json();

   

    // Construct SQL query dynamically based on provided fields
    const fieldsToUpdate = [];
    if (name !== undefined) fieldsToUpdate.push(`name = '${name}'`);
    if (availableDoses !== undefined)
      fieldsToUpdate.push(`availableDoses = ${availableDoses}`);
    if (avatarUrl !== undefined)
      fieldsToUpdate.push(`avatarUrl = '${avatarUrl}'`);
    if (quantity !== undefined)
      fieldsToUpdate.push(`availableDoses = availableDoses - ${quantity}`);
    const query = `
            UPDATE sponsors
            SET ${fieldsToUpdate.join(", ")}
            WHERE id = ${id};
        `;

    // Execute the update query
    const [result] = await pool.query(query);

    if (result.affectedRows === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "No sponsor found with the given ID or no change in data",
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Send a success response
    return new Response(
      JSON.stringify({
        success: true,
        message: "Sponsor updated successfully",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    // Handle any errors
    console.error("Database operation error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Database operation failed",
        error: error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
