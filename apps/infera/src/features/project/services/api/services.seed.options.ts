import type { ServiceWizardOptions } from "../types"

export function createWizardOptions(): ServiceWizardOptions {
  return {
    modelAssets: [
      {
        modelId: "model-chat-r1",
        modelName: "Qwen-Infera-Chat",
        owner: "project",
        tagOptions: ["latest", "prod", "staging"],
        defaultTag: "latest",
        resolvedVersionMap: {
          latest: "mv-chat-2026-02-11",
          prod: "mv-chat-2026-02-01",
          staging: "mv-chat-2026-02-10",
        },
        metadata: {
          parameterSize: "72B",
          contextLength: 32768,
          license: "Apache-2.0",
          quantization: "fp16",
        },
      },
      {
        modelId: "model-vision-v2",
        modelName: "VisionRanker-V2",
        owner: "tenant",
        tagOptions: ["latest", "prod"],
        defaultTag: "latest",
        resolvedVersionMap: {
          latest: "mv-vision-2026-02-10",
          prod: "mv-vision-2026-01-26",
        },
        metadata: {
          parameterSize: "13B",
          contextLength: 8192,
          license: "MIT",
          quantization: "int8",
        },
      },
      {
        modelId: "model-embed-lite",
        modelName: "Embedding-Lite",
        owner: "system",
        tagOptions: ["latest"],
        defaultTag: "latest",
        resolvedVersionMap: {
          latest: "mv-embed-2026-01-22",
        },
        metadata: {
          parameterSize: "1.3B",
          contextLength: 4096,
          license: "Apache-2.0",
          quantization: "fp16",
        },
      },
    ],
    runtimeOptions: [
      {
        runtime: "vLLM",
        label: "vLLM",
        recommendation: "高并发推荐，适合在线 Chat 推理。",
        defaultParams: {
          tensorParallel: "2",
          maxBatchSize: "32",
        },
      },
      {
        runtime: "TGI",
        label: "Text Generation Inference",
        recommendation: "生态成熟，适合快速部署文本生成。",
        defaultParams: {
          maxConcurrentRequests: "256",
          maxInputLength: "8192",
        },
      },
      {
        runtime: "Triton",
        label: "NVIDIA Triton",
        recommendation: "多框架统一推理，适合视觉/混合模型。",
        defaultParams: {
          instanceGroup: "2",
          dynamicBatching: "enabled",
        },
      },
      {
        runtime: "HF",
        label: "HF Predictor",
        recommendation: "轻量模型快速上线，调试成本低。",
        defaultParams: {
          workers: "2",
          torchCompile: "off",
        },
      },
    ],
    resourceProfiles: [
      {
        profileId: "a10-1",
        label: "A10 x1 · 4CPU · 16Gi",
        gpuModel: "A10",
        gpuCount: 1,
        cpuRequest: "4",
        cpuLimit: "8",
        memoryRequest: "16Gi",
        memoryLimit: "32Gi",
        estimatedMonthlyCost: "￥18,400 / 月",
        riskHints: ["高峰时可能出现排队", "建议搭配 Scale-to-zero"],
      },
      {
        profileId: "a100-2",
        label: "A100-80G x2 · 8CPU · 32Gi",
        gpuModel: "A100-80G",
        gpuCount: 2,
        cpuRequest: "8",
        cpuLimit: "16",
        memoryRequest: "32Gi",
        memoryLimit: "64Gi",
        estimatedMonthlyCost: "￥93,000 / 月",
        riskHints: ["成本较高，请结合预算门禁"],
      },
      {
        profileId: "l40s-1",
        label: "L40S x1 · 6CPU · 24Gi",
        gpuModel: "L40S",
        gpuCount: 1,
        cpuRequest: "6",
        cpuLimit: "12",
        memoryRequest: "24Gi",
        memoryLimit: "48Gi",
        estimatedMonthlyCost: "￥35,600 / 月",
        riskHints: ["适合中等吞吐量服务"],
      },
    ],
    environmentOptions: ["Dev", "Test", "Prod"],
    prodPolicy: {
      scaleToZeroAllowed: false,
      note: "Prod 环境默认禁止 Scale-to-zero，避免冷启动影响稳定性。",
    },
  }
}
