import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { PrismaInstrumentation } from "@prisma/instrumentation";

const traceExporter = new OTLPTraceExporter();

const sdk = new NodeSDK({
    traceExporter,
    instrumentations: [
        getNodeAutoInstrumentations(),
        new PrismaInstrumentation(),
    ],
});

// eslint-disable-next-line @typescript-eslint/no-floating-promises
sdk.start().then(() => {
    // eslint-disable-next-line no-console
    console.log(`✅ OTLP ready`);
});
