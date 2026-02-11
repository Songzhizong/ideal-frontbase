import type { ModelArtifactType, ModelFormat, ModelVisibility } from "../types/project-models"

export interface UploadFormState {
  targetType: "new" | "existing"
  modelId: string
  modelName: string
  visibility: ModelVisibility
  description: string
  uploadMode: "web" | "cli"
  format: ModelFormat
  artifactType: ModelArtifactType
  baseModelVersionId: string
  parameterSize: string
  contextLength: number
  license: string
  quantization: string
  notes: string
  uploadFileName: string
  uploadSizeLabel: string
  uploadProgress: number
}

export const INITIAL_UPLOAD_MODEL_FORM: UploadFormState = {
  targetType: "new",
  modelId: "",
  modelName: "",
  visibility: "Private",
  description: "",
  uploadMode: "web",
  format: "safetensors",
  artifactType: "Full",
  baseModelVersionId: "",
  parameterSize: "7B",
  contextLength: 8192,
  license: "Apache-2.0",
  quantization: "FP16",
  notes: "",
  uploadFileName: "",
  uploadSizeLabel: "0 MB",
  uploadProgress: 0,
}
