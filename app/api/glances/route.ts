import { NextRequest, NextResponse } from "next/server";
import { getServerById, getDefaultServer } from "@/lib/servers";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const serverId = searchParams.get("server");

        const server = serverId ? getServerById(serverId) : getDefaultServer();

        if (!server) {
            return NextResponse.json(
                { error: `Unknown server: ${serverId}` },
                { status: 400 }
            );
        }

        const authString = Buffer.from(`${server.username}:${server.password}`).toString("base64");

        const response = await fetch(server.url, {
            method: "GET",
            headers: {
                Authorization: `Basic ${authString}`,
                "Content-Type": "application/json",
            },
            cache: "no-store",
        });

        if (!response.ok) {
            console.error(`Glances API responded with status: ${response.status} for server: ${server.name}`);
            return NextResponse.json(
                { error: `Failed to fetch metrics from ${server.name}.` },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching Glances data:", error);
        return NextResponse.json(
            { error: "Internal Server Error while communicating with Glances instance." },
            { status: 500 }
        );
    }
}
