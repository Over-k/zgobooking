// src/app/api/health/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // You can add additional health checks here
        // For example, check database connectivity, redis connectivity, etc.

        const healthData = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            version: process.env.npm_package_version || '1.0.0',
            environment: process.env.NODE_ENV || 'development',
        };

        return NextResponse.json(healthData, { status: 200 });
    } catch (error) {
        console.error('Health check failed:', error);

        return NextResponse.json(
            {
                status: 'unhealthy',
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            },
            { status: 500 }
        );
    }
}

// For backwards compatibility, also handle POST requests
export async function POST() {
    return GET();
}